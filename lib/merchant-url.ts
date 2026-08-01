import type { SensoSourceCitation } from "@/services/senso";

export type MerchantUrlSource = "senso" | "research" | "curated";

export interface MerchantUrlResolution {
  origin: string;
  source: MerchantUrlSource;
}

const curatedMerchantOrigins: Record<string, string> = {
  "best buy": "https://www.bestbuy.com",
  walmart: "https://www.walmart.com",
  target: "https://www.target.com",
  amazon: "https://www.amazon.com",
  "amazon.com": "https://www.amazon.com",
};

function httpsOrigin(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.hostname === "example.com" || parsed.hostname.endsWith(".example.com")) return undefined;
    return parsed.origin;
  } catch {
    return undefined;
  }
}

function citationMatchesMerchant(url: string, merchant: string): boolean {
  const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  const names = merchant.toLowerCase().replace(/\.com$/u, "").match(/[a-z0-9]+/g) ?? [];
  return names.some((name) => name.length > 2 && hostname.split(".").includes(name));
}

/** Resolves only evidence-backed, structured, or explicitly curated merchant origins. */
export function resolveMerchantUrl({ merchant, citations, structuredMerchantUrl }: { merchant: string; citations?: SensoSourceCitation[]; structuredMerchantUrl?: unknown }): MerchantUrlResolution | undefined {
  for (const citation of citations ?? []) {
    const origin = httpsOrigin(citation.url);
    if (origin && citationMatchesMerchant(origin, merchant)) return { origin, source: "senso" };
  }
  const structuredOrigin = httpsOrigin(structuredMerchantUrl);
  if (structuredOrigin) return { origin: structuredOrigin, source: "research" };
  const curatedOrigin = curatedMerchantOrigins[merchant.trim().toLowerCase()];
  return curatedOrigin ? { origin: curatedOrigin, source: "curated" } : undefined;
}

export function merchantUrlSourceLabel(source: MerchantUrlSource): string {
  return source === "senso" ? "Senso evidence" : source === "research" ? "Research data" : "Curated demo map";
}
