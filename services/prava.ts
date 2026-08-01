import "server-only";

export interface PravaCheckoutRequest { merchant: string; merchantUrl: string; product: string; amount: string; currency: string; decisionLedgerId: string; }
export interface PravaSession { session_id: string; session_token: string; iframe_url: string; expires_at: string; order_id: string; }

export async function createPravaSandboxSession(input: PravaCheckoutRequest): Promise<PravaSession> {
  const secretKey = process.env.PRAVA_SECRET_KEY;
  if (!secretKey) throw new Error("PRAVA_SECRET_KEY is not configured.");
  if (!secretKey.startsWith("sk_test_")) throw new Error("Only Prava sandbox keys (sk_test_*) are supported.");
  const amount = Number(input.amount.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("A valid purchase amount is required.");
  const response = await fetch("https://sandbox.api.prava.space/v1/sessions", { method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ user_id: "trustlane_sandbox_user", user_email: "sandbox@trustlane.local", total_amount: amount.toFixed(2), currency: input.currency, integration_type: "embedding", purchase_context: [{ merchant_details: { name: input.merchant, url: input.merchantUrl, country_code_iso2: "US" }, product_details: [{ description: input.product, unit_price: amount.toFixed(2), quantity: 1 }] }] }), cache: "no-store" });
  if (!response.ok) throw new Error(`Prava sandbox session failed (${response.status}).`);
  const session = await response.json() as PravaSession;
  if (!session.session_token || !session.iframe_url || !session.session_id) throw new Error("Prava returned an incomplete sandbox session.");
  return session;
}
