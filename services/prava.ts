import "server-only";
import { parseCheckoutAmount } from "@/lib/checkout-amount";
import { isStableCheckoutUserId, normalizeCheckoutEmail } from "@/lib/checkout-identity";

export interface PravaCheckoutRequest { merchant: string; merchantUrl: string; verifiedMerchantUrl?: string; product: string; amount: number; currency: string; decisionLedgerId: string; customerEmail: string; stableUserId: string; }
export interface PravaSession { session_id: string; session_token?: string; iframe_url: string; expires_at: string; order_id: string; }
export type PravaSessionMode = "embedding" | "full_checkout";
export interface PravaPaymentResult { status: "completed" | "failed" | "pending" | "awaiting_result"; transactionId?: string; }
export class PravaValidationError extends Error { constructor(public code: "MISSING_PRAVA_SECRET_KEY" | "INVALID_APP_URL" | "INVALID_AMOUNT" | "INVALID_EMAIL" | "INVALID_USER_ID" | "MISSING_MERCHANT_URL" | "INVALID_MERCHANT_URL" | "PLACEHOLDER_MERCHANT_URL", public safeMessage: string, public status: 400 | 503) { super(safeMessage); } }

function stage(name: string, message: string) { console.info("[TrustLane Prava hosted validation]", { stage: name, message }); }
function getSandboxKey(hosted = false) { const secretKey = process.env.PRAVA_SECRET_KEY; if (!secretKey) { if (hosted) throw new PravaValidationError("MISSING_PRAVA_SECRET_KEY", "Hosted checkout is temporarily unavailable.", 503); throw new Error("PRAVA_SECRET_KEY is not configured."); } if (!secretKey.startsWith("sk_test_")) { if (hosted) throw new PravaValidationError("MISSING_PRAVA_SECRET_KEY", "Hosted checkout is temporarily unavailable.", 503); throw new Error("Only Prava sandbox keys (sk_test_*) are supported."); } return secretKey; }
const hostedCallbackUrl = "https://trustlane-pi.vercel.app/dashboard/checkout/complete";
function classifyHttpsOrigin(value?: string): "missing" | "placeholder" | "invalid" | { origin: string } { if (!value?.trim()) return "missing"; try { const url = new URL(value); if (url.hostname === "example.com" || url.hostname.endsWith(".example.com")) return "placeholder"; if (url.protocol !== "https:" || url.hostname === "localhost" || url.hostname.endsWith(".localhost")) return "invalid"; return { origin: url.origin }; } catch { return "invalid"; } }
export class PravaApiError extends Error { constructor(public status: number, public code: string, public requestId: string | undefined, public sanitizedBody: Record<string, unknown>) { super("Prava request failed."); } }

