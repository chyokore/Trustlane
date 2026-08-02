"use client";

import {
  Download,
  FileJson,
  FileText,
  GitBranch,
  Landmark,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useHydratedStorage } from "@/hooks/use-hydrated-storage";
import { dashboardStorage } from "@/lib/dashboard-storage";
import { merchantUrlSourceLabel, resolveMerchantUrl } from "@/lib/merchant-url";
import { publicLinks } from "@/lib/public-links";
import { downloadReceiptJson } from "@/lib/receipt-json";
import type { CheckoutAttempt } from "@/types/dashboard-state";
import { DemoStateTransferControls } from "@/components/dashboard/demo-state-transfer-controls";

const cards = [
  ["Merchant Passport", Landmark, "/dashboard/verify#passport"],
  ["Decision Ledger", FileText, "/dashboard/decision-ledger"],
  ["Replay Engine", PlayCircle, "/dashboard/verify#replay"],
  ["Verification Sources", ShieldCheck, "/dashboard/verify#sources"],
  ["Documentation", FileText, "/docs"],
  ["GitHub", GitBranch, publicLinks.repository],
  ["Live Demo", PlayCircle, "/dashboard/shop"],
] as const;

export function VerificationHub() {
  const research = useHydratedStorage(dashboardStorage.getResearch);
  const context = useHydratedStorage(dashboardStorage.getMerchantContext);
  const orders = useHydratedStorage(dashboardStorage.getOrders);
  if (!research.hydrated || !context.hydrated || !orders.hydrated)
    return (
      <main className="mx-auto max-w-[1500px] animate-pulse px-4 py-7 sm:px-6 lg:px-8">
        <div className="h-10 w-64 rounded bg-card" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="h-36 rounded-2xl bg-card/60" key={index} />
          ))}
        </div>
      </main>
    );
  const merchant = research.value?.recommendedProduct;
  const merchantResolution = merchant
    ? resolveMerchantUrl({
        merchant: merchant.merchant,
        citations: context.value?.citations,
        structuredMerchantUrl: (merchant as { merchantUrl?: unknown })
          .merchantUrl,
      })
    : undefined;
  const latestAttempt = orders.value[0];
  const replay: Array<readonly [string, string]> = [
    ["User Request", research.value?.intent.product ?? "No research run"],
    [
      "AI Research",
      research.value
        ? `${research.value.researchSummary.productsCompared} options compared`
        : "Pending",
    ],
    [
      "Merchant Verification",
      research.value?.merchantAnalysis.summary ?? "Pending",
    ],
    [
      "Senso Evidence",
      context.value?.groundedAnswer ??
        "Verified context temporarily unavailable.",
    ],
    [
      "Decision Ledger",
      research.value?.decisionLedger.selectedReason ?? "Pending",
    ],
    ["User Approval", latestAttempt ? "Checkout attempt recorded" : "Pending"],
    ...(latestAttempt?.events?.map(
      (event) => [event.label, event.timestamp] as const,
    ) ?? []),
    ["Checkout Result", latestAttempt?.status ?? "Pending"],
  ];
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Verification center
      </p>
      <h1 className="mt-1 text-3xl font-semibold">TrustLane Verify</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Inspect the evidence, decision trail, and checkout artifacts behind the
        latest commerce recommendation.
      </p>
      <div className="mt-4"><DemoStateTransferControls compact /></div>
      {!research.value && !context.value && orders.value.length === 0 && <section className="mt-5 rounded-2xl border border-border bg-card/60 p-5"><p className="text-sm text-muted-foreground">TrustLane stores guest activity locally in this browser. Activity created on another device will not appear automatically.</p><div className="mt-4 flex flex-wrap items-center gap-3"><Link className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/dashboard/shop">Start Shopping</Link><DemoStateTransferControls compact /></div></section>}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, Icon, href]) => {
          const external = href.startsWith("http");
          const content = (
            <>
              <Icon className="size-5 text-primary" />
              <h2 className="mt-5 font-semibold">{title}</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Open the corresponding verifiable artifact.
              </p>
            </>
          );
          return external ? (
            <a
              className="rounded-2xl border border-border bg-card/60 p-5 transition hover:border-primary/50"
              href={href}
              key={title}
              rel="noopener noreferrer"
              target="_blank"
            >
              {content}
            </a>
          ) : href.startsWith("#") ? (
            <a
              className="rounded-2xl border border-border bg-card/60 p-5 transition hover:border-primary/50"
              href={href}
              key={title}
            >
              {content}
            </a>
          ) : (
            <Link
              className="rounded-2xl border border-border bg-card/60 p-5 transition hover:border-primary/50"
              href={href}
              key={title}
            >
              {content}
            </Link>
          );
        })}
        <a
          className="rounded-2xl border border-border bg-card/60 p-5 transition hover:border-primary/50"
          href="/dashboard/verify#receipt-json"
        >
          <FileJson className="size-5 text-primary" />
          <h2 className="mt-5 font-semibold">Receipt JSON</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Download every sandbox and completed attempt.
          </p>
        </a>
      </section>
      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        <article
          className="rounded-2xl border border-border bg-card/60 p-5"
          id="passport"
        >
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
            Merchant Passport
          </p>
          <h2 className="mt-2 font-semibold">
            {merchant?.merchant ?? "No merchant selected"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {context.value?.groundedAnswer ??
              "Verified context temporarily unavailable."}
          </p>
          <p className="mt-4 text-xs text-primary">
            {context.value?.citations.length ?? 0} returned evidence source(s)
          </p>
          <div className="mt-4 rounded-xl bg-muted/35 p-3 text-xs">
            {merchantResolution ? (
              <>
                <p className="font-medium text-primary">
                  Merchant verified for checkout
                </p>
                <p className="mt-1 text-muted-foreground">
                  {merchantUrlSourceLabel(merchantResolution.source)}
                </p>
                <a
                  className="mt-1 inline-block text-primary hover:underline"
                  href={merchantResolution.origin}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Visit merchant
                </a>
              </>
            ) : (
              <>
                <p className="font-medium text-amber-200">
                  Checkout unavailable until a verified merchant URL is found
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try naming a supported merchant, such as Best Buy, Walmart,
                  Target, or Amazon.
                </p>
              </>
            )}
          </div>
        </article>
        <article
          className="rounded-2xl border border-border bg-card/60 p-5"
          id="replay"
        >
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
            Replay Engine
          </p>
          <ol className="mt-4 space-y-3 border-l border-primary/25 pl-5">
            {replay.map(([title, detail], index) => (
              <li className="relative" key={title}>
                <span className="absolute -left-[29px] grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>
      <section
        className="mt-5 rounded-2xl border border-border bg-card/60 p-5"
        id="sources"
      >
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          Verification Sources
        </p>
        {context.value?.citations.length ? (
          <ul className="mt-4 space-y-2">
            {context.value.citations.map((source, index) => (
              <li className="text-sm" key={`${source.title}-${index}`}>
                {source.url ? (
                  <a
                    className="text-primary hover:underline"
                    href={source.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.title}
                  </a>
                ) : (
                  source.title
                )}
                <span className="ml-2 text-xs text-muted-foreground">
                  {source.relevanceScore !== undefined
                    ? `Relevance ${Math.round(source.relevanceScore * 100)}%`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Verified context temporarily unavailable.
          </p>
        )}
      </section>
      <section
        className="mt-5 rounded-2xl border border-border bg-card/60 p-5"
        id="receipt-json"
      >
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          Receipt JSON
        </p>
        <h2 className="mt-2 font-semibold">Order Attempts</h2>
        {orders.value.length ? (
          <div className="mt-4 space-y-2">
            {orders.value.map((attempt: CheckoutAttempt) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/35 p-3"
                key={attempt.id}
              >
                <span className="text-sm">
                  {attempt.product} · {attempt.status}
                </span>
                <button
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  onClick={() => downloadReceiptJson(attempt)}
                  type="button"
                >
                  <Download className="size-4" />
                  Download JSON
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No checkout attempts recorded yet.
          </p>
        )}
      </section>
    </main>
  );
}
