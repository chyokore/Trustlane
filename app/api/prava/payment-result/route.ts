import { isStableCheckoutUserId } from "@/lib/checkout-identity";
import { getPravaPaymentResult } from "@/services/prava";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { sessionId?: unknown; stableUserId?: unknown };
    if (typeof body.sessionId !== "string" || !/^[a-zA-Z0-9_-]{6,200}$/.test(body.sessionId) || !isStableCheckoutUserId(body.stableUserId)) return Response.json({ error: "Invalid checkout identifiers." }, { status: 400 });
    return Response.json(await getPravaPaymentResult(body.sessionId));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[TrustLane Prava payment result]", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Unable to check payment status." }, { status: 502 });
  }
}
