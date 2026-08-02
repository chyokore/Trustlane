"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { AuthModal } from "@/components/layout/auth-modal";
import { Button } from "@/components/ui/button";

const navigation = [["Product", "/#product"], ["Features", "/#features"], ["How It Works", "/#how-it-works"], ["Why TrustLane", "/#why-trustlane"], ["Architecture", "/#architecture"], ["Docs", "/docs"]] as const;

export function Navbar() {
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <><header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl"><nav aria-label="Main navigation" className="container flex h-[72px] items-center justify-between"><Logo /><div className="hidden items-center gap-7 md:flex">{navigation.map(([item, href]) => <Link className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href={href} key={item}>{item}</Link>)}</div><div className="hidden items-center gap-2 sm:flex"><Button onClick={() => setAuthMode("sign-in")} size="sm" variant="ghost">Sign In</Button><Button onClick={() => setAuthMode("sign-up")} size="sm">Sign Up</Button></div><button aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden" onClick={() => setMobileOpen((open) => !open)} type="button">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></nav>{mobileOpen && <nav aria-label="Mobile navigation" className="container border-t border-border/60 py-4 md:hidden"><div className="grid gap-1">{navigation.map(([item, href]) => <Link className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground" href={href} key={item} onClick={() => setMobileOpen(false)}>{item}</Link>)}</div><div className="mt-3 flex gap-2 sm:hidden"><Button onClick={() => { setMobileOpen(false); setAuthMode("sign-in"); }} size="sm" variant="ghost">Sign In</Button><Button onClick={() => { setMobileOpen(false); setAuthMode("sign-up"); }} size="sm">Sign Up</Button></div></nav>}</header>{authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(undefined)} />}</>;
}
