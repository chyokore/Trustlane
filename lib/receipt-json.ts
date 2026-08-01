import type { CheckoutAttempt } from "@/types/dashboard-state";

export function receiptPayload(attempt: CheckoutAttempt) {
  return { schema: "trustlane.receipt.v1", generatedAt: new Date().toISOString(), provider: "Prava Sandbox", orderAttempt: attempt };
}
export function downloadReceiptJson(attempt: CheckoutAttempt) {
  const blob = new Blob([JSON.stringify(receiptPayload(attempt), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `trustlane-receipt-${attempt.id}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
