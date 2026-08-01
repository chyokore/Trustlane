import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <a aria-label="TrustLane home" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight" href="#home">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheck aria-hidden="true" className="size-[18px]" />
      </span>
      TrustLane
    </a>
  );
}
