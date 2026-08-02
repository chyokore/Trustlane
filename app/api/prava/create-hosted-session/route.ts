import { parseCheckoutAmount, sanitizeCheckoutAmount } from "@/lib/checkout-amount";
import { createPravaSandboxSession, PravaApiError, PravaValidationError, type PravaCheckoutRequest } from "@/services/prava";

export const runtime = "nodejs";

type HostedCheckoutBoundary = Partial<Omit<PravaCheckoutRequest, "amount">> & { amount?: string | number };

export async function POST(request: Request) {
  try {
    const input = await request.json() as HostedCheckoutBoundary;
    const receivedAmount = input.amount;
    const amount = typeof receivedAmount === "string" || typeof receivedAmount === "number" ? parseCheckoutAmount(receivedAmount) : Number.NaN;
    if (process.env.NODE_ENV !== "production") console.info("[TrustLane Prava hosted amount]", { receivedAmountType: typeof receivedAmount, sanitizedReceivedAmount: typeof receivedAmount === "string" || typeof receivedAmount === "number" ? sanitizeCheckoutAmount(receivedAmount) : "", parsedNumericAmount: Number.isFinite(amount) ? amount : null, validationStage: "request parsed" });
    console.info("[TrustLane Prava hosted validation]", { stage: "request parsed", message: "Hosted checkout request parsed." });
    if (!input.merchant || !input.product || !input.currency || !input.decisionLedgerId) return Response.json({ error: "Incomplete checkout details.", code: "INVALID_REQUEST", status: 400 }, { status: 400 });
    if (!Number.isFinite(amount)) throw new PravaValidationError("INVALID_AMOUNT", "A valid purchase amount is required.", 400);
    const session = await createPravaSandboxSession({ ...input, amount } as PravaCheckoutRequest, "full_checkout");
    return Response.json({ sessionId: session.session_id, orderId: session.order_id, iframeUrl: session.iframe_url, expiresAt: session.expires_at });
  } catch (error) {
    if (error instanceof PravaValidationError) { console.info("[TrustLane Prava hosted validation]", { stage: "local validation failed", message: error.safeMessage }); return Response.json({ error: error.safeMessage, code: error.code, status: error.status }, { status: error.status }); }
    if (error instanceof PravaApiError) { console.error("[TrustLane Prava hosted session]", { status: error.status, requestId: error.requestId, code: error.code, message: error.sanitizedBody.message, body: error.sanitizedBody }); return Response.json({ error: "Unable to start hosted checkout.", code: error.code, status: error.status }, { status: 502 }); }
    if (process.env.NODE_ENV !== "production") console.error("[TrustLane Prava hosted session]", { stage: "unexpected failure", message: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Unable to start hosted checkout.", code: "HOSTED_CHECKOUT_UNAVAILABLE", status: 503 }, { status: 503 });
  }
}
