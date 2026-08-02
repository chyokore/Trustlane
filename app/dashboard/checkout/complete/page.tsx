"use client";
import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaymentVerificationCard, type VerificationReceipt } from "@/components/verification/payment-verification-card";
import { Button } from "@/components/ui/button";
import { isStableCheckoutUserId } from "@/lib/checkout-identity";
import { dashboardStorage } from "@/lib/dashboard-storage";
import type { CheckoutAttempt, OrderStatus } from "@/types/dashboard-state";

type ResultStatus = "checking" | "completed" | "failed" | "pending" | "awaiting_result" | "missing" | "timed_out";
interface ActiveCheckout { sessionId: string; orderId?: string; attempt?: CheckoutAttempt; }
const pollIntervalMs = 3000;
const pollTimeoutMs = 60000;

export default function HostedCheckoutCompletePage() {
  const [active, setActive] = useState<ActiveCheckout>();
  const [status, setStatus] = useState<ResultStatus>("checking");
  const [transactionId, setTransactionId] = useState<string>();
  const [replayOpen, setReplayOpen] = useState(false);
  const startedAt = useRef(Date.now());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const check = useCallback(async (checkout: ActiveCheckout) => {
    const stableUserId = dashboardStorage.getCheckoutUserId();
    if (!isStableCheckoutUserId(stableUserId)) { setStatus("missing"); return; }
    setStatus((current) => current === "awaiting_result" ? current : "checking");
    try {
      const response = await fetch("/api/prava/payment-result", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: checkout.sessionId, stableUserId }) });
      const result = await response.json() as { status?: "completed" | "failed" | "pending" | "awaiting_result"; transactionId?: string };
      if (!response.ok || !result.status) throw new Error();
      setTransactionId(result.transactionId); setStatus(result.status);
      const mappedStatus: OrderStatus = result.status === "completed" ? "Completed" : result.status === "failed" ? "Failed" : result.status === "awaiting_result" ? "Authorized / Awaiting Merchant Execution" : "Sandbox Pending";
      const updated = dashboardStorage.updateOrder({ sessionId: checkout.sessionId }, { status: mappedStatus, transactionId: result.transactionId });
      const now = new Date().toISOString();
      if (result.status === "awaiting_result") { dashboardStorage.addOrderEvent({ sessionId: checkout.sessionId }, { type: "authorization_completed", label: "Prava authorization completed", timestamp: now }); dashboardStorage.addOrderEvent({ sessionId: checkout.sessionId }, { type: "merchant_execution_pending", label: "Merchant execution pending", timestamp: now }); }
      if (result.status === "completed") dashboardStorage.addOrderEvent({ sessionId: checkout.sessionId }, { type: "completed", label: "Completed", timestamp: now });
      if (result.status === "failed") dashboardStorage.addOrderEvent({ sessionId: checkout.sessionId }, { type: "failed", label: "Failed", timestamp: now });
      const refreshed = dashboardStorage.findOrder({ sessionId: checkout.sessionId }) ?? updated ?? checkout.attempt;
      if (refreshed) setActive((current) => current ? { ...current, attempt: refreshed } : current);
      if (result.status === "completed" && refreshed) void fetch("/api/senso/outcome", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchant: refreshed.merchant, product: refreshed.product, amount: refreshed.amount, transactionId: result.transactionId ?? refreshed.orderId ?? checkout.orderId ?? checkout.sessionId, ledgerId: refreshed.ledgerId ?? refreshed.decisionLedgerId, timestamp: now }) });
      if ((result.status === "pending" || result.status === "awaiting_result") && Date.now() - startedAt.current < pollTimeoutMs) timer.current = setTimeout(() => void check(checkout), pollIntervalMs);
      else if (result.status === "pending" || result.status === "awaiting_result") setStatus("timed_out");
    } catch { if (Date.now() - startedAt.current < pollTimeoutMs) timer.current = setTimeout(() => void check(checkout), pollIntervalMs); else setStatus("timed_out"); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySessionId = params.get("sessionId") ?? params.get("session_id") ?? undefined;
    const queryOrderId = params.get("orderId") ?? params.get("order_id") ?? undefined;
    const storedSession = dashboardStorage.getHostedSession();
    const sessionId = querySessionId ?? storedSession?.sessionId;
    if (!sessionId || !/^[a-zA-Z0-9_-]{6,200}$/.test(sessionId)) { setStatus("missing"); return; }
    const checkout: ActiveCheckout = { sessionId, orderId: queryOrderId ?? storedSession?.orderId, attempt: dashboardStorage.findOrder({ sessionId }) };
    setActive(checkout); startedAt.current = Date.now(); void check(checkout);
    const unsubscribe = dashboardStorage.subscribeOrders((attempts) => setActive((current) => current ? { ...current, attempt: attempts.find((item) => item.sessionId === current.sessionId) ?? current.attempt } : current));
    return () => { unsubscribe(); if (timer.current) clearTimeout(timer.current); };
  }, [check]);

  if (status === "missing") return <main className="mx-auto max-w-2xl px-4 py-10"><section className="rounded-2xl border border-border bg-card/60 p-6"><CircleAlert className="size-6 text-amber-300" /><h1 className="mt-3 text-xl font-semibold">Hosted checkout session not found</h1><p className="mt-2 text-sm text-muted-foreground">Return to the approval panel to start a new secure Prava checkout session.</p></section></main>;
  if (!active) return <main className="mx-auto max-w-2xl px-4 py-10"><LoaderCircle className="size-6 animate-spin text-primary" />Checking payment…</main>;
  const attempt = active.attempt;
  const receipt: VerificationReceipt | undefined = attempt ? { merchant: attempt.merchant, product: attempt.product, amount: attempt.amount, currency: attempt.currency, transactionId, pravaSessionId: active.sessionId, timestamp: new Date().toISOString(), ledgerId: attempt.ledgerId ?? attempt.decisionLedgerId ?? "Unavailable", status: "succeeded" } : undefined;
  const title = status === "completed" ? "Payment and merchant execution completed" : status === "failed" ? "Checkout failed" : status === "awaiting_result" ? "Prava authorization completed — merchant execution pending" : status === "timed_out" ? "Status check paused" : "Secure checkout is still processing";
  return <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Prava hosted checkout</p><h1 className="mt-1 text-3xl font-semibold">{title}</h1>{status === "completed" && receipt ? <><div className="mt-6"><PaymentVerificationCard receipt={receipt} onReplay={() => setReplayOpen((open) => !open)} /></div>{replayOpen && <ol className="mt-5 space-y-2 text-sm">{attempt?.events?.map((event) => <li key={event.type}>{event.label}</li>)}</ol>}</> : <section className="mt-6 rounded-2xl border border-border bg-card/60 p-6"><p className="text-sm text-muted-foreground">{status === "awaiting_result" ? "Prava authorization completed — merchant execution pending. TrustLane will not label this payment complete until Prava returns completed." : status === "failed" ? "Prava reported a final checkout failure." : "Prava has not returned a final result. No completion has been inferred."}</p>{!attempt && <p className="mt-2 text-xs text-amber-200">The safe session ID was recovered from the callback, but local attempt details are unavailable on this browser.</p>}<Button className="mt-5" onClick={() => { startedAt.current = Date.now(); void check(active); }} variant="outline"><RefreshCw className="mr-2 size-4" />Check payment result</Button></section>}</main>;
}
