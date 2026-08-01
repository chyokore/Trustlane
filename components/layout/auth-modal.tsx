"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function AuthModal({ onClose, mode }: { onClose: () => void; mode: "sign-in" | "sign-up" }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return <div aria-labelledby="account-modal-title" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-background/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }} role="dialog"><section className="w-full max-w-md rounded-2xl border border-primary/25 bg-card p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">TrustLane account</p><h2 className="mt-2 text-xl font-semibold" id="account-modal-title">{mode === "sign-in" ? "Sign in is coming soon" : "Sign up is coming soon"}</h2></div><button aria-label="Close account information" className="grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary" onClick={onClose} ref={closeButton} type="button"><X className="size-4" /></button></div><p className="mt-4 text-sm leading-6 text-muted-foreground">Account features are coming after the hackathon. You can explore the full TrustLane shopping experience as a guest today.</p><div className="mt-6 flex flex-col gap-2 sm:flex-row"><Button asChild><Link href="/dashboard" onClick={onClose}>Continue as Guest</Link></Button><Button onClick={onClose} variant="outline">Close</Button></div></section></div>;
}
