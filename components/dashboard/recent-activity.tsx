"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

import type { ActivityItem } from "@/types/dashboard";

const statusVisuals = { verified: { icon: ShieldCheck, className: "text-primary bg-primary/10" }, review: { icon: Clock3, className: "text-amber-300 bg-amber-400/10" }, approved: { icon: CheckCircle2, className: "text-sky-300 bg-sky-400/10" } };

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return <motion.section animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.4, delay: 0.28 }} className="rounded-2xl border border-border bg-card/60"><div className="flex items-center justify-between border-b border-border px-5 py-5"><div><h2 className="font-semibold">Recent Activity</h2><p className="mt-1 text-sm text-muted-foreground">The latest actions across your TrustLane workspace.</p></div><button className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 sm:flex" type="button">View all <ArrowUpRight className="size-4" /></button></div><div className="divide-y divide-border">{items.map((item) => { const visual = statusVisuals[item.status]; const Icon = visual.icon; return <div className="flex items-center gap-4 px-5 py-4" key={item.title}><span className={`grid size-9 shrink-0 place-items-center rounded-full ${visual.className}`}><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p></div><time className="shrink-0 text-xs text-muted-foreground">{item.time}</time></div>; })}</div></motion.section>;
}
