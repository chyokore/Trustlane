import "server-only";

export interface PravaCheckoutRequest { merchant: string; merchantUrl: string; verifiedMerchantUrl?: string; product: string; amount: string; currency: string; decisionLedgerId: string; }
export interface PravaSession { session_id: string; session_token?: string; iframe_url: string; expires_at: string; order_id: string; }
export type PravaSessionMode = "embedding" | "full_checkout";
export interface PravaPaymentResult { status: "completed" | "failed" | "pending"; transactionId?: string; }
export class PravaValidationError extends Error { constructor(public code: "MISSING_PRAVA_SECRET_KEY" | "INVALID_APP_URL" | "INVALID_AMOUNT" | "MISSING_MERCHANT_URL" | "INVALID_MERCHANT_URL" | "PLACEHOLDER_MERCHANT_URL", public safeMessage: string, public status: 400 | 503) { super(safeMessage); } }

function stage(name: string, message: string) { console.info("[TrustLane Prava hosted validation]", { stage: name, message }); }
function getSandboxKey(hosted = false) { const secretKey = process.env.PRAVA_SECRET_KEY; if (!secretKey) { if (hosted) throw new PravaValidationError("MISSING_PRAVA_SECRET_KEY", "Hosted checkout is temporarily unavailable.", 503); throw new Error("PRAVA_SECRET_KEY is not configured."); } if (!secretKey.startsWith("sk_test_")) { if (hosted) throw new PravaValidationError("MISSING_PRAVA_SECRET_KEY", "Hosted checkout is temporarily unavailable.", 503); throw new Error("Only Prava sandbox keys (sk_test_*) are supported."); } return secretKey; }
function callbackUrl() { const raw = process.env.NEXT_PUBLIC_APP_URL; if (!raw) throw new PravaValidationError("INVALID_APP_URL", "Hosted checkout is temporarily unavailable.", 503); try { const value = raw.replace(/\/+$/, ""); const url = new URL(value); if (url.protocol !== "https:") throw new Error(); return `${url.origin}${url.pathname.replace(/\/$/, "")}/dashboard/checkout/complete`; } catch { throw new PravaValidationError("INVALID_APP_URL", "Hosted checkout is temporarily unavailable.", 503); } }
function classifyHttpsOrigin(value?: string): "missing" | "placeholder" | "invalid" | { origin: string } { if (!value?.trim()) return "missing"; try { const url = new URL(value); if (url.hostname === "example.com" || url.hostname.endsWith(".example.com")) return "placeholder"; if (url.protocol !== "https:" || url.hostname === "localhost" || url.hostname.endsWith(".localhost")) return "invalid"; return { origin: url.origin }; } catch { return "invalid"; } }
export class PravaApiError extends Error { constructor(public status: number, public code: string, public requestId: string | undefined, public sanitizedBody: Record<string, unknown>) { super("Prava request failed."); } }

export async function createPravaSandboxSession(input: PravaCheckoutRequest, mode: PravaSessionMode = "embedding"): Promise<PravaSession> {
  const hosted = mode === "full_checkout";
  const secretKey = getSandboxKey(hosted);
  if (hosted) stage("environment validated", "Required hosted checkout environment is configured.");
  const amount = Number(input.amount.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) { if (hosted) throw new PravaValidationError("INVALID_AMOUNT", "A valid purchase amount is required.", 400); throw new Error("A valid purchase amount is required."); }
  if (hosted) stage("amount validated", "Purchase amount is valid.");
  const hostedCallbackUrl = hosted ? callbackUrl() : undefined;
  if (hosted) stage("callback URL validated", "HTTPS callback URL is valid.");
  const verified = classifyHttpsOrigin(input.verifiedMerchantUrl);
  const supplied = classifyHttpsOrigin(input.merchantUrl);
  const selected = typeof verified === "object" ? verified : typeof supplied === "object" ? supplied : undefined;
  if (hosted) stage("merchant URL selected", selected ? "A candidate merchant origin was selected." : "No valid merchant origin was selected.");
  if (hosted && !selected) { const status = verified === "missing" && supplied === "missing" ? "MISSING_MERCHANT_URL" : verified === "placeholder" || supplied === "placeholder" ? "PLACEHOLDER_MERCHANT_URL" : "INVALID_MERCHANT_URL"; const message = status === "MISSING_MERCHANT_URL" ? "A verified HTTPS merchant URL is required." : status === "PLACEHOLDER_MERCHANT_URL" ? "The selected merchant cannot be verified for checkout." : "A verified HTTPS merchant URL is required."; throw new PravaValidationError(status, message, 400); }
  const merchantUrl = hosted ? selected!.origin : input.merchantUrl;
  if (hosted) stage("merchant URL validated", "Merchant origin is valid for hosted checkout.");
  const body = { user_id: "trustlane_sandbox_user", user_email: "sandbox@trustlane.local", total_amount: amount.toFixed(2), currency: input.currency, ...(mode === "embedding" ? { integration_type: "embedding" } : { callback_url: hostedCallbackUrl! }), purchase_context: [{ merchant_details: { name: input.merchant, url: merchantUrl, country_code_iso2: "US" }, product_details: [{ description: input.product, unit_price: amount.toFixed(2), quantity: 1 }] }] };
  if (hosted) stage("payload constructed", "Hosted checkout payload constructed.");
  if (hosted) stage("Prava request starting", "Starting Prava hosted checkout request.");
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
