"use client";
import {
  Bot,
  Bookmark,
  CheckCircle2,
  FileText,
  PackageCheck,
  Settings2,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoStateTransferControls } from "@/components/dashboard/demo-state-transfer-controls";
import { useHydratedStorage } from "@/hooks/use-hydrated-storage";
import { dashboardStorage } from "@/lib/dashboard-storage";
import type {
  CheckoutAttempt,
  LocalPreferences,
  SavedProduct,
} from "@/types/dashboard-state";
const shell = "mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9";
function Empty({
  title,
  detail,
  action = "Start Shopping",
}: {
  title: string;
  detail: string;
  action?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-8 text-center">
      <ShoppingBag className="mx-auto size-8 text-primary" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {detail}
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard/shop">{action}</Link>
      </Button>
      <div className="mt-3"><DemoStateTransferControls compact /></div>
    </section>
  );
}
function useResearch() {
  const research = useHydratedStorage(dashboardStorage.getResearch);
  return research.hydrated ? research.value : undefined;
}
export function AgentsView() {
  const research = useResearch();
  const names = [
    ["Intent Agent", "Extracts product, budget, and constraints"],
    ["Research Agent", "Builds the option set"],
    ["Merchant Verification Agent", "Assesses seller trust signals"],
    ["Risk Agent", "Reviews product and merchant risks"],
    ["Comparison Agent", "Ranks the strongest choices"],
    ["Decision Agent", "Builds the Decision Ledger"],
  ];
  return (
    <main className={shell}>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Agent operations
      </p>
      <h1 className="mt-1 text-3xl font-semibold">My Agents</h1>
      {!research && <div className="mt-6"><Empty detail="TrustLane stores guest activity locally in this browser. Activity created on another device will not appear automatically." title="No Agent Records" /></div>}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {names.map(([name, purpose], index) => (
          <article
            className="rounded-2xl border border-border bg-card/60 p-5"
            key={name}
          >
            <div className="flex justify-between">
              <Bot className="size-5 text-primary" />
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {research ? "Completed" : index === 0 ? "Ready" : "Waiting"}
              </span>
            </div>
            <h2 className="mt-5 font-semibold">{name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{purpose}</p>
            <p className="mt-5 text-xs text-muted-foreground">
              Last activity: {research ? "Latest research run" : "No run yet"}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
export function LedgerView() {
  const research = useResearch();
  if (!research)
    return (
      <main className={shell}>
        <Empty
          detail="TrustLane stores guest activity locally in this browser. Activity created on another device will not appear automatically."
          title="No Decision Ledger yet"
        />
      </main>
    );
  const ledger = research.decisionLedger;
  return (
    <main className={shell}>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Decision Ledger
      </p>
      <h1 className="mt-1 text-3xl font-semibold">
        {research.recommendedProduct.name}
      </h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card/60 p-5">
          <FileText className="size-5 text-primary" />
          <h2 className="mt-4 font-semibold">Why selected</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {ledger.selectedReason}
          </p>
          <h2 className="mt-5 font-semibold">Trade-offs</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {ledger.tradeOffs}
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card/60 p-5">
          <h2 className="font-semibold">Alternatives rejected</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {ledger.alternativesRejected}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-2xl font-semibold text-primary">
                {research.confidenceScore}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trust score</p>
              <p className="text-2xl font-semibold">
                {ledger.overallTrustScore}/100
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
export function OrdersView() {
  const storage = useHydratedStorage(dashboardStorage.getOrders);
  const orders: CheckoutAttempt[] = storage.hydrated ? storage.value : [];
  return (
    <main className={shell}>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Checkout history
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Orders</h1>
      {orders.length === 0 ? (
        <div className="mt-6">
          <Empty
            detail="Checkout attempts will appear here. Successful entries are only created after Prava confirms success."
            title="No checkout attempts"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card/60 p-4"
              key={order.id}
            >
              <PackageCheck className="size-5 text-primary" />
              <div className="min-w-[180px] flex-1">
                <p className="font-medium">{order.product}</p>
                <p className="text-xs text-muted-foreground">
                  {order.merchant} · {order.timestamp}
                </p>
              </div>
              <p className="font-semibold">
                {order.amount} {order.currency}
              </p>
              <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                {order.status}
                {order.demo ? " · Demo" : ""}
              </span>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
export function SavedView() {
  const storage = useHydratedStorage(dashboardStorage.getSaved);
  const saved: SavedProduct[] = storage.hydrated ? storage.value : [];
  const remove = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    dashboardStorage.setSaved(next);
  };
  return (
    <main className={shell}>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Saved research
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Saved</h1>
      {saved.length === 0 ? (
        <div className="mt-6">
          <Empty
            detail="Save recommended products from a research run to compare them later."
            title="Nothing saved yet"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((item) => (
            <article
              className="rounded-2xl border border-border bg-card/60 p-5"
              key={item.id}
            >
              <Bookmark className="size-5 text-primary" />
              <h2 className="mt-4 font-semibold">{item.name}</h2>
              <p className="text-sm text-muted-foreground">{item.merchant}</p>
              <p className="mt-3 font-semibold">{item.price}</p>
              <Button
                className="mt-5"
                onClick={() => remove(item.id)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Trash2 className="mr-2 size-4" />
                Remove
              </Button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
export function SettingsView() {
  const storage = useHydratedStorage(dashboardStorage.getPreferences);
  const prefs: LocalPreferences | undefined = storage.hydrated ? storage.value : undefined;
  if (!prefs) return null;
  const update = <K extends keyof LocalPreferences>(
    key: K,
    value: LocalPreferences[K],
  ) => {
    const next = { ...prefs, [key]: value };
    dashboardStorage.setPreferences(next);
  };
  return (
    <main className={shell}>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Local preferences
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Settings</h1>
      <section className="mt-6 max-w-2xl rounded-2xl border border-border bg-card/60 p-5">
        <Settings2 className="size-5 text-primary" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Language
            <select
              className="mt-2 w-full rounded-lg border bg-background p-2"
              onChange={(e) => update("language", e.target.value)}
              value={prefs.language}
            >
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
            </select>
          </label>
          <label className="text-sm">
            Currency
            <select
              className="mt-2 w-full rounded-lg border bg-background p-2"
              onChange={(e) => update("currency", e.target.value)}
              value={prefs.currency}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>NGN</option>
            </select>
          </label>
        </div>
        {(["notifications", "approvalRequired", "reducedMotion"] as const).map(
          (key) => (
            <label
              className="mt-5 flex items-center justify-between text-sm"
              key={key}
            >
              <span>
                {key === "approvalRequired"
                  ? "Approval required"
                  : key === "reducedMotion"
                    ? "Reduced motion"
                    : "Notifications"}
              </span>
              <input
                checked={prefs[key]}
                onChange={(e) => update(key, e.target.checked)}
                type="checkbox"
              />
            </label>
          ),
        )}
      </section>
      <section className="mt-5 max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Guest Data</p><h2 className="mt-2 font-semibold">Stored in this browser</h2><p className="mt-2 text-sm text-muted-foreground">Export your demo state to transfer activity to another browser or device.</p><DemoStateTransferControls allowReset /></section>
    </main>
  );
}
