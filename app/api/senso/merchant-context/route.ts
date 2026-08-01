import { NextResponse } from "next/server";
import { searchVerifiedMerchantContext } from "@/services/senso";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { merchant?: unknown };
    if (typeof body.merchant !== "string" || !body.merchant.trim()) {
      return NextResponse.json({ error: "A merchant name is required." }, { status: 400 });
    }
    const context = await searchVerifiedMerchantContext(body.merchant.trim());
    return NextResponse.json(context);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[TrustLane Senso] Merchant context route failed", error);
    return NextResponse.json({ error: "Verified context temporarily unavailable." }, { status: 500 });
  }
}
