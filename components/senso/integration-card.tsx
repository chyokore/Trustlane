"use client";

import { ShieldCheck } from "lucide-react";
import { dashboardStorage } from "@/lib/dashboard-storage";
import { useHydratedStorage } from "@/hooks/use-hydrated-storage";
import type { VerifiedMerchantContext } from "@/services/senso";

export function SensoIntegrationCard() {
  const storage = useHydratedStorage<VerifiedMerchantContext | undefined>(dashboardStorage.getMerchantContext);
  if (!storage.hydrated) return <aside aria-label="Loading Senso verification" className="h-36 animate-pulse rounded-2xl border border-border bg-card/60 p-5" />;
  const context = storage.value;
  const connected = context?.verificationStatus === "verified";
  return <aside className="rounded-2xl border border-primary/20 bg-card/60 p-5"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h2 className="font-semibold">Senso verification</h2></div><p className="mt-2 text-sm text-muted-foreground">{connected ? "Connected" : "Verified context temporarily unavailable."}</p><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last verification</dt><dd className="text-right font-medium">{context?.verifiedAt ?? "Not available"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Evidence sources</dt><dd className="font-medium">{context?.citations.length ?? 0} available</dd></div></dl></aside>;
}
