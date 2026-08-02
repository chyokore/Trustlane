"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
const languages = ["English", "Español", "Français", "Deutsch", "日本語"];
const currencies = ["USD", "EUR", "GBP", "NGN", "JPY"];
function Selector({ label, options }: { label: string; options: string[] }) { const [value, setValue] = useState(options[0]); return <label className="relative flex items-center"><span className="sr-only">{label}</span><select aria-label={label} className="h-9 appearance-none rounded-lg border border-border bg-card py-1 pl-3 pr-8 text-xs font-medium text-muted-foreground outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary" onChange={(event) => setValue(event.target.value)} value={value}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" /></label>; }
export function DashboardTopbar() { return <header className="sticky top-0 z-40 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8"><div className="flex h-10 items-center justify-end gap-2 pl-12 lg:pl-0"><Selector label="Language" options={languages} /><Selector label="Currency" options={currencies} /></div></header>; }
