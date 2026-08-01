"use client";

import { motion } from "framer-motion";

import type { DashboardMetric } from "@/types/dashboard";

const toneClasses = { teal: "bg-primary/10 text-primary", violet: "bg-violet-400/10 text-violet-300", amber: "bg-amber-400/10 text-amber-300", blue: "bg-sky-400/10 text-sky-300" };

export function MetricCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  const Icon = metric.icon;
  return <motion.article animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.35, delay: index * 0.06 }} className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm"><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${toneClasses[metric.tone]}`}><Icon className="size-5" /></span><span className="text-xs text-muted-foreground">This month</span></div><p className="mt-6 text-2xl font-semibold tracking-tight">{metric.value}</p><p className="mt-1 text-sm font-medium">{metric.label}</p><p className="mt-2 text-xs text-muted-foreground">{metric.detail}</p></motion.article>;
}
