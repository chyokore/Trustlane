import { ExternalLink, FileJson, ShieldCheck } from "lucide-react";
import Link from "next/link";
import bundle from "@/public/demo-data/evidence-bundle.json";
import research from "@/public/demo-data/latest-research.json";
import ledger from "@/public/demo-data/latest-decision-ledger.json";
import passport from "@/public/demo-data/merchant-passport.json";
import order from "@/public/demo-data/latest-order-attempt.json";
import lifecycle from "@/public/demo-data/verification-lifecycle.json";
import replay from "@/public/demo-data/trust-replay.json";
import { publicLinks } from "@/lib/public-links";

const artifacts = [
  ["Latest Research", "latest-research.json"],
  ["Decision Ledger", "latest-decision-ledger.json"],
  ["Agent Execution Log", "agent-execution-log.json"],
  ["Order Attempt", "latest-order-attempt.json"],
  ["Verification Lifecycle", "verification-lifecycle.json"],
  ["Trust Replay", "trust-replay.json"],
  ["Merchant Passport", "merchant-passport.json"],
  ["Evidence Bundle", "evidence-bundle.json"],
  ["Public Schema", "schema.json"],
] as const;
function available(value: { data: unknown }) {
  return !(
    typeof value.data === "object" &&
    value.data &&
    "available" in value.data &&
    value.data.available === false
  );
}

export default function EvidencePage() {
  const providerState =
    bundle.data.currentProviderState ?? "No provider state recorded";
  const cards = [
    [
      "Research Snapshot",
      research,
      "AI research, comparison, risk, and policy outputs",
    ],
    [
      "Decision Ledger",
      ledger,
      "Ranked reasoning, confidence, trade-offs, and evidence",
    ],
    [
      "Merchant Passport",
      passport,
      "Stored merchant context and public evidence sources",
    ],
    [
      "Order Attempt",
      order,
      "Hosted checkout metadata and authentic provider state",
    ],
    [
      "Verification Lifecycle",
      lifecycle,
      "Recorded callback and verification lifecycle events",
    ],
    [
      "Trust Replay",
      replay,
      "The reviewable journey from request through outcome",
    ],
  ] as const;
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="size-5" />
        <p className="text-xs font-semibold uppercase tracking-[.16em]">
          Public judge verification
        </p>
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        TrustLane Evidence Pack
      </h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        A static, sanitized, repository-verifiable view of the latest published
        TrustLane demo journey. This page reads bundled JSON only and never
        accesses browser storage or provider APIs.
      </p>
      <section className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          Current Provider State
        </p>
        <p className="mt-2 text-xl font-semibold">{providerState}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Payment completion is never inferred. Authorization awaiting merchant
          execution remains a non-terminal state.
        </p>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Latest Demo Journey</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([title, artifact, description]) => (
            <article
              className="rounded-2xl border border-border bg-card/60 p-5"
              key={title}
            >
              <div className="flex items-center justify-between gap-3">
                <FileJson className="size-5 text-primary" />
                <span
                  className={`rounded-full px-2 py-1 text-[11px] ${available(artifact) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {available(artifact) ? "Published" : "Awaiting source"}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-xl font-semibold">Public JSON Links</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {artifacts.map(([label, file]) => (
            <a
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm text-primary hover:border-primary/50"
              href={`/demo-data/${file}`}
              key={file}
            >
              {label}
              <ExternalLink className="size-3.5" />
            </a>
          ))}
        </div>
      </section>
      <nav
        aria-label="Public evidence links"
        className="mt-8 flex flex-wrap gap-3"
      >
        <a
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          href={publicLinks.liveApp}
          rel="noopener noreferrer"
          target="_blank"
        >
          Live Application
        </a>
        <a
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          href={publicLinks.demoVideo}
          rel="noopener noreferrer"
          target="_blank"
        >
          Demo Video
        </a>
        <a
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          href={publicLinks.repository}
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub Repository
        </a>
        <Link
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          href="/dashboard/shop"
        >
          Try TrustLane
        </Link>
      </nav>
    </main>
  );
}
