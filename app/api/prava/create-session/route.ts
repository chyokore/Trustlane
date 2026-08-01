import { createPravaSandboxSession, type PravaCheckoutRequest } from "@/services/prava";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await request.json() as Partial<PravaCheckoutRequest>;
    if (!input.merchant || !input.merchantUrl || !input.product || !input.amount || !input.currency || !input.decisionLedgerId) return Response.json({ error: "Incomplete checkout details." }, { status: 400 });
    const session = await createPravaSandboxSession(input as PravaCheckoutRequest);
    return Response.json({ sessionId: session.session_id, sessionToken: session.session_token, iframeUrl: session.iframe_url, expiresAt: session.expires_at, orderId: session.order_id, publishableKey: process.env.NEXT_PUBLIC_PRAVA_PUBLISHABLE_KEY });
  } catch (error) {
    console.error("[TrustLane Prava sandbox error]", error);
    return Response.json({ error: process.env.NODE_ENV === "production" ? "Unable to start checkout." : error instanceof Error ? error.message : "Unable to start checkout." }, { status: 500 });
  }
}
