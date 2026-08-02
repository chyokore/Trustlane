"use client";

import { Download, ReceiptText } from "lucide-react";
import { useHydratedStorage } from "@/hooks/use-hydrated-storage";
import { dashboardStorage } from "@/lib/dashboard-storage";
import { downloadReceiptJson } from "@/lib/receipt-json";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoStateTransferControls } from "@/components/dashboard/demo-state-transfer-controls";

export function OrderAttempts() {
  const storage = useHydratedStorage(dashboardStorage.getOrders);
  if (!storage.hydrated)
    return (
      <main className="mx-auto max-w-[1500px] animate-pulse px-4 py-7 sm:px-6 lg:px-8">
        <div className="h-9 w-48 rounded bg-card" />
        <div className="mt-6 h-24 rounded-xl bg-card/60" />
      </main>
    );
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Checkout history
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Order Attempts</h1>
      {storage.value.length ? (
        <div className="mt-6 space-y-3">
          {storage.value.map((attempt) => (
            <article
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card/60 p-4"
              key={attempt.id}
            >
              <ReceiptText className="size-5 text-primary" />
              <div className="min-w-[180px] flex-1">
                <p className="font-medium">{attempt.product}</p>
                <p className="text-xs text-muted-foreground">
                  {attempt.merchant} · {attempt.timestamp}
                </p>
              </div>
              <p className="font-semibold">
                {attempt.amount} {attempt.currency}
              </p>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {attempt.status}
              </span>
              <button
                aria-label={`Download receipt JSON for ${attempt.product}`}
                className="text-primary hover:underline"
                onClick={() => downloadReceiptJson(attempt)}
                type="button"
              >
                <Download className="size-4" />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <section className="mt-6 rounded-2xl border border-border bg-card/60 p-8 text-center">
          <ReceiptText className="mx-auto size-8 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">No order attempts</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            TrustLane stores guest activity locally in this browser. Activity created on another device will not appear automatically.
          </p>
          <div className="mt-5 flex flex-col items-center gap-3"><Button asChild><Link href="/dashboard/shop">Start Shopping</Link></Button><DemoStateTransferControls compact /></div>
        </section>
      )}
    </main>
  );
}
