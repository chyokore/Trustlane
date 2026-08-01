import { NextResponse } from "next/server";
import { createRawMerchantContext } from "@/services/senso";

interface OutcomePayload {
  merchant?: unknown;
  product?: unknown;
  transactionId?: unknown;
  ledgerId?: unknown;
  timestamp?: unknown;
  fulfillmentStatus?: unknown;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OutcomePayload;
    if ([body.merchant, body.product, body.transactionId, body.ledgerId, body.timestamp].some((value) => typeof value !== "string" || !value)) {
      return NextResponse.json({ error: "Incomplete confirmed payment outcome." }, { status: 400 });
    }
    const merchant = body.merchant as string;
    const timestamp = body.timestamp as string;
    await createRawMerchantContext({
      title: `Confirmed Prava Sandbox outcome — ${merchant}`,
      markdown: `# Confirmed Prava Sandbox outcome\n\n- Merchant: ${merchant}\n- Product: ${body.product as string}\n- Transaction outcome: successful\n- Transaction ID: ${body.transactionId as string}\n- Fulfillment status: ${typeof body.fulfillmentStatus === "string" ? body.fulfillmentStatus : "Unknown"}\n- Decision Ledger ID: ${body.ledgerId as string}\n- Timestamp: ${timestamp}\n`,
      metadata: { merchant, lastVerifiedAt: timestamp, recordType: "transaction-outcome" },
    });
    return NextResponse.json({ recorded: true });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[TrustLane Senso] Outcome write failed", error);
    return NextResponse.json({ recorded: false }, { status: 202 });
  }
}
