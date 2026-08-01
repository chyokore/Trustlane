import { AgentTimeline } from "@/components/shop/agent-timeline";
import { ApprovalPanel } from "@/components/shop/approval-panel";
import { ComparisonCard } from "@/components/shop/comparison-card";
import { DecisionLedger } from "@/components/shop/decision-ledger";
import { IntentCard } from "@/components/shop/intent-card";
import { ResearchSummary } from "@/components/shop/research-summary";
import { ShoppingInput } from "@/components/shop/shopping-input";
import type { Product } from "@/types/shop";

const products: Product[] = [
  { name: "NovaForge 15", merchant: "Vertex Computing", price: "$1,059", trustScore: 96, warranty: "2 years", returns: "30 days", shipping: "Free shipping", delivery: "Aug 5–7", risk: "Low", pros: ["Best verified value", "RTX 4060 graphics"], cons: ["15.6-inch display"], recommended: true, accent: "from-teal-500/80 to-cyan-800" },
  { name: "Apex R15", merchant: "Northstar Electronics", price: "$1,149", trustScore: 91, warranty: "1 year", returns: "14 days", shipping: "Free shipping", delivery: "Aug 6–9", risk: "Low", pros: ["Higher refresh display", "Extra storage"], cons: ["Shorter return window"], accent: "from-violet-500/80 to-indigo-900" },
  { name: "Stratus Pro 16", merchant: "DirectTech", price: "$1,189", trustScore: 88, warranty: "1 year", returns: "30 days", shipping: "$18 shipping", delivery: "Aug 7–10", risk: "Medium", pros: ["16-inch screen", "Lightweight chassis"], cons: ["Review signals vary", "Shipping cost"], accent: "from-slate-400/80 to-slate-800" },
];

export function ShoppingWorkspace() { return <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">TrustLane intelligence</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">AI Shopping Workspace</h1><p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">Describe what you want. TrustLane researches, verifies, compares, explains every decision, and only purchases after your approval.</p></header><div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]"><div className="space-y-6"><ShoppingInput /><div className="grid gap-6 2xl:grid-cols-[0.85fr_1.15fr]"><IntentCard /><AgentTimeline /></div><section><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Product comparison</p><h2 className="mt-1 text-xl font-semibold">The strongest verified options</h2></div><div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{products.map((product, index) => <ComparisonCard index={index} key={product.name} product={product} />)}</div></section><DecisionLedger /><ApprovalPanel /></div><ResearchSummary /></div></main>; }
