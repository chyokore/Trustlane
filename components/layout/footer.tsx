import { Logo } from "@/components/common/logo";

export function Footer() {
  return <footer className="border-t border-border/70"><div className="container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between"><Logo /><p className="text-sm text-muted-foreground">Built for the Prava Agent Commerce Hackathon</p></div></footer>;
}
