"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileCheck2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { VerifiedSensoContext } from "@/components/senso/verified-context";
import type { VerifiedMerchantContext } from "@/services/senso";
import type { AgentResult } from "@/types/agents";
const reasoning = [
  "Matched the stated $1,200 budget with current verified pricing.",
  "Weighted independent repairability, warranty coverage, and low return friction.",
  "Excluded merchants with unresolved delivery or review-integrity signals.",
];
export function DecisionLedger({ context, research }: { context?: VerifiedMerchantContext; research?: AgentResult }) {
  const [open, setOpen] = useState(false);
  const ledger = research?.decisionLedger;
  const timeline = ledger?.reasoningTimeline ?? reasoning;
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card p-5 sm:p-6">
      <div
        aria-hidden
        className="absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-[80px]"
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <FileCheck2 className="size-5 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Decision Ledger
            </p>
            <h2 className="font-semibold">
              A transparent recommendation, ready for your review
            </h2>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-background/50 p-4">
            <h3 className="text-sm font-semibold">Why this was selected</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {ledger?.selectedReason ?? "The NovaForge 15 pairs the strongest verified merchant record with a 2-year warranty, faster delivery, and the lowest observed risk within your budget."}
            </p>
            <h3 className="mt-4 text-sm font-semibold">
              Alternatives rejected
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {ledger?.alternativesRejected ?? "One option had a shorter warranty; another exceeded budget after shipping and had inconsistent review signals."}
            </p>
          </div>
          <div className="rounded-xl bg-background/50 p-4">
            <h3 className="text-sm font-semibold">Trade-offs considered</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {ledger?.tradeOffs ?? "You trade a slightly smaller display for better return terms and $141 in verified savings."}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              <span>
                Merchant verification: <strong>{ledger?.merchantVerification ?? "Passed"}</strong>
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Confidence score
                </p>
                <p className="text-2xl font-semibold text-primary">{research?.confidenceScore ?? 92}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Overall Trust Score
                </p>
                <p className="text-2xl font-semibold">{ledger?.overallTrustScore ?? 96}/100</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4"><VerifiedSensoContext context={context} /></div>
        <button
          aria-expanded={open}
          aria-controls="decision-reasoning-timeline"
          className="mt-5 flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted/40"
          onClick={() => setOpen(!open)}
          type="button"
        >
          Expandable reasoning timeline{" "}
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              id="decision-reasoning-timeline"
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ol className="space-y-3 border-l border-primary/30 px-5 py-4">
                {timeline.map((item, index) => (
                  <li
                    className="relative text-sm text-muted-foreground"
                    key={item}
                  >
                    <span className="absolute -left-[29px] grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
