"use client";

import { useState } from "react";
import { AgentTimeline } from "@/components/shop/agent-timeline";
import {
  ApprovalPanel,
  type CheckoutRecommendation,
} from "@/components/shop/approval-panel";
import { ComparisonCard } from "@/components/shop/comparison-card";
import { DecisionLedger } from "@/components/shop/decision-ledger";
import { IntentCard } from "@/components/shop/intent-card";
import { MerchantReport } from "@/components/verification/merchant-report";
import { ShoppingInput } from "@/components/shop/shopping-input";
import { dashboardStorage } from "@/lib/dashboard-storage";
import type { AgentResult } from "@/types/agents";
import type { Product, ProductImage } from "@/types/shop";
import type { VerifiedMerchantContext } from "@/services/senso";

const products: Product[] = [
  {
    name: "NovaForge 15",
    merchant: "Vertex Computing",
    price: "$1,059",
    trustScore: 96,
    warranty: "2 years",
    returns: "30 days",
    shipping: "Free shipping",
    delivery: "Aug 5–7",
    risk: "Low",
    pros: ["Best verified value", "RTX 4060 graphics"],
    cons: ["15.6-inch display"],
    recommended: true,
    accent: "from-teal-500/80 to-cyan-800",
  },
  {
    name: "Apex R15",
    merchant: "Northstar Electronics",
    price: "$1,149",
    trustScore: 91,
    warranty: "1 year",
    returns: "14 days",
    shipping: "Free shipping",
    delivery: "Aug 6–9",
    risk: "Low",
    pros: ["Higher refresh display", "Extra storage"],
    cons: ["Shorter return window"],
    accent: "from-violet-500/80 to-indigo-900",
  },
  {
    name: "Stratus Pro 16",
    merchant: "DirectTech",
    price: "$1,189",
    trustScore: 88,
    warranty: "1 year",
    returns: "30 days",
    shipping: "$18 shipping",
    delivery: "Aug 7–10",
    risk: "Medium",
    pros: ["16-inch screen", "Lightweight chassis"],
    cons: ["Review signals vary", "Shipping cost"],
    accent: "from-slate-400/80 to-slate-800",
  },
];

export function ShoppingWorkspace() {
  const [result, setResult] = useState<AgentResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [merchantContext, setMerchantContext] =
    useState<VerifiedMerchantContext>();
  const [merchantContextLoading, setMerchantContextLoading] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, ProductImage>>({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const research = async (prompt: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as AgentResult & { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? "AI research could not be completed.");
      setResult(data);
      dashboardStorage.setResearch(data);
      setProductImages({});
      setImagesLoading(true);
      void (async () => {
        const queue = [...data.researchSummary.products];
        const results: Record<string, ProductImage> = {};
        const lookup = async () => {
          const product = queue.shift();
          if (!product) return;
          try {
            const imageResponse = await fetch("/api/product-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: product.name, merchant: product.merchant }) });
            const payload = (await imageResponse.json()) as { image?: ProductImage };
            if (imageResponse.ok && payload.image) { results[product.name] = payload.image; setProductImages({ ...results }); }
          } catch { /* Image availability never blocks research results. */ }
          await lookup();
        };
        await Promise.all([lookup(), lookup()]);
        setImagesLoading(false);
      })();
      setMerchantContextLoading(true);
      setMerchantContext(undefined);
      void fetch("/api/senso/merchant-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant: data.recommendedProduct.merchant }),
      })
        .then(async (contextResponse) => {
          const context = (await contextResponse.json()) as VerifiedMerchantContext;
          if (!contextResponse.ok)
            throw new Error("Verified context temporarily unavailable.");
          setMerchantContext(context);
          dashboardStorage.setMerchantContext(context);
        })
        .catch(() => {
          setMerchantContext({
            merchant: data.recommendedProduct.merchant,
            groundedAnswer: "Verified context temporarily unavailable.",
            citations: [],
            verificationStatus: "unavailable",
          });
        })
        .finally(() => setMerchantContextLoading(false));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "AI research could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  };
  const displayProducts = result
    ? result.researchSummary.products.map((product, index) => ({
        ...product,
        recommended: product.name === result.recommendedProduct.name,
        accent: products[index]?.accent ?? "from-teal-500/80 to-cyan-800",
      }))
    : products;
  const selected =
    result?.recommendedProduct ??
    products.find((product) => product.recommended) ??
    products[0];
  const checkout: CheckoutRecommendation = {
    merchant: selected.merchant,
    merchantUrl: "https://example.com",
    verifiedMerchantUrl: merchantContext?.citations.find((citation) => citation.url)?.url,
    product: selected.name,
    amount: selected.price,
    currency: result?.intent.currency ?? "USD",
    decisionLedgerId: result
      ? `DL-${result.decisionLedger.overallTrustScore}-${result.confidenceScore}`
      : "DL-2026-081-01",
  };
  return (
    <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          TrustLane intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          AI Shopping Workspace
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
          Describe what you want. TrustLane researches, verifies, compares,
          explains every decision, and only purchases after your approval.
        </p>
      </header>
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="space-y-6">
          <ShoppingInput loading={loading} onResearch={research} />
          {error && (
            <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
          <div className="grid gap-6 2xl:grid-cols-[0.85fr_1.15fr]">
            <IntentCard intent={result?.intent} />
            <AgentTimeline running={loading} />
          </div>
          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Product comparison
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                The strongest verified options
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {displayProducts.map((product, index) => (
                <ComparisonCard
                  image={productImages[product.name]}
                  imageLoading={imagesLoading && !productImages[product.name]}
                  index={index}
                  key={product.name}
                  product={product}
                />
              ))}
            </div>
          </section>
          <DecisionLedger context={merchantContext} loading={merchantContextLoading} research={result} />
          <ApprovalPanel context={merchantContext} recommendation={checkout} research={result} />
        </div>
        <MerchantReport context={merchantContext} image={productImages[selected.name]} loading={merchantContextLoading} research={result} />
      </div>
    </main>
  );
}
