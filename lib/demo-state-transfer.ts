import type { VerifiedMerchantContext } from "@/services/senso";
import type { CheckoutAttempt, LatestResearch, LocalPreferences, SavedProduct } from "@/types/dashboard-state";
import { dashboardStorage } from "@/lib/dashboard-storage";

const maxImportBytes = 2 * 1024 * 1024;
const preferencesKey = "trustlane.preferences";

export interface DemoStateExport {
  schemaVersion: 1;
  exportedAt: string;
  researchSnapshots: LatestResearch[];
  decisionLedger: [];
  orderAttempts: CheckoutAttempt[];
  verificationEvents: [];
  merchantPassport: VerifiedMerchantContext[];
  savedItems: SavedProduct[];
  preferences: LocalPreferences;
}

export interface DemoImportSummary { researchSnapshots: number; orderAttempts: number; verificationEvents: number; merchantPassport: number; savedItems: number; preferences: number; }

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
const sensitiveKey = /(email|token|api.?key|card|cvv|otp|passkey|credential|secret|authorizationHeader)/i;
function stripSensitive(value: unknown): unknown { if (Array.isArray(value)) return value.map(stripSensitive); if (!isRecord(value)) return value; return Object.fromEntries(Object.entries(value).filter(([key]) => !sensitiveKey.test(key)).map(([key, item]) => [key, stripSensitive(item)])); }
function validResearch(value: unknown): value is LatestResearch { return isRecord(value) && isRecord(value.intent) && isRecord(value.researchSummary) && isRecord(value.decisionLedger) && isRecord(value.recommendedProduct); }
function validAttempt(value: unknown): value is CheckoutAttempt { return isRecord(value) && typeof value.id === "string" && typeof value.product === "string" && typeof value.merchant === "string" && typeof value.amount === "string" && typeof value.currency === "string" && typeof value.status === "string" && typeof value.timestamp === "string" && (!value.events || Array.isArray(value.events)); }
function validMerchant(value: unknown): value is VerifiedMerchantContext { return isRecord(value) && typeof value.merchant === "string" && typeof value.groundedAnswer === "string" && Array.isArray(value.citations) && typeof value.verificationStatus === "string"; }
function validSaved(value: unknown): value is SavedProduct { return isRecord(value) && typeof value.id === "string" && typeof value.name === "string" && typeof value.merchant === "string" && typeof value.price === "string" && typeof value.savedAt === "string"; }
function validPreferences(value: unknown): value is LocalPreferences { return isRecord(value) && typeof value.language === "string" && typeof value.currency === "string" && typeof value.notifications === "boolean" && typeof value.approvalRequired === "boolean" && typeof value.reducedMotion === "boolean"; }
function timestamp(value?: string) { const parsed = value ? Date.parse(value) : Number.NaN; return Number.isFinite(parsed) ? parsed : 0; }
function attemptIdentity(attempt: CheckoutAttempt) { return attempt.sessionId ? `session:${attempt.sessionId}` : attempt.orderId ? `order:${attempt.orderId}` : attempt.attemptId ? `attempt:${attempt.attemptId}` : `id:${attempt.id}`; }

export function createDemoStateExport(): DemoStateExport {
  const research = dashboardStorage.getResearch();
  const merchantContext = dashboardStorage.getMerchantContext();
  return stripSensitive({ schemaVersion: 1, exportedAt: new Date().toISOString(), researchSnapshots: research ? [research] : [], decisionLedger: [], orderAttempts: dashboardStorage.getOrders(), verificationEvents: [], merchantPassport: merchantContext ? [merchantContext] : [], savedItems: dashboardStorage.getSaved(), preferences: dashboardStorage.getPreferences() }) as DemoStateExport;
}

