import { parseCheckoutAmount } from "@/lib/checkout-amount";
import { isStableCheckoutUserId, normalizeCheckoutEmail } from "@/lib/checkout-identity";
import { createPravaSandboxSession, PravaApiError, PravaValidationError, type PravaCheckoutRequest } from "@/services/prava";

export const runtime = "nodejs";

type HostedCheckoutBoundary = Partial<Omit<PravaCheckoutRequest, "amount">> & { amount?: string | number };

export async function POST(request: Request) {
  try {
    const input = await request.json() as HostedCheckoutBoundary;
    const receivedAmount = input.amount;
    const amount = typeof receivedAmount === "string" || typeof receivedAmount === "number" ? parseCheckoutAmount(receivedAmount) : Number.NaN;
    console.info("[TrustLane Prava hosted validation]", { stage: "request parsed", message: "Hosted checkout request parsed." });
    const customerEmail = normalizeCheckoutEmail(input.customerEmail);
    if (!input.merchant?.trim() || !input.product?.trim() || !input.currency || !/^[A-Z]{3}$/.test(input.currency) || !input.decisionLedgerId?.trim()) return Response.json({ error: "Incomplete or invalid checkout details.", code: "INVALID_REQUEST", status: 400 }, { status: 400 });
    if (!customerEmail) throw new PravaValidationError("INVALID_EMAIL", "A valid customer email is required.", 400);
    if (!isStableCheckoutUserId(input.stableUserId)) throw new PravaValidationError("INVALID_USER_ID", "A valid checkout user ID is required.", 400);
    if (!Number.isFinite(amount)) throw new PravaValidationError("INVALID_AMOUNT", "A valid purchase amount is required.", 400);
    const session = await createPravaSandboxSession({ ...input, customerEmail, amount } as PravaCheckoutRequest, "full_checkout");
    const sessionId = session.session_id?.trim();
    const orderId = session.order_id?.trim();
    const iframeUrl = session.iframe_url;
    const expiresAt = session.expires_at?.trim();
    let validIframeUrl = false;
    try { validIframeUrl = Boolean(iframeUrl?.trim() && new URL(iframeUrl).protocol === "https:"); } catch { validIframeUrl = false; }
    const expiry = expiresAt ? Date.parse(expiresAt) : Number.NaN;
    if (!sessionId || !orderId || !validIframeUrl || !Number.isFinite(expiry) || expiry <= Date.now()) throw new PravaValidationError("INVALID_APP_URL", "Prava returned an unusable hosted checkout session.", 503);
    console.info("[TrustLane Prava hosted validation]", { stage: "redirect URL returned", message: "Validated hosted redirect URL returned." });
    return Response.json({ sessionId, orderId, iframeUrl, expiresAt });
  } catch (error) {
    if (error instanceof PravaValidationError) { console.info("[TrustLane Prava hosted validation]", { stage: "local validation failed", message: error.safeMessage }); return Response.json({ error: error.safeMessage, code: error.code, status: error.status }, { status: error.status }); }
    if (error instanceof PravaApiError) { console.error("[TrustLane Prava hosted session]", { status: error.status, requestId: error.requestId, code: error.code, message: error.sanitizedBody.message, body: error.sanitizedBody }); return Response.json({ error: "Unable to start hosted checkout.", code: error.code, status: error.status }, { status: 502 }); }
    if (process.env.NODE_ENV !== "production") console.error("[TrustLane Prava hosted session]", { stage: "unexpected failure", message: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Unable to start hosted checkout.", code: "HOSTED_CHECKOUT_UNAVAILABLE", status: 503 }, { status: 503 });
  }
}
