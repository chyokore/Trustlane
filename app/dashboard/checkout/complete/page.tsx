"use client";
import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaymentVerificationCard, type VerificationReceipt } from "@/components/verification/payment-verification-card";
import { Button } from "@/components/ui/button";
import { isStableCheckoutUserId } from "@/lib/checkout-identity";
import { dashboardStorage } from "@/lib/dashboard-storage";
import type { HostedCheckoutSession, OrderStatus } from "@/types/dashboard-state";

type ResultStatus = "checking" | "completed" | "failed" | "pending" | "awaiting_result" | "missing" | "timed_out";
const pollIntervalMs = 3000;
const pollTimeoutMs = 60000;

export default function HostedCheckoutCompletePage() {
  const [session, setSession] = useState<HostedCheckoutSession>();
  const [status, setStatus] = useState<ResultStatus>("checking");
  const [transactionId, setTransactionId] = useState<string>();
  const [replayOpen, setReplayOpen] = useState(false);
  const startedAt = useRef(Date.now());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const check = useCallback(async (active: HostedCheckoutSession) => {
    const stableUserId = dashboardStorage.getCheckoutUserId();
    if (!isStableCheckoutUserId(stableUserId)) { setStatus("missing"); return; }
    setStatus((current) => current === "awaiting_result" ? current : "checking");
    try {
      const response = await fetch("/api/prava/payment-result", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: active.sessionId, stableUserId }) });
      const result = await response.json() as { status?: "completed" | "failed" | "pending" | "awaiting_result"; transactionId?: string };
      if (!response.ok || !result.status) throw new Error();
      setTransactionId(result.transactionId); setStatus(result.status);
      const nextStatus: OrderStatus = result.status === "completed" ? "Completed" : result.status === "failed" ? "Failed" : result.status === "awaiting_result" ? "Authorized / Awaiting Merchant Execution" : "Sandbox Pending";
      dashboardStorage.setOrders(dashboardStorage.getOrders().map((attempt) => attempt.sessionId === active.sessionId ? { ...attempt, status: nextStatus, transactionId: result.transactionId ?? attempt.transactionId } : attempt));
      if (result.status === "completed") void fetch("/api/senso/outcome", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchant: active.merchant, product: active.product, amount: active.amount, transactionId: result.transactionId ?? active.orderId, ledgerId: active.ledgerId, timestamp: new Date().toISOString() }) });
      if ((result.status === "pending" || result.status === "awaiting_result") && Date.now() - startedAt.current < pollTimeoutMs) timer.current = setTimeout(() => void check(active), pollIntervalMs);
      else if (result.status === "pending" || result.status === "awaiting_result") setStatus("timed_out");
    } catch { if (Date.now() - startedAt.current < pollTimeoutMs) timer.current = setTimeout(() => void check(active), pollIntervalMs); else setStatus("timed_out"); }
  }, []);
  useEffect(() => { const active = dashboardStorage.getHostedSession(); setSession(active); if (!active) { setStatus("missing"); return; } startedAt.current = Date.now(); void check(active); return () => { if (timer.current) clearTimeout(timer.current); }; }, [check]);
  if (status === "missing") return <main className="mx-auto max-w-2xl px-4 py-10"><section className="rounded-2xl border border-border bg-card/60 p-6"><CircleAlert className="size-6 text-amber-300" /><h1 className="mt-3 text-xl font-semibold">Hosted checkout session not found</h1><p className="mt-2 text-sm text-muted-foreground">Return to the approval panel to start a new secure Prava checkout session.</p></section></main>;
  if (!session) return <main className="mx-auto max-w-2xl px-4 py-10"><LoaderCircle className="size-6 animate-spin text-primary" />Checking payment…</main>;
  const receipt: VerificationReceipt = { merchant: session.merchant, product: session.product, amount: session.amount, currency: session.currency, transactionId, pravaSessionId: session.sessionId, timestamp: new Date().toISOString(), ledgerId: session.ledgerId, status: "succeeded" };
  const title = status === "completed" ? "Payment and merchant execution completed" : status === "failed" ? "Checkout failed" : status === "awaiting_result" ? "Prava authorization completed — merchant execution pending" : status === "timed_out" ? "Status check paused" : "Secure checkout is still processing";
  return <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Prava hosted checkout</p><h1 className="mt-1 text-3xl font-semibold">{title}</h1>{status === "completed" ? <><div className="mt-6"><PaymentVerificationCard receipt={receipt} onReplay={() => setReplayOpen((open) => !open)} /></div>{replayOpen && <ol className="mt-5 space-y-2 text-sm"><li>Checkout session created</li><li>User redirected</li><li>Prava authorization received</li><li>Merchant execution approved</li><li>Final completion</li></ol>}</> : <section className="mt-6 rounded-2xl border border-border bg-card/60 p-6"><p className="text-sm text-muted-foreground">{status === "awaiting_result" ? "Prava authorization completed — merchant execution pending. TrustLane will not label this payment complete until Prava returns completed." : status === "failed" ? "Prava reported a final checkout failure." : "Prava has not returned a final result. No completion has been inferred."}</p><Button className="mt-5" onClick={() => { startedAt.current = Date.now(); void check(session); }} variant="outline"><RefreshCw className="mr-2 size-4" />Check payment result</Button></section>}</main>;
}
