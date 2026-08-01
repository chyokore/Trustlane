"use client";
import { PravaSDK } from "@prava-sdk/core";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { dashboardStorage } from "@/lib/dashboard-storage";
import type { AgentResult } from "@/types/agents";
import type { CheckoutAttempt, OrderStatus } from "@/types/dashboard-state";
import type { VerifiedMerchantContext } from "@/services/senso";
export interface CheckoutRecommendation {
  merchant: string;
  merchantUrl: string;
  product: string;
  amount: string;
  currency: string;
  decisionLedgerId: string;
}
interface SessionResponse {
  sessionId?: string;
  sessionToken?: string;
  iframeUrl?: string;
  orderId?: string;
  publishableKey?: string;
  error?: string;
}
type PaymentStatus =
  "idle" | "pending" | "succeeded" | "failed" | "cancelled" | "preview";
interface Receipt {
  merchant: string;
  product: string;
  amount: string;
  currency: string;
  transactionId: string;
  timestamp: string;
  ledgerId: string;
  status: PaymentStatus;
}
function TrustReplay({
  research,
  receipt,
  paymentStartedAt,
  merchantContext,
}: {
  research?: AgentResult;
  receipt?: Receipt;
  paymentStartedAt?: string;
  merchantContext?: VerifiedMerchantContext;
}) {
  const outcome = receipt
    ? receipt.status === "succeeded"
      ? "Payment completed by Prava Sandbox"
      : receipt.status === "preview"
        ? "UI Preview — No Payment Executed"
        : `Payment ${receipt.status}`
    : "Payment outcome pending";
  const steps = [
    [
      "User request",
      research
        ? `Requested ${research.intent.product}`
        : "Shopping request submitted",
    ],
    [
      "Intent extracted",
      research
        ? `${research.intent.product} · ${research.intent.budget}`
        : "Intent awaiting research",
    ],
    [
      "Products researched",
      research
        ? `${research.researchSummary.productsCompared} options evaluated`
        : "Research results pending",
    ],
    [
      "Merchants verified",
      research
        ? research.merchantAnalysis.summary
        : "Merchant analysis pending",
    ],
    [
      "Senso verification",
      merchantContext?.groundedAnswer ?? "Verified context temporarily unavailable.",
    ],
    [
      "Risks assessed",
      research ? research.riskAnalysis.summary : "Risk analysis pending",
    ],
    [
      "Options compared",
      research
        ? (research.comparison.ranking[0]?.reason ?? "Comparison completed")
        : "Comparison pending",
    ],
    [
      "Decision Ledger generated",
      research
        ? `Trust score ${research.decisionLedger.overallTrustScore}/100`
        : "Ledger ready for review",
    ],
    [
      "User approval",
      paymentStartedAt
        ? "Purchase approval recorded"
        : "Awaiting explicit approval",
    ],
    ["Prava payment initiated", paymentStartedAt ?? "Not initiated"],
    ["Payment outcome", outcome],
  ];
  return (
    <ol className="mt-5 space-y-3 border-l border-primary/25 pl-5">
      {steps.map(([title, detail], index) => (
        <li className="relative" key={title}>
          <span className="absolute -left-[29px] grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">
            {index + 1}
          </span>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </li>
      ))}
    </ol>
  );
}
export function ApprovalPanel({
  recommendation,
  research,
  context,
}: {
  recommendation: CheckoutRecommendation;
  research?: AgentResult;
  context?: VerifiedMerchantContext;
}) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [replayOpen, setReplayOpen] = useState(false);
  const [paymentStartedAt, setPaymentStartedAt] = useState<string>();
  const sdk = useRef<PravaSDK | null>(null);
  const destroy = () => {
    sdk.current?.destroy();
    sdk.current = null;
  };
  useEffect(() => () => destroy(), []);
  const diagnose = (label: string, detail?: unknown) => {
    if (process.env.NODE_ENV !== "production")
      console.info(`[TrustLane Prava] ${label}`, detail);
  };
  const recordAttempt = (nextStatus: OrderStatus, demo = false) => {
    const attempt: CheckoutAttempt = {
      id: `${nextStatus}-${Date.now()}`,
      product: recommendation.product,
      merchant: recommendation.merchant,
      amount: recommendation.amount,
      currency: recommendation.currency,
      status: nextStatus,
      timestamp: new Date().toLocaleString(),
      demo,
    };
    dashboardStorage.setOrders([attempt, ...dashboardStorage.getOrders()]);
  };
  const startCheckout = async () => {
    if (loading) return;
    setLoading(true);
    setReady(false);
    setStatus("pending");
    setError(undefined);
    setPaymentStartedAt(new Date().toLocaleString());
    try {
      const response = await fetch("/api/prava/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recommendation),
      });
      const session = (await response.json()) as SessionResponse;
      diagnose("Session response", {
        status: response.status,
        sessionId: session.sessionId,
        hasToken: Boolean(session.sessionToken),
        hasIframeUrl: Boolean(session.iframeUrl),
        hasPublishableKey: Boolean(session.publishableKey),
      });
      if (!response.ok)
        throw new Error(
          session.error ?? "Prava checkout could not be started.",
        );
      if (
        typeof session.sessionId !== "string" ||
        typeof session.sessionToken !== "string" ||
        typeof session.iframeUrl !== "string" ||
        typeof session.publishableKey !== "string" ||
        !session.sessionId ||
        !session.sessionToken ||
        !session.iframeUrl ||
        !session.publishableKey
      )
        throw new Error("Prava returned an incomplete checkout session.");
      const { sessionId, sessionToken, iframeUrl, publishableKey } = session;
      destroy();
      const prava = new PravaSDK({ publishableKey });
      sdk.current = prava;
      await prava.collectPAN({
        sessionToken,
        iframeUrl,
        container: "#prava-checkout",
        onReady: () => setReady(true),
        onSuccess: (result) => {
          destroy();
          setStatus("succeeded");
          const confirmedReceipt: Receipt = {
            merchant: recommendation.merchant,
            product: recommendation.product,
            amount: recommendation.amount,
            currency: recommendation.currency,
            transactionId: result.enrollmentId || session.orderId || sessionId,
            timestamp: new Date().toLocaleString(),
            ledgerId: recommendation.decisionLedgerId,
            status: "succeeded",
          };
          setReceipt(confirmedReceipt);
          recordAttempt("successful");
          void fetch("/api/senso/outcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              merchant: confirmedReceipt.merchant,
              product: confirmedReceipt.product,
              amount: confirmedReceipt.amount,
              transactionId: confirmedReceipt.transactionId,
              ledgerId: confirmedReceipt.ledgerId,
              timestamp: confirmedReceipt.timestamp,
            }),
          }).catch((outcomeError) => diagnose("Senso outcome write unavailable", outcomeError));
        },
        onError: (pravaError) => {
          diagnose("Embedded checkout failed", pravaError);
          destroy();
          setStatus("failed");
          setError(pravaError.message);
          recordAttempt("failed");
        },
        onDismiss: () => {
          destroy();
          setStatus("cancelled");
          recordAttempt("cancelled");
        },
      });
    } catch (caught) {
      diagnose("Embedded checkout error", caught);
      destroy();
      setStatus("failed");
      recordAttempt("failed");
      setError(
        caught instanceof Error
          ? caught.message
          : "Prava checkout could not be started.",
      );
    } finally {
      setLoading(false);
    }
  };
  const preview = () => {
    if (process.env.NODE_ENV === "production") return;
    setReceipt({
      merchant: recommendation.merchant,
      product: recommendation.product,
      amount: recommendation.amount,
      currency: recommendation.currency,
      transactionId: "preview_local_only",
      timestamp: new Date().toLocaleString(),
      ledgerId: recommendation.decisionLedgerId,
      status: "preview",
    });
    setReplayOpen(false);
    recordAttempt("preview", true);
  };
  if (receipt)
    return (
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="size-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.16em]">
            {receipt.status === "preview"
              ? "UI Preview — No Payment Executed"
              : "Purchase Successful"}
          </p>
        </div>
        <h2 className="mt-2 text-xl font-semibold">Trust Receipt</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Product", receipt.product],
            ["Merchant", receipt.merchant],
            ["Amount", receipt.amount],
            ["Currency", receipt.currency],
            ["Transaction ID", receipt.transactionId],
            ["Timestamp", receipt.timestamp],
            ["Decision Ledger ID", receipt.ledgerId],
            [
              "Prava sandbox status",
              receipt.status === "preview" ? "Preview only" : "Successful",
            ],
          ].map(([label, value]) => (
            <div className="rounded-xl bg-background/50 p-3" key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-primary">Protected by Prava Sandbox</p>
        <Button
          className="mt-4"
          onClick={() => setReplayOpen((open) => !open)}
          variant="outline"
        >
          <RotateCcw className="mr-2 size-4" />
          View Replay
        </Button>
        {replayOpen && (
          <TrustReplay
            paymentStartedAt={paymentStartedAt}
            receipt={receipt}
            research={research}
            merchantContext={context}
          />
        )}
      </section>
    );
  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Your approval is required
      </p>
      <h2 className="mt-1 font-semibold">Ready when you are</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        TrustLane will never purchase without your explicit approval.
      </p>
      <div id="prava-checkout" className="mt-4 min-h-0" />
      {loading && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {ready
            ? "Secure Prava checkout is ready."
            : "Opening secure Prava checkout…"}
        </p>
      )}
      {status === "cancelled" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="size-4" />
          Checkout cancelled. No payment was completed.
        </p>
      )}
      {status === "failed" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-300">
          <CircleAlert className="size-4" />
          {error ?? "Prava checkout failed. No payment was completed."}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button disabled={loading} onClick={startCheckout}>
          {loading ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 size-4" />
          )}
          {status === "failed" ? "Retry Checkout" : "Approve Purchase"}
        </Button>
        <Button variant="outline">
          <SlidersHorizontal className="mr-2 size-4" />
          Modify Search
        </Button>
        <Button className="sm:ml-auto" variant="ghost">
          <XCircle className="mr-2 size-4" />
          Reject
        </Button>
      </div>
      {process.env.NODE_ENV !== "production" && (
        <Button className="mt-3" onClick={preview} size="sm" variant="ghost">
          <Clock3 className="mr-2 size-4" />
          Preview Receipt UI
        </Button>
      )}
    </section>
  );
}
