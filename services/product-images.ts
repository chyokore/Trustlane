import "server-only";

import type { ProductImage } from "@/types/shop";

const SERPAPI_URL = "https://serpapi.com/search.json";
const TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 10 * 60_000;
const cache = new Map<string, { expiresAt: number; value?: ProductImage }>();
const pending = new Map<string, Promise<ProductImage | undefined>>();

interface SerpImageResult { original?: string; thumbnail?: string; title?: string; link?: string; source?: string; original_width?: number; original_height?: number; }
interface SerpResponse { image_results?: SerpImageResult[]; }

function normalized(value: string) { return value.trim().toLowerCase().replace(/\s+/g, " "); }
function safeHttps(value?: string) { try { return value ? new URL(value).protocol === "https:" : false; } catch { return false; } }
function diagnostics(label: string, detail: unknown) { if (process.env.NODE_ENV !== "production") console.info(`[TrustLane images] ${label}`, detail); }

export async function resolveProductImage(input: { title: string; brand?: string; merchant?: string }): Promise<ProductImage | undefined> {
  const key = normalized(`${input.title} ${input.brand ?? ""} ${input.merchant ?? ""}`);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const existing = pending.get(key);
  if (existing) return existing;
  const work = (async () => {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) return undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const query = [input.title, input.brand, input.merchant].filter(Boolean).join(" ");
      const params = new URLSearchParams({ engine: "google_images", q: query, api_key: apiKey, safe: "active" });
      const started = performance.now();
      const response = await fetch(`${SERPAPI_URL}?${params}`, { signal: controller.signal, cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as SerpResponse;
      diagnostics("Lookup completed", { status: response.status, durationMs: Math.round(performance.now() - started), queryLength: query.length });
      if (!response.ok) return undefined;
      const titleTerms = normalized(input.title).split(" ").filter((term) => term.length > 2);
      const merchant = normalized(input.merchant ?? "");
      const candidate = (data.image_results ?? [])
        .filter((result) => safeHttps(result.original) && Boolean(result.original_width && result.original_height && result.link))
        .map((result) => {
          const title = normalized(result.title ?? "");
          const domain = normalized(result.source ?? (() => { try { return new URL(result.link!).hostname; } catch { return ""; } })());
          const matches = titleTerms.filter((term) => title.includes(term)).length;
          return { result, score: matches * 10 + (merchant && domain.includes(merchant.replace(/\s+/g, "")) ? 5 : 0) };
        })
        .sort((a, b) => b.score - a.score)[0]?.result;
      if (!candidate?.original || !candidate.link || !candidate.original_width || !candidate.original_height) return undefined;
      const sourceDomain = new URL(candidate.link).hostname;
      return { imageUrl: candidate.original, thumbnailUrl: candidate.thumbnail, sourceUrl: candidate.link, sourceDomain, width: candidate.original_width, height: candidate.original_height, altText: candidate.title?.trim() || input.title };
    } catch (error) {
      diagnostics("Lookup unavailable", { message: error instanceof Error ? error.message : String(error) });
      return undefined;
    } finally { clearTimeout(timeout); }
  })();
  pending.set(key, work);
  try { const value = await work; cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS }); return value; } finally { pending.delete(key); }
}
