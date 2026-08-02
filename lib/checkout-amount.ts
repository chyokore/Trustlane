export function sanitizeCheckoutAmount(value: string | number): string {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  const match = value.replace(/,/g, "").match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)/);
  return match?.[0] ?? "";
}

export function parseCheckoutAmount(value: string | number): number {
  const sanitized = sanitizeCheckoutAmount(value);
  if (!sanitized) return Number.NaN;
  const amount = Number(sanitized);
  return Number.isFinite(amount) && amount > 0 ? amount : Number.NaN;
}
