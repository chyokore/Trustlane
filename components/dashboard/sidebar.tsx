"use client";

import { Bookmark, Bot, ChartNoAxesCombined, Menu, PackageCheck, ReceiptText, Settings, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", icon: ChartNoAxesCombined, href: "/dashboard" },
  { label: "Shop", icon: ShoppingBag, href: "#shop" },
  { label: "My Agents", icon: Bot, href: "#agents" },
  { label: "Decision Ledger", icon: ReceiptText, href: "#ledger" },
  { label: "Orders", icon: PackageCheck, href: "#orders" },
  { label: "Saved", icon: Bookmark, href: "#saved" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <nav aria-label="Dashboard navigation" className="space-y-1">{navigation.map(({ label, icon: Icon, href }) => <a className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", label === "Dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")} href={href} key={label} onClick={onNavigate}><Icon className="size-[18px]" />{label}</a>)}</nav>;
}

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return <>
    <button aria-label="Open dashboard navigation" className="fixed left-4 top-4 z-[60] grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground lg:hidden" onClick={() => setMobileOpen(true)} type="button"><Menu className="size-5" /></button>
    {mobileOpen && <button aria-label="Close dashboard navigation" className="fixed inset-0 z-[55] bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} type="button" />}
    <aside className={cn("fixed inset-y-0 left-0 z-[60] flex w-72 flex-col border-r border-border bg-background p-5 transition-transform duration-300 lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between"><Logo /><button aria-label="Close dashboard navigation" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setMobileOpen(false)} type="button"><X className="size-5" /></button></div>
      <div className="mt-10 flex-1"><NavLinks onNavigate={() => setMobileOpen(false)} /></div>
      <div className="border-t border-border pt-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" href="#settings"><Settings className="size-[18px]" />Settings</a><div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-4"><p className="text-sm font-medium">Trust, always visible.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Every decision stays clear and in your control.</p></div></div>
    </aside>
  </>;
}
