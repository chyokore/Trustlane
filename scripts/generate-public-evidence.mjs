import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: npm run evidence:generate -- ./path/to/trustlane-demo-state.json");
const source = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
if (source?.schemaVersion !== 1 || typeof source.exportedAt !== "string" || !Array.isArray(source.researchSnapshots) || !Array.isArray(source.decisionLedger) || !Array.isArray(source.orderAttempts) || !Array.isArray(source.verificationEvents) || !Array.isArray(source.merchantPassport) || !Array.isArray(source.savedItems) || !source.preferences || typeof source.preferences !== "object") throw new Error("Invalid TrustLane demo-state export.");

const forbidden = /(email|cvv|cardNumber|card_number|otp|passkey|authorization|bearer|secret|apiKey|accessToken|paymentCredentials|stableUserId)/i;
function sanitize(value) { if (Array.isArray(value)) return value.map(sanitize); if (!value || typeof value !== "object") return value; return Object.fromEntries(Object.entries(value).filter(([key]) => !forbidden.test(key)).map(([key, item]) => [key, sanitize(item)])); }
const clean = sanitize(source);
const research = clean.researchSnapshots.at(-1) ?? null;
const order = [...clean.orderAttempts].sort((a, b) => Date.parse(b.updatedAt ?? b.createdAt ?? b.timestamp ?? 0) - Date.parse(a.updatedAt ?? a.createdAt ?? a.timestamp ?? 0))[0] ?? null;
const passport = clean.merchantPassport.at(-1) ?? null;
const generatedAt = new Date().toISOString();
const actor = { type: "anonymous_guest", label: "Hackathon demo user" };
const mask = (value) => typeof value === "string" && value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-4)}` : value ?? null;
const ledgerId = order?.ledgerId ?? order?.decisionLedgerId ?? (research ? `DL-${research.decisionLedger?.overallTrustScore ?? "record"}-${research.confidenceScore ?? "demo"}` : null);
const status = order?.status ?? null;
const artifact = (sourceName, data) => ({ schemaVersion: 1, generatedAt, project: "TrustLane", environment: "Prava Sandbox", source: sourceName, data });
const unavailable = { available: false, reason: "No genuine exported demo record was supplied when this pack was generated." };

const researchData = research ? { actor, request: research.intent, selectedProduct: research.recommendedProduct, trustScore: research.decisionLedger?.overallTrustScore, confidence: research.confidenceScore, researchSummary: research.researchSummary, comparisonSummary: research.comparison, riskFindings: research.riskAnalysis, policyFindings: { warrantyRequired: research.intent?.warrantyRequired, merchantPreference: research.intent?.merchantPreference, requirements: research.intent?.requirements }, merchantAnalysis: research.merchantAnalysis } : unavailable;
const decisionData = research ? { ledgerId, selectedProduct: research.recommendedProduct?.name, selectedMerchant: research.recommendedProduct?.merchant, recommendation: research.decisionLedger?.selectedReason, trustScore: research.decisionLedger?.overallTrustScore, confidence: research.confidenceScore, rankedReasons: research.comparison?.ranking, tradeOffs: research.decisionLedger?.tradeOffs, alternatives: research.decisionLedger?.alternativesRejected, riskSummary: research.riskAnalysis?.summary, policySummary: research.intent?.requirements, checkoutEligibility: Boolean(order), evidenceReferences: ["latest-research.json", "merchant-passport.json"], generatedAt: clean.exportedAt } : unavailable;
const lifecycle = order?.events ?? [];
const orderData = order ? { actor, attemptId: order.attemptId ?? order.id, orderId: order.orderId ?? null, sessionId: mask(order.sessionId), checkoutMode: order.checkoutMode, merchant: order.merchant, product: order.product, amount: order.amount, currency: order.currency, provider: "Prava", environment: "sandbox", providerStatus: status, trustLaneStatus: status, createdAt: order.createdAt ?? order.timestamp, updatedAt: lifecycle.at(-1)?.timestamp ?? order.createdAt ?? order.timestamp, lifecycleEvents: lifecycle, completionInferred: false } : { ...unavailable, completionInferred: false };
const passportData = passport ? { merchant: passport.merchant, publicOrigin: null, verificationStatus: passport.verificationStatus, summary: passport.groundedAnswer, evidenceUrls: passport.citations?.map((item) => item.url).filter(Boolean) ?? [], citations: passport.citations, verifiedAt: passport.verifiedAt } : unavailable;
const replaySteps = research ? [{ name: "User Request", status: "recorded", summary: research.intent?.product }, { name: "Agent Research", status: "recorded", summary: research.researchSummary }, { name: "Merchant Verification", status: passport ? "recorded" : "unavailable", summary: passport?.groundedAnswer }, { name: "Decision Ledger", status: "recorded", summary: research.decisionLedger?.selectedReason }, { name: "Explicit Human Approval", status: order ? "recorded" : "unavailable" }, { name: "Prava Hosted Checkout", status: status ?? "unavailable" }, ...lifecycle.map((event) => ({ name: event.label, status: "recorded", timestamp: event.timestamp }))] : [];
const stages = [
  ["Intent Agent", research ? "completed" : "unavailable", "User shopping request", research?.intent],
  ["Research Agent", research ? "completed" : "unavailable", research?.intent?.product, research?.researchSummary],
  ["Merchant Verification", passport ? "completed" : "unavailable", research?.recommendedProduct?.merchant, passport?.groundedAnswer],
  ["Risk Review", research ? "completed" : "unavailable", research?.recommendedProduct?.name, research?.riskAnalysis],
  ["Policy Review", research ? "completed" : "unavailable", research?.intent?.requirements, { warrantyRequired: research?.intent?.warrantyRequired }],
  ["Decision Ledger", research ? "completed" : "unavailable", research?.comparison, research?.decisionLedger],
  ["Human Approval", order ? "completed" : "unavailable", research?.recommendedProduct?.name, order ? "Hosted attempt recorded" : null],
  ["Prava Hosted Checkout", order ? "completed" : "unavailable", order?.product, status],
  ["Callback / Payment Result", order ? "completed" : "unavailable", mask(order?.sessionId), status],
  ["Verification / Replay", lifecycle.length ? "completed" : "unavailable", status, lifecycle],
].map(([name, stageStatus, inputSummary, outputSummary]) => ({ name, status: stageStatus, startedAt: null, completedAt: null, inputSummary, outputSummary, sourceType: name.includes("Agent") || ["Risk Review", "Policy Review", "Decision Ledger"].includes(name) ? "structured output from one OpenAI orchestration request" : "TrustLane application record", timingNote: "The browser export does not record per-stage timing; timestamps are not inferred.", evidenceReferences: ["latest-research.json", "latest-decision-ledger.json", "latest-order-attempt.json"] }));

const files = {
  "latest-research.json": artifact("sanitized TrustLane demo-state export", researchData),
  "latest-decision-ledger.json": artifact("derived from latest research snapshot", decisionData),
  "agent-execution-log.json": artifact("derived structured execution summary", { actor, orchestrationNote: "Intent, research, merchant analysis, risk, policy, comparison, and Decision Ledger are structured outputs from one OpenAI orchestration request, not separate AI calls.", stages }),
  "latest-order-attempt.json": artifact("sanitized hosted checkout attempt", orderData),
  "verification-lifecycle.json": artifact("derived from order-attempt lifecycle events", order ? { attemptId: order.attemptId ?? order.id, providerStatus: status, events: lifecycle, completionInferred: false } : { ...unavailable, events: [], completionInferred: false }),
  "trust-replay.json": artifact("derived from research and checkout lifecycle", { actor, steps: replaySteps, completionInferred: false }),
  "merchant-passport.json": artifact("sanitized stored merchant context", passportData),
};
files["evidence-bundle.json"] = artifact("TrustLane public evidence index", { actor, currentProviderState: status, completionInferred: false, journey: [{ step: "User Request", artifact: "latest-research.json" }, { step: "Agent Research", artifact: "agent-execution-log.json" }, { step: "Merchant Verification", artifact: "merchant-passport.json" }, { step: "Decision Ledger", artifact: "latest-decision-ledger.json" }, { step: "Prava Hosted Checkout", artifact: "latest-order-attempt.json" }, { step: "Verification Lifecycle", artifact: "verification-lifecycle.json" }, { step: "Trust Replay", artifact: "trust-replay.json" }] });
files["schema.json"] = artifact("public artifact schema", { envelope: { schemaVersion: "number", generatedAt: "ISO-8601 timestamp", project: "TrustLane", environment: "Prava Sandbox", source: "sanitized source description", data: "artifact-specific object" }, paymentCompletionRule: "Completion is never inferred. Only a genuine recorded Completed status may be represented as completed." });

const outputDir = path.resolve("public/demo-data");
fs.mkdirSync(outputDir, { recursive: true });
for (const [name, value] of Object.entries(files)) fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
console.log(`Generated ${Object.keys(files).length} sanitized artifacts from ${path.resolve(inputPath)} without network access.`);
