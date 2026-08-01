"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/common/logo";
import { AuthModal } from "@/components/layout/auth-modal";
import { Button } from "@/components/ui/button";

const navigation = [["Product", "#product"], ["Features", "#features"], ["How It Works", "#how-it-works"], ["Why TrustLane", "#why-trustlane"], ["Architecture", "#architecture"], ["Docs", "/docs"]] as const;

export function Navbar() {
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">();
  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="container flex h-[72px] items-center justify-between"
      >
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {navigation.map(([item, href]) => (
            <a
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={href}
              key={item}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button onClick={() => setAuthMode("sign-in")} size="sm" variant="ghost">Sign In</Button>
          <Button onClick={() => setAuthMode("sign-up")} size="sm">Sign Up</Button>
        </div>
        <button
          aria-label="Open navigation menu"
          className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-card md:hidden"
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </nav>
    </header>
    {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(undefined)} />}
    </>
  );
}
