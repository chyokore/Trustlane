"use client";

import { PravaSDK } from "@prava-sdk/core";
import { CheckCircle2, ExternalLink, LoaderCircle, SlidersHorizontal, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { dashboardStorage } from "@/lib/dashboard-storage";
import { parseCheckoutAmount } from "@/lib/checkout-amount";
import { createStableCheckoutUserId, isStableCheckoutUserId, normalizeCheckoutEmail } from "@/lib/checkout-identity";
import { merchantUrlSourceLabel, type MerchantUrlResolution } from "@/lib/merchant-url";
import type { VerifiedMerchantContext } from "@/services/senso";
import type { AgentResult } from "@/types/agents";
import type { CheckoutAttempt, OrderStatus } from "@/types/dashboard-state";

export interface CheckoutRecommendation { merchant: string; merchantUrl: string; verifiedMerchantUrl?: string; product: string; amount: number; displayAmount: string; currency: string; decisionLedgerId: string; }
interface EmbeddedSessionResponse { sessionId?: string; sessionToken?: string; iframeUrl?: string; orderId?: string; publishableKey?: string; error?: string; }
interface HostedSessionResponse { sessionId?: string; orderId?: string; iframeUrl?: string; expiresAt?: string; error?: string; code?: string; status?: number; }

export function ApprovalPanel({ recommendation, research: _research, context: _context, merchantResolution }: { recommendation: CheckoutRecommendation; research?: AgentResult; context?: VerifiedMerchantContext; merchantResolution?: MerchantUrlResolution; }) {
  const [isCreatingEmbeddedSession, setIsCreatingEmbeddedSession] = useState(false);
  const [isMountingEmbeddedCheckout, setIsMountingEmbeddedCheckout] = useState(false);
  const [embeddedError, setEmbeddedError] = useState<string>();
  const [isCreatingHostedSession, setIsCreatingHostedSession] = useState(false);
  const [hostedError, setHostedError] = useState<{ message: string; code?: string; status?: number }>();
  const [isRedirectingHosted, setIsRedirectingHosted] = useState(false);
  const [hostedCheckoutUrl, setHostedCheckoutUrl] = useState<string>();
  const [hostedNavigationFallbackVisible, setHostedNavigationFallbackVisible] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [stableUserId, setStableUserId] = useState("");
  const hostedInFlight = useRef(false);
  const sdk = useRef<PravaSDK | null>(null);
  const parsedAmount = parseCheckoutAmount(recommendation.amount);
  const amountAvailable = Number.isFinite(parsedAmount);
  const displayAmount = amountAvailable ? recommendation.displayAmount : "Price unavailable";
  const validatedEmail = normalizeCheckoutEmail(customerEmail);
  const checkoutEligible = Boolean(merchantResolution);

  const destroyEmbedded = () => { sdk.current?.destroy(); sdk.current = null; if (typeof document !== "undefined") document.querySelector("#prava-checkout")?.replaceChildren(); };
  useEffect(() => {
    setCustomerEmail(dashboardStorage.getCheckoutEmail());
    const stored = dashboardStorage.getCheckoutUserId();
    const userId = isStableCheckoutUserId(stored) ? stored : createStableCheckoutUserId();
    if (stored !== userId) dashboardStorage.setCheckoutUserId(userId);
    setStableUserId(userId);
    return destroyEmbedded;
  }, []);

  const recordAttempt = (status: OrderStatus, session?: { sessionId?: string; orderId?: string }, transactionId?: string) => {
    const attempt: CheckoutAttempt = { id: session?.sessionId ?? `${status}-${Date.now()}`, sessionId: session?.sessionId, orderId: session?.orderId, checkoutMode: session ? "embedded" : undefined, product: recommendation.product, merchant: recommendation.merchant, amount: displayAmount, currency: recommendation.currency, status, timestamp: new Date().toISOString(), decisionLedgerId: recommendation.decisionLedgerId, transactionId };
    dashboardStorage.setOrders([attempt, ...dashboardStorage.getOrders()]);
  };

  const startEmbeddedCheckout = async () => {
    if (process.env.NODE_ENV === "production" || isCreatingEmbeddedSession || isMountingEmbeddedCheckout || !checkoutEligible || !amountAvailable || !validatedEmail || !isStableCheckoutUserId(stableUserId)) return;
    setEmbeddedError(undefined); setIsCreatingEmbeddedSession(true); destroyEmbedded();
    try {
      const response = await fetch("/api/prava/create-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...recommendation, displayAmount: undefined, amount: parsedAmount, customerEmail: validatedEmail, stableUserId }) });
      const session = await response.json() as EmbeddedSessionResponse;
      if (!response.ok || !session.sessionId || !session.sessionToken || !session.iframeUrl || !session.publishableKey) throw new Error(session.error ?? "Embedded checkout could not be started.");
      setIsCreatingEmbeddedSession(false); setIsMountingEmbeddedCheckout(true);
      const prava = new PravaSDK({ publishableKey: session.publishableKey }); sdk.current = prava;
      await prava.collectPAN({ sessionToken: session.sessionToken, iframeUrl: session.iframeUrl, container: "#prava-checkout", onReady: () => setIsMountingEmbeddedCheckout(false), onSuccess: (result) => { recordAttempt("Completed", session, result.enrollmentId); destroyEmbedded(); }, onError: (error) => { setEmbeddedError(error.message); recordAttempt("Failed", session); destroyEmbedded(); }, onDismiss: () => { recordAttempt("Failed", session); destroyEmbedded(); } });
    } catch (error) { setEmbeddedError(error instanceof Error ? error.message : "Embedded checkout could not be started."); }
    finally { setIsCreatingEmbeddedSession(false); setIsMountingEmbeddedCheckout(false); destroyEmbedded(); }
  };

  const startHostedCheckout = async () => {
    if (isCreatingHostedSession || isRedirectingHosted || hostedInFlight.current || !checkoutEligible) return;
    if (!amountAvailable || !validatedEmail || !isStableCheckoutUserId(stableUserId) || !recommendation.currency || !recommendation.product || !recommendation.merchant) { setHostedError({ message: "Complete a valid checkout email and purchase details before continuing.", code: "invalid_checkout", status: 400 }); return; }
    hostedInFlight.current = true; setIsCreatingHostedSession(true); setIsRedirectingHosted(false); setHostedError(undefined);
    try {
      dashboardStorage.setCheckoutEmail(validatedEmail);
      const response = await fetch("/api/prava/create-hosted-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...recommendation, displayAmount: undefined, amount: parsedAmount, customerEmail: validatedEmail, stableUserId }) });
      const session = await response.json() as HostedSessionResponse;
      let validUrl = false; try { validUrl = Boolean(session.iframeUrl && new URL(session.iframeUrl).protocol === "https:"); } catch { validUrl = false; }
      const expiry = session.expiresAt ? Date.parse(session.expiresAt) : Number.NaN;
      if (!response.ok || !session.sessionId || !session.orderId || !validUrl || !session.iframeUrl || !session.expiresAt || !Number.isFinite(expiry) || expiry <= Date.now()) { setHostedError({ message: session.error ?? "Hosted checkout could not be created.", code: session.code ?? "hosted_checkout_unavailable", status: session.status ?? response.status }); return; }
      const createdAt = new Date().toISOString();
      setHostedCheckoutUrl(session.iframeUrl); setHostedNavigationFallbackVisible(true);
      dashboardStorage.setHostedSession({ sessionId: session.sessionId, orderId: session.orderId, merchant: recommendation.merchant, product: recommendation.product, amount: displayAmount, currency: recommendation.currency, ledgerId: recommendation.decisionLedgerId, createdAt, expiresAt: session.expiresAt });
      const attempt: CheckoutAttempt = { id: `hosted-${session.sessionId}`, sessionId: session.sessionId, orderId: session.orderId, checkoutMode: "hosted", product: recommendation.product, merchant: recommendation.merchant, amount: displayAmount, currency: recommendation.currency, status: "Sandbox Pending", timestamp: createdAt, decisionLedgerId: recommendation.decisionLedgerId };
      dashboardStorage.setOrders([attempt, ...dashboardStorage.getOrders()]);
      setIsRedirectingHosted(true);
      try { window.location.assign(session.iframeUrl); } catch { setIsRedirectingHosted(false); setHostedNavigationFallbackVisible(true); }
    } catch { setIsRedirectingHosted(false); setHostedError({ message: "Hosted checkout could not be created.", code: "hosted_checkout_unavailable", status: 0 }); }
    finally { hostedInFlight.current = false; setIsCreatingHostedSession(false); }
  };

  return <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your approval is required</p><h2 className="mt-1 font-semibold">Ready when you are</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">TrustLane will never purchase without your explicit approval.</p>
    <div className={`mt-4 rounded-xl border p-3 text-sm ${checkoutEligible ? "border-primary/25 bg-primary/5" : "border-amber-400/25 bg-amber-400/10"}`}>{merchantResolution ? <p className="flex flex-wrap items-center gap-2 text-muted-foreground"><span className="font-medium text-primary">Merchant verified for checkout</span><span>· {merchantUrlSourceLabel(merchantResolution.source)}</span><a className="inline-flex items-center gap-1 text-primary hover:underline" href={merchantResolution.origin} rel="noreferrer" target="_blank">Visit merchant <ExternalLink className="size-3" /></a></p> : <p className="font-medium text-amber-100">Checkout unavailable until a verified merchant URL is found</p>}</div>
    <dl className="mt-4 grid gap-2 rounded-xl bg-background/40 p-4 text-sm sm:grid-cols-3"><div><dt className="text-xs text-muted-foreground">Product</dt><dd className="mt-1 font-medium">{recommendation.product}</dd></div><div><dt className="text-xs text-muted-foreground">Merchant</dt><dd className="mt-1 font-medium">{recommendation.merchant}</dd></div><div><dt className="text-xs text-muted-foreground">Purchase amount</dt><dd className="mt-1 font-medium">{displayAmount} {recommendation.currency}</dd></div></dl>
    <label className="mt-4 block text-sm font-medium" htmlFor="checkout-email">Email for secure checkout</label><input autoComplete="email" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" id="checkout-email" onChange={(event) => { setCustomerEmail(event.target.value); dashboardStorage.setCheckoutEmail(event.target.value); }} required type="email" value={customerEmail} />
    {customerEmail && !validatedEmail && <p className="mt-2 text-xs text-red-300">Enter a genuine, non-placeholder email address.</p>}
    <div className="mt-4 rounded-xl border border-primary/20 bg-background/40 p-3 text-sm"><p className="font-medium text-primary">Sandbox Mode</p><p className="mt-1 text-muted-foreground">Uses your assigned Prava sandbox card. No real funds move.</p></div>
    {hostedError && <p className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-100">{hostedError.message}<br /><span className="text-xs">Reference: {hostedError.code ?? "hosted_checkout_unavailable"}/{hostedError.status ?? 0}</span></p>}
    {hostedCheckoutUrl && <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm"><a className="font-medium text-primary hover:underline" href={hostedCheckoutUrl}>Open Prava Checkout</a>{hostedNavigationFallbackVisible && <p className="mt-1 text-muted-foreground">Checkout did not open automatically.</p>}</div>}
    {!amountAvailable && <p className="mt-3 text-sm text-red-300">Price data is unavailable for this recommendation.</p>}
    <Button className="mt-4 w-full" disabled={!checkoutEligible || !amountAvailable || !validatedEmail || !isStableCheckoutUserId(stableUserId) || isCreatingHostedSession || isRedirectingHosted} onClick={startHostedCheckout}>{isCreatingHostedSession || isRedirectingHosted ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}Continue to Secure Prava Checkout</Button>
    <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button variant="outline"><SlidersHorizontal className="mr-2 size-4" />Modify Search</Button><Button className="sm:ml-auto" variant="ghost"><XCircle className="mr-2 size-4" />Reject</Button></div>
    {process.env.NODE_ENV !== "production" && <div className="mt-4 border-t border-border pt-4"><div id="prava-checkout" /><Button disabled={isCreatingEmbeddedSession || isMountingEmbeddedCheckout || !checkoutEligible || !amountAvailable || !validatedEmail} onClick={startEmbeddedCheckout} size="sm" variant="ghost">{isCreatingEmbeddedSession || isMountingEmbeddedCheckout ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Test Embedded Checkout</Button>{embeddedError && <p className="mt-2 text-sm text-red-300">{embeddedError}</p>}</div>}
  </section>;
}
