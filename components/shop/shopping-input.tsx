"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const examples = ["Find the best gaming laptop under $1,200.", "Compare the safest cold wallets.", "Buy noise cancelling headphones under $250.", "Find an ergonomic chair with free shipping."];

export function ShoppingInput() {
  const [value, setValue] = useState("");
  const [recent, setRecent] = useState(["Gaming laptop under $1,200", "Ergonomic chair for a home office"]);
  const startResearch = () => { if (value.trim()) { setRecent((items) => [value.trim(), ...items.slice(0, 2)]); setValue(""); } };
  return <section className="rounded-3xl border border-primary/20 bg-card/80 p-5 shadow-glow sm:p-6">
    <div className="relative"><textarea aria-label="Shopping request" className="min-h-32 w-full resize-none rounded-2xl border border-border bg-background/70 p-4 pr-12 text-base outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/15" onChange={(event) => setValue(event.target.value)} placeholder="What are you looking for today?" value={value} />{value && <button aria-label="Clear search" className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setValue("")}><X className="size-4" /></button>}</div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{examples.map((example) => <button className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary" key={example} onClick={() => setValue(example)}>{example}</button>)}</div><div className="flex gap-2"><Button onClick={() => setValue("")} size="sm" variant="outline">Clear</Button><Button onClick={startResearch} size="sm"><Sparkles className="mr-2 size-4" />Start AI Research</Button></div></div>
    <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent prompts</p><div className="mt-2 flex flex-wrap gap-2">{recent.map((prompt) => <button className="text-sm text-primary/90 hover:text-primary" key={prompt} onClick={() => setValue(prompt)}>{prompt}</button>)}</div></div>
  </section>;
}
