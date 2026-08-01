"use client";

import { Bell, ChevronDown, Search, UserRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const languages = ["English", "Español", "Français", "Deutsch", "日本語"];
const currencies = ["USD", "EUR", "GBP", "NGN", "JPY"];

function Selector({ label, options }: { label: string; options: string[] }) {
  const [value, setValue] = useState(options[0]);
  return (
    <label className="relative hidden items-center sm:flex">
      <span className="sr-only">{label}</span>
      <select
        className="h-9 appearance-none rounded-lg border border-border bg-card py-1 pl-3 pr-8 text-xs font-medium text-muted-foreground outline-none transition-colors hover:border-primary/40 focus:border-primary"
        onChange={(event) => setValue(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground"
      />
    </label>
  );
}

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex h-10 items-center justify-between gap-3 pl-12 lg:pl-0">
        <div className="relative max-w-md flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            aria-label="Search TrustLane"
            className="h-10 w-full rounded-xl border border-border bg-card/70 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            placeholder="Search products, merchants, and decisions..."
            type="search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Selector label="Language" options={languages} />
          <Selector label="Currency" options={currencies} />
          <button
            aria-label="View notifications"
            className="relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            type="button"
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
          </button>
          <button
            aria-label="Open user profile"
            className="hidden size-10 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary sm:grid"
            type="button"
          >
            <UserRound className="size-[18px]" />
          </button>
          <div className="hidden items-center gap-1 md:flex">
            <Button size="sm" variant="ghost">
              Sign In
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
