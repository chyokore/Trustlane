import "server-only";

const SENSO_BASE_URL = "https://apiv2.senso.ai/api/v1";
const SENSO_TIMEOUT_MS = 12_000;

export type SensoVerificationStatus = "verified" | "not_found" | "unavailable";

export interface SensoSourceCitation {
  title: string;
  url?: string;
  relevanceScore?: number;
  lastVerifiedAt?: string;
}

export interface VerifiedMerchantContext {
  merchant: string;
  groundedAnswer: string;
  citations: SensoSourceCitation[];
  verificationStatus: SensoVerificationStatus;
}

export interface RawMerchantContextInput {
  title: string;
  markdown: string;
  metadata: {
    merchant: string;
    lastVerifiedAt: string;
    recordType: "merchant-context" | "transaction-outcome";
    [key: string]: string;
  };
}

interface SensoSearchChunk {
  title?: string;
  name?: string;
  url?: string;
  source_url?: string;
  relevance_score?: number;
  score?: number;
  metadata?: Record<string, unknown>;
}

interface SensoSearchResponse {
  answer?: string;
  results?: SensoSearchChunk[];
}

interface SensoApiError {
  error?: { message?: string } | string;
  message?: string;
}

function unavailable(merchant: string): VerifiedMerchantContext {
  return {
    merchant,
    groundedAnswer: "Verified context temporarily unavailable.",
    citations: [],
    verificationStatus: "unavailable",
  };
}

function getApiKey() {
  return process.env.SENSO_API_KEY;
}

function diagnostics(label: string, detail: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[TrustLane Senso] ${label}`, detail);
  }
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("SENSO_API_KEY is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SENSO_TIMEOUT_MS);
  try {
    const response = await fetch(`${SENSO_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as T & SensoApiError;
    if (!response.ok) {
      const message =
        typeof payload.error === "string"
          ? payload.error
          : payload.error?.message ?? payload.message ?? "Senso request failed.";
      throw new Error(message);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

/** Adds a manually supplied Markdown source to the organization's Senso KB. */
export async function createRawMerchantContext(input: RawMerchantContextInput) {
  return request<Record<string, unknown>>("/org/kb/raw", {
    title: input.title,
    content: input.markdown,
    metadata: input.metadata,
  });
}

/** Searches the Senso KB and converts only returned sources into UI citations. */
export async function searchVerifiedMerchantContext(
  merchant: string,
): Promise<VerifiedMerchantContext> {
  try {
    const response = await request<SensoSearchResponse>("/org/search", {
      query: `What verified merchant context is available for ${merchant}? Include return policy, warranty, shipping or fulfillment, and cite only available sources.`,
      max_results: 5,
    });
    const citations = (response.results ?? []).flatMap((source) => {
      const metadata = source.metadata ?? {};
      const title = source.title ?? source.name ?? (typeof metadata.title === "string" ? metadata.title : undefined);
      if (!title) return [];
      const url = source.url ?? source.source_url ?? (typeof metadata.url === "string" ? metadata.url : undefined);
      const relevanceScore = source.relevance_score ?? source.score;
      const lastVerifiedAt = typeof metadata.lastVerifiedAt === "string" ? metadata.lastVerifiedAt : undefined;
      return [{ title, url, relevanceScore, lastVerifiedAt }];
    });
    if (!response.answer && citations.length === 0) {
      return { merchant, groundedAnswer: "No verified merchant context was found.", citations, verificationStatus: "not_found" };
    }
    return {
      merchant,
      groundedAnswer: response.answer ?? "Relevant merchant sources were found.",
      citations,
      verificationStatus: "verified",
    };
  } catch (error) {
    diagnostics("Merchant-context search unavailable", {
      merchant,
      message: error instanceof Error ? error.message : String(error),
    });
    return unavailable(merchant);
  }
}
