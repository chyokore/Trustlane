import "server-only";

import { prompts } from "@/lib/prompts";
import { arrayOfStrings, boolean, integer, runStructuredAgent, string } from "./openai";
import type { AgentResult } from "./types";

const product = { type: "object", additionalProperties: false, required: ["name", "merchant", "price", "trustScore", "warranty", "returns", "shipping", "delivery", "risk", "pros", "cons"], properties: { name: string, merchant: string, price: string, trustScore: integer, warranty: string, returns: string, shipping: string, delivery: string, risk: { type: "string", enum: ["Low", "Medium", "High"] }, pros: arrayOfStrings, cons: arrayOfStrings } };

const resultSchema = { type: "object", additionalProperties: false, required: ["intent", "researchSummary", "merchantAnalysis", "riskAnalysis", "comparison", "decisionLedger", "confidenceScore", "recommendedProduct"], properties: {
  intent: { type: "object", additionalProperties: false, required: ["product", "budget", "currency", "language", "shippingDestination", "warrantyRequired", "merchantPreference", "requirements"], properties: { product: string, budget: string, currency: string, language: string, shippingDestination: string, warrantyRequired: boolean, merchantPreference: string, requirements: arrayOfStrings } },
  researchSummary: { type: "object", additionalProperties: false, required: ["productsCompared", "verifiedMerchants", "rejectedMerchants", "estimatedSavings", "timeSpent", "products"], properties: { productsCompared: integer, verifiedMerchants: integer, rejectedMerchants: integer, estimatedSavings: string, timeSpent: string, products: { type: "array", minItems: 3, maxItems: 3, items: product } } },
  merchantAnalysis: { type: "object", additionalProperties: false, required: ["summary", "verified", "rejected"], properties: { summary: string, verified: arrayOfStrings, rejected: arrayOfStrings } },
  riskAnalysis: { type: "object", additionalProperties: false, required: ["summary", "flaggedRisks", "overallRisk"], properties: { summary: string, flaggedRisks: arrayOfStrings, overallRisk: { type: "string", enum: ["Low", "Medium", "High"] } } },
  comparison: { type: "object", additionalProperties: false, required: ["ranking"], properties: { ranking: { type: "array", minItems: 3, maxItems: 3, items: { type: "object", additionalProperties: false, required: ["productName", "rank", "reason"], properties: { productName: string, rank: integer, reason: string } } } } },
  decisionLedger: { type: "object", additionalProperties: false, required: ["selectedReason", "alternativesRejected", "tradeOffs", "merchantVerification", "reasoningTimeline", "overallTrustScore"], properties: { selectedReason: string, alternativesRejected: string, tradeOffs: string, merchantVerification: string, reasoningTimeline: arrayOfStrings, overallTrustScore: integer } },
  confidenceScore: integer,
  recommendedProduct: product,
} };

/** One upstream completion; agent modules remain logical stages for future service extraction. */
export function runShoppingAgents(prompt: string): Promise<AgentResult> {
  const instructions = `You are the TrustLane shopping orchestration engine. Complete six logical stages in one structured response: intent extraction, research, merchant verification, risk assessment, comparison, and decision ledger. ${Object.values(prompts).join(" ")} Use illustrative product and merchant data; do not claim live web checks, current inventory, or purchase execution.`;
  return runStructuredAgent<AgentResult>("trustlane_research", instructions, { prompt }, resultSchema);
}
