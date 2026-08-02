const guestIdPattern = /^trustlane_guest_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCheckoutEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim().toLowerCase();
  if (!emailPattern.test(email)) return undefined;
  const domain = email.split("@")[1];
  if (!domain || domain === "example.com" || domain.endsWith(".example.com") || domain.endsWith(".local")) return undefined;
  return email;
}

export function isStableCheckoutUserId(value: unknown): value is string {
  return typeof value === "string" && guestIdPattern.test(value);
}

export function createStableCheckoutUserId(): string {
  return `trustlane_guest_${crypto.randomUUID()}`;
}
