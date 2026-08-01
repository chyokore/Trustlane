"use client";

import { motion } from "framer-motion";
import { Check, Package, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Product, ProductImage } from "@/types/shop";

export function ComparisonCard({
  product,
  index,
  image,
  imageLoading,
}: {
  product: Product;
  index: number;
  image?: ProductImage;
  imageLoading?: boolean;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ delay: index * 0.12 }}
      className={`relative overflow-hidden rounded-2xl border bg-card/75 p-4 ${product.recommended ? "border-primary/60 shadow-glow" : "border-border"}`}
    >
      <div className={`mb-4 relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.accent}`}>
        {image ? <Image alt={image.altText} className="object-contain p-2" fill sizes="(max-width: 768px) 100vw, 33vw" src={`/api/image-proxy?url=${encodeURIComponent(image.imageUrl)}`} unoptimized /> : imageLoading ? <span aria-label="Loading product image" className="size-12 animate-pulse rounded-xl bg-white/25" /> : <Image alt="TrustLane product image unavailable" className="object-contain p-8 opacity-80" fill sizes="128px" src="/brand/trustlane-shield.svg" />}
      </div>
      {image && <a className="-mt-2 mb-3 inline-flex text-[11px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline" href={image.sourceUrl} rel="noreferrer" target="_blank">Image source: {image.sourceDomain}</a>}
      {product.recommended && (
        <span className="absolute left-6 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">
          RECOMMENDED
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sold by {product.merchant}
          </p>
        </div>
        <p className="text-lg font-semibold text-primary">{product.price}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Trust Score</p>
          <p className="mt-1 font-semibold text-primary">
            {product.trustScore}/100
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Risk level</p>
          <p className="mt-1 font-semibold">{product.risk}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Warranty</p>
          <p className="mt-1 font-medium">{product.warranty}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Returns</p>
          <p className="mt-1 font-medium">{product.returns}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Truck className="size-3.5 text-primary" />
          {product.shipping} · {product.delivery}
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-primary" />
          Verified merchant and policy review
        </p>
      </div>
      <div className="mt-4 border-t border-border pt-3 text-xs">
        <p className="font-medium text-foreground">Pros</p>
        {product.pros.map((item) => (
          <p className="mt-1 flex gap-1.5 text-muted-foreground" key={item}>
            <Check className="mt-0.5 size-3 shrink-0 text-primary" />
            {item}
          </p>
        ))}
        <p className="mt-3 font-medium text-foreground">Consider</p>
        {product.cons.map((item) => (
          <p className="mt-1 text-muted-foreground" key={item}>
            • {item}
          </p>
        ))}
      </div>
      <Button
        className="mt-5 w-full"
        size="sm"
        variant={product.recommended ? "default" : "outline"}
      >
        Compare details
      </Button>
    </motion.article>
  );
}
