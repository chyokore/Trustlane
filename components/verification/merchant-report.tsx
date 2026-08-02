import Image from "next/image";
import dynamic from "next/dynamic";
import { FileCheck2, ShieldCheck } from "lucide-react";
import {
  merchantUrlSourceLabel,
  type MerchantUrlResolution,
} from "@/lib/merchant-url";
import type { VerifiedMerchantContext } from "@/services/senso";
import type { AgentResult } from "@/types/agents";
import type { ProductImage } from "@/types/shop";

const MerchantPassport = dynamic(() =>
  import("@/components/senso/merchant-passport").then(
    (module) => module.MerchantPassport,
  ),
);
const VerifiedSensoContext = dynamic(() =>
  import("@/components/senso/verified-context").then(
    (module) => module.VerifiedSensoContext,
  ),
);

export function MerchantReport({
  research,
  context,
  image,
  loading,
  merchantResolution,
}: {
  research?: AgentResult;
  context?: VerifiedMerchantContext;
  image?: ProductImage;
  loading?: boolean;
  merchantResolution?: MerchantUrlResolution;
}) {
  const product = research?.recommendedProduct;
  if (!product)
    return (
      <aside className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          Research Summary
        </p>
        <h2 className="mt-1 font-semibold">Merchant Report</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Complete a search to generate a sourced merchant report, Decision
          Ledger preview, and verification evidence.
        </p>
      </aside>
    );
  return (
    <aside className="rounded-2xl border border-primary/20 bg-card/60 p-5 xl:sticky xl:top-24">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
        Research Summary
      </p>
      <h2 className="mt-1 font-semibold">Merchant Report</h2>
      <div className="mt-4 flex gap-3">
        <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
          <Image
            alt={image?.altText ?? "TrustLane product placeholder"}
            className="object-contain p-1"
            fill
            sizes="56px"
            src={
              image
                ? `/api/image-proxy?url=${encodeURIComponent(image.imageUrl)}`
                : "/brand/trustlane-shield.svg"
            }
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{product.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Merchant: {product.merchant}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              aria-label="Merchant mark unavailable"
              className="grid size-5 place-items-center rounded-full bg-primary/15 text-[9px] font-bold text-primary"
            >
              {product.merchant.slice(0, 1)}
            </span>
            <span className="text-xs text-primary">
              Trust score {product.trustScore}/100
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-background/40 p-3 text-xs">
        <p className="font-medium">Merchant origin</p>
        {merchantResolution ? (
          <>
            <p className="mt-1 text-muted-foreground">
              {merchantUrlSourceLabel(merchantResolution.source)}
            </p>
            <a
              className="mt-1 inline-block text-primary hover:underline"
              href={merchantResolution.origin}
              rel="noopener noreferrer"
              target="_blank"
            >
              Visit merchant
            </a>
          </>
        ) : (
          <p className="mt-1 text-muted-foreground">
            Checkout unavailable until a verified merchant URL is found.
          </p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/35 p-2">
          <span className="block text-muted-foreground">Delivery</span>
          {product.delivery}
        </div>
        <div className="rounded-lg bg-muted/35 p-2">
          <span className="block text-muted-foreground">Return policy</span>
          {product.returns}
        </div>
      </div>
      <div className="mt-4">
        <VerifiedSensoContext context={context} loading={loading} />
      </div>
      <div className="mt-4">
        <MerchantPassport context={context} />
      </div>
      <section className="mt-4 rounded-xl border border-border bg-background/40 p-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="size-4 text-primary" />
          <p className="text-sm font-medium">Decision Ledger preview</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {research.decisionLedger.selectedReason}
        </p>
        <p className="mt-2 text-xs text-primary">
          Confidence {research.confidenceScore}% · Trust{" "}
          {research.decisionLedger.overallTrustScore}/100
        </p>
      </section>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-primary" />
        Sources are displayed only when returned by Senso.
      </p>
    </aside>
  );
}
