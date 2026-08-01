"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Building2, CircleDollarSign, ClipboardCheck, ReceiptText } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import type { ActivityItem, DashboardMetric } from "@/types/dashboard";

const metrics: DashboardMetric[] = [
  { label: "Active AI Agents", value: "03", detail: "2 more than last month", icon: Bot, tone: "teal" },
  { label: "Verified Merchants", value: "128", detail: "12 newly verified", icon: Building2, tone: "violet" },
  { label: "Pending Approvals", value: "04", detail: "Review before purchase", icon: ClipboardCheck, tone: "amber" },
  { label: "Spending Limit", value: "$2,500", detail: "$1,240 available this month", icon: CircleDollarSign, tone: "blue" },
];

const activity: ActivityItem[] = [
  { title: "Merchant verified: Nordly Home", detail: "Trust score updated to 96/100", time: "12m ago", status: "verified" },
  { title: "Purchase approval requested", detail: "Your AI agent found a laptop within budget", time: "38m ago", status: "review" },
  { title: "Decision ledger updated", detail: "New recommendation reasoning is ready to review", time: "2h ago", status: "approved" },
  { title: "Merchant verified: The Office Co.", detail: "Trust score updated to 92/100", time: "Yesterday", status: "verified" },
];

export default function DashboardPage() {
  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><motion.section animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.45 }} className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card px-6 py-10 sm:px-10 sm:py-12"><div aria-hidden="true" className="absolute -right-20 -top-28 size-80 rounded-full bg-primary/15 blur-[100px]" /><div className="relative max-w-2xl"><p className="mb-4 text-sm font-semibold text-primary">YOUR TRUSTLAYER</p><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Welcome to TrustLane</h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Shop confidently with AI that explains every decision.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button asChild><a href="#shop">Start Shopping <ArrowRight className="ml-2 size-4" /></a></Button><Button asChild variant="outline"><a href="#ledger"><ReceiptText className="mr-2 size-4" />View Decision Ledger</a></Button></div></div></motion.section><section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric, index) => <MetricCard index={index} key={metric.label} metric={metric} />)}</section><section className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]"><RecentActivity items={activity} /><aside className="rounded-2xl border border-border bg-card/60 p-5"><h2 className="font-semibold">Trust overview</h2><p className="mt-1 text-sm text-muted-foreground">Your commerce activity is protected by transparent review.</p><div className="mt-8"><div className="flex items-end justify-between"><p className="text-3xl font-semibold tracking-tight">94</p><p className="text-xs text-primary">Excellent</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[94%] rounded-full bg-primary" /></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Based on merchant verification, approval controls, and decision transparency.</p></div></aside></section></main>;
}