export async function createPravaSandboxSession(input: PravaCheckoutRequest, mode: PravaSessionMode = "embedding"): Promise<PravaSession> {
  const hosted = mode === "full_checkout";
  const secretKey = getSandboxKey(hosted);
  const customerEmail = normalizeCheckoutEmail(input.customerEmail);
  if (!customerEmail) throw new PravaValidationError("INVALID_EMAIL", "A valid customer email is required.", 400);
  if (hosted) stage("email validated", "Customer email is valid.");
  if (!isStableCheckoutUserId(input.stableUserId)) throw new PravaValidationError("INVALID_USER_ID", "A valid checkout user ID is required.", 400);
  if (hosted) stage("user ID validated", "Stable checkout user ID is valid.");
  const amount = parseCheckoutAmount(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) { if (hosted) throw new PravaValidationError("INVALID_AMOUNT", "A valid purchase amount is required.", 400); throw new Error("A valid purchase amount is required."); }
  if (hosted) stage("amount validated", "Purchase amount is valid.");
  if (hosted) stage("callback validated", "Production callback URL is valid.");
  const verified = classifyHttpsOrigin(input.verifiedMerchantUrl);
  const supplied = classifyHttpsOrigin(input.merchantUrl);
  const selected = typeof verified === "object" ? verified : undefined;
  if (hosted) stage("merchant URL selected", selected ? "A candidate merchant origin was selected." : "No valid merchant origin was selected.");
  if (hosted && !selected) { const status = verified === "missing" && supplied === "missing" ? "MISSING_MERCHANT_URL" : verified === "placeholder" || supplied === "placeholder" ? "PLACEHOLDER_MERCHANT_URL" : "INVALID_MERCHANT_URL"; const message = status === "MISSING_MERCHANT_URL" ? "A verified HTTPS merchant URL is required." : status === "PLACEHOLDER_MERCHANT_URL" ? "The selected merchant cannot be verified for checkout." : "A verified HTTPS merchant URL is required."; throw new PravaValidationError(status, message, 400); }
  const merchantUrl = hosted ? selected!.origin : typeof verified === "object" ? verified.origin : typeof supplied === "object" ? supplied.origin : input.merchantUrl;
  if (hosted) stage("merchant URL validated", "Merchant origin is valid for hosted checkout.");
  const body = { user_id: input.stableUserId, user_email: customerEmail, total_amount: amount.toFixed(2), currency: input.currency, integration_type: mode === "embedding" ? "embedding" : "full_checkout", ...(hosted ? { callback_url: hostedCallbackUrl } : {}), purchase_context: [{ merchant_details: { name: input.merchant, url: merchantUrl, country_code_iso2: "US" }, product_details: [{ description: input.product, unit_price: amount.toFixed(2), quantity: 1 }] }] };
  if (hosted) stage("payload constructed", "Hosted checkout payload constructed.");
  if (hosted) stage("Prava request starting", "Starting Prava hosted checkout request.");
  const response = await fetch("https://sandbox.api.prava.space/v1/sessions", { method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const raw = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (hosted) stage("Prava response received", `Prava responded with status ${response.status}.`);
  if (!response.ok) { const error = typeof raw.error === "object" && raw.error ? raw.error as Record<string, unknown> : raw; throw new PravaApiError(response.status, typeof error.code === "string" ? error.code : "upstream_error", response.headers.get("x-request-id") ?? undefined, { code: typeof error.code === "string" ? error.code : undefined, message: typeof error.message === "string" ? error.message : undefined }); }
  const session: PravaSession = {
    session_id: String(raw.session_id ?? raw.sessionId ?? ""),
    session_token: typeof (raw.session_token ?? raw.sessionToken) === "string" ? String(raw.session_token ?? raw.sessionToken) : undefined,
    iframe_url: String(raw.iframe_url ?? raw.iframeUrl ?? ""),
    expires_at: String(raw.expires_at ?? raw.expiresAt ?? ""),
    order_id: String(raw.order_id ?? raw.orderId ?? ""),
  };
  if ((!session.session_token && mode === "embedding") || !session.iframe_url || !session.session_id) throw new Error("Prava returned an incomplete sandbox session.");
  return session;
}

export async function getPravaPaymentResult(sessionId: string): Promise<PravaPaymentResult> {
  const secretKey = getSandboxKey();
  const response = await fetch(`https://sandbox.api.prava.space/v1/sessions/${encodeURIComponent(sessionId)}/payment-result`, { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Prava payment result failed (${response.status}).`);
  const data = await response.json() as { status?: unknown; payment_status?: unknown; transaction_id?: unknown; enrollment_id?: unknown };
  const raw = typeof data.payment_status === "string" ? data.payment_status.toLowerCase() : typeof data.status === "string" ? data.status.toLowerCase() : "pending";
  const status = raw === "completed" ? "completed" : raw === "failed" ? "failed" : raw === "awaiting_result" ? "awaiting_result" : "pending";
  const transactionId = typeof data.transaction_id === "string" ? data.transaction_id : typeof data.enrollment_id === "string" ? data.enrollment_id : undefined;
  return { status, transactionId };
}