export function downloadDemoState() {
  const payload = createDemoStateExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `trustlane-demo-state-${payload.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importDemoState(file: File): Promise<DemoImportSummary> {
  if (!file.name.toLowerCase().endsWith(".json")) throw new Error("Select a TrustLane JSON export.");
  if (file.size <= 0 || file.size > maxImportBytes) throw new Error("The import file is empty or exceeds the 2 MB limit.");
  let raw: unknown;
  try { raw = JSON.parse(await file.text()) as unknown; } catch { throw new Error("The selected file is not valid JSON."); }
  if (!isRecord(raw) || raw.schemaVersion !== 1 || typeof raw.exportedAt !== "string" || !Array.isArray(raw.researchSnapshots) || !Array.isArray(raw.decisionLedger) || !Array.isArray(raw.orderAttempts) || !Array.isArray(raw.verificationEvents) || !Array.isArray(raw.merchantPassport) || !Array.isArray(raw.savedItems) || !validPreferences(raw.preferences)) throw new Error("This is not a valid TrustLane demo-state export.");
  if (!raw.researchSnapshots.every(validResearch) || !raw.orderAttempts.every(validAttempt) || !raw.merchantPassport.every(validMerchant) || !raw.savedItems.every(validSaved) || raw.decisionLedger.length !== 0 || raw.verificationEvents.length !== 0) throw new Error("The demo-state export contains malformed records.");

  const summary: DemoImportSummary = { researchSnapshots: 0, orderAttempts: 0, verificationEvents: 0, merchantPassport: 0, savedItems: 0, preferences: 0 };
  const importedResearch = raw.researchSnapshots[raw.researchSnapshots.length - 1] as LatestResearch | undefined;
  if (importedResearch && !dashboardStorage.getResearch()) { dashboardStorage.setResearch(importedResearch); summary.researchSnapshots = 1; }

  const existingOrders = new Map(dashboardStorage.getOrders().map((attempt) => [attemptIdentity(attempt), attempt]));
  for (const record of raw.orderAttempts as CheckoutAttempt[]) { const imported = stripSensitive(record) as CheckoutAttempt; const key = attemptIdentity(imported); const local = existingOrders.get(key); const importedIsNewer = !local || timestamp(imported.createdAt ?? imported.timestamp) > timestamp(local.createdAt ?? local.timestamp); if (importedIsNewer) { dashboardStorage.mergeOrder(imported); existingOrders.set(key, imported); summary.orderAttempts += 1; summary.verificationEvents += imported.events?.length ?? 0; } }

  const importedMerchant = raw.merchantPassport[raw.merchantPassport.length - 1] as VerifiedMerchantContext | undefined;
  const localMerchant = dashboardStorage.getMerchantContext();
  if (importedMerchant && (!localMerchant || timestamp(importedMerchant.verifiedAt) > timestamp(localMerchant.verifiedAt))) { dashboardStorage.setMerchantContext(importedMerchant); summary.merchantPassport = 1; }

  const saved = new Map(dashboardStorage.getSaved().map((item) => [item.id, item]));
  for (const imported of raw.savedItems as SavedProduct[]) { const local = saved.get(imported.id); if (!local || timestamp(imported.savedAt) > timestamp(local.savedAt)) { saved.set(imported.id, imported); summary.savedItems += 1; } }
  dashboardStorage.setSaved([...saved.values()].sort((left, right) => timestamp(right.savedAt) - timestamp(left.savedAt)));

  if (!window.localStorage.getItem(preferencesKey)) { dashboardStorage.setPreferences(raw.preferences); summary.preferences = 1; }
  return summary;
}

export function clearLocalDemoState() {
  const safeKeys = ["trustlane.latest-research", "trustlane.merchant-context", "trustlane.hosted-checkout", "trustlane.checkout-attempts", "trustlane.saved-products", "trustlane.preferences", "trustlane.checkout-email", "trustlane.checkout-user-id"];
  for (const key of safeKeys) window.localStorage.removeItem(key);
  window.dispatchEvent(new Event("trustlane-storage-updated"));
}
