import { ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";
import type { VerifiedMerchantContext } from "@/services/senso";

export function VerifiedSensoContext({ context, loading = false }: { context?: VerifiedMerchantContext; loading?: boolean }) {
  const unavailable = !context || context.verificationStatus === "unavailable";
  return (
    <section aria-label="Verified by Senso" className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-primary"><ShieldCheck className="size-4" /><p className="text-xs font-semibold uppercase tracking-[.14em]">Verified by Senso</p></div>
      <p aria-live="polite" className="mt-2 flex items-center gap-2 text-sm leading-6 text-muted-foreground">{loading && <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />}{loading ? "Verifying merchant with Senso..." : unavailable ? "Verified context temporarily unavailable." : context.groundedAnswer}</p>
      {!unavailable && context.citations.length > 0 && <ul className="mt-3 space-y-2">{context.citations.map((citation, index) => <li className="rounded-lg bg-background/50 px-3 py-2 text-xs" key={`${citation.title}-${index}`}><div className="flex items-start justify-between gap-3"><span className="font-medium">{citation.title}</span>{citation.url && <a aria-label={`Open ${citation.title} source`} className="text-primary hover:underline" href={citation.url} rel="noreferrer" target="_blank"><ExternalLink className="size-3" /></a>}</div><p className="mt-1 text-muted-foreground">{citation.relevanceScore !== undefined ? `Relevance ${Math.round(citation.relevanceScore * 100)}%` : "Relevance not supplied"}{citation.lastVerifiedAt ? ` · Last verified ${citation.lastVerifiedAt}` : ""}</p></li>)}</ul>}
    </section>
  );
}
