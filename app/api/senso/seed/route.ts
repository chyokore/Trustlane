import { NextResponse } from "next/server";
import { createRawMerchantContext } from "@/services/senso";

const seededAt = "2026-08-01T00:00:00.000Z";
const merchants = ["Vertex Computing", "Northstar Electronics", "DirectTech"];

export async function POST() {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  try {
    const results = await Promise.all(
      merchants.map((merchant) =>
        createRawMerchantContext({
          title: `DEMO EVIDENCE ONLY — ${merchant}`,
          markdown: `# Demo merchant evidence — not externally verified\n\n- Merchant name: ${merchant}\n- Official website: https://example.com\n- Return policy: DEMO EVIDENCE ONLY — no policy fact has been independently verified.\n- Warranty: DEMO EVIDENCE ONLY — no warranty fact has been independently verified.\n- Shipping/fulfillment information: DEMO EVIDENCE ONLY — no fulfillment fact has been independently verified.\n- Evidence URL: https://example.com\n- Last verified timestamp: ${seededAt}\n\nThis manually supplied development fixture must not be presented as external merchant verification.\n`,
          metadata: { merchant, lastVerifiedAt: seededAt, recordType: "merchant-context", evidenceLabel: "demo-only" },
        }),
      ),
    );
    return NextResponse.json({ seeded: results.length, label: "DEMO EVIDENCE ONLY" });
  } catch (error) {
    console.error("[TrustLane Senso] Seed failed", error);
    return NextResponse.json({ error: "Unable to seed Senso demo context." }, { status: 500 });
  }
}
