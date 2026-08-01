import "server-only";

export interface PravaCheckoutRequest { merchant: string; merchantUrl: string; verifiedMerchantUrl?: string; product: string; amount: string; currency: string; decisionLedgerId: string; }
export interface PravaSession { session_id: string; session_token?: string; iframe_url: string; expires_at: string; order_id: string; }
export type PravaSessionMode = "embedding" | "full_checkout";
export interface PravaPaymentResult { status: "completed" | "failed" | "pending"; transactionId?: string; }

function getSandboxKey() { const secretKey = process.env.PRAVA_SECRET_KEY; if (!secretKey) throw new Error("PRAVA_SECRET_KEY is not configured."); if (!secretKey.startsWith("sk_test_")) throw new Error("Only Prava sandbox keys (sk_test_*) are supported."); return secretKey; }
function callbackUrl() { const value = (process.env.NEXT_PUBLIC_APP_URL ?? "https://trustlane-pi.vercel.app").replace(/\/+$/, ""); const url = new URL(value); if (url.protocol !== "https:") throw new Error("Hosted checkout requires an HTTPS application URL."); return `${url.origin}${url.pathname.replace(/\/$/, "")}/dashboard/checkout/complete`; }
function validHttpsOrigin(value?: string) { try { const url = new URL(value ?? ""); if (url.protocol !== "https:" || url.hostname === "localhost" || url.hostname.endsWith(".localhost") || url.hostname === "example.com") return undefined; return url.origin; } catch { return undefined; } }
export class PravaApiError extends Error { constructor(public status: number, public code: string, public requestId: string | undefined, public sanitizedBody: Record<string, unknown>) { super("Prava request failed."); } }

export async function createPravaSandboxSession(input: PravaCheckoutRequest, mode: PravaSessionMode = "embedding"): Promise<PravaSession> {
  const secretKey = getSandboxKey();
  const amount = Number(input.amount.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("A valid purchase amount is required.");
  const merchantUrl = mode === "full_checkout" ? validHttpsOrigin(input.verifiedMerchantUrl) ?? validHttpsOrigin(input.merchantUrl) : input.merchantUrl;
  if (mode === "full_checkout" && !merchantUrl) throw new Error("A verified HTTPS merchant URL is required for hosted checkout.");
  const body = { user_id: "trustlane_sandbox_user", user_email: "sandbox@trustlane.local", total_amount: amount.toFixed(2), currency: input.currency, ...(mode === "embedding" ? { integration_type: "embedding" } : { callback_url: callbackUrl() }), purchase_context: [{ merchant_details: { name: input.merchant, url: merchantUrl, country_code_iso2: "US" }, product_details: [{ description: input.product, unit_price: amount.toFixed(2), quantity: 1 }] }] };
  const response = await fetch("https://sandbox.api.prava.space/v1/sessions", { method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const raw = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) { const error = typeof raw.error === "object" && raw.error ? raw.error as Record<string, unknown> : raw; throw new PravaApiError(response.status, typeof error.code === "string" ? error.code : "upstream_error", response.headers.get("x-request-id") ?? undefined, { code: typeof error.code === "string" ? error.code : undefined, message: typeof error.message === "string" ? error.message : undefined }); }
  const session = raw as unknown as PravaSession;
  if ((!session.session_token && mode === "embedding") || !session.iframe_url || !session.session_id) throw new Error("Prava returned an incomplete sandbox session.");
  return session;
}

export async function getPravaPaymentResult(sessionId: string): Promise<PravaPaymentResult> {
  const secretKey = getSandboxKey();
  const response = await fetch(`https://sandbox.api.prava.space/v1/sessions/${encodeURIComponent(sessionId)}/payment-result`, { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Prava payment result failed (${response.status}).`);
  const data = await response.json() as { status?: unknown; payment_status?: unknown; transaction_id?: unknown; enrollment_id?: unknown };
  const raw = typeof data.payment_status === "string" ? data.payment_status.toLowerCase() : typeof data.status === "string" ? data.status.toLowerCase() : "pending";
  const status = raw === "completed" ? "completed" : raw === "failed" ? "failed" : "pending";
  const transactionId = typeof data.transaction_id === "string" ? data.transaction_id : typeof data.enrollment_id === "string" ? data.enrollment_id : undefined;
  return { status, transactionId };
}
