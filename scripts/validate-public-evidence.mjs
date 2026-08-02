import fs from "node:fs";
import path from "node:path";
const directory = path.resolve("public/demo-data");
const forbiddenKeys = /^(email|cvv|cardNumber|card_number|otp|passkey|authorization|bearer|secret|apiKey|accessToken|paymentCredentials|stableUserId)$/i;
const forbiddenValues = /(Bearer\s+[A-Za-z0-9._-]+|sk_(test|live)_[A-Za-z0-9_-]+|\b\d{13,19}\b|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/i;
function inspect(value, location) { if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, `${location}[${index}]`)); if (value && typeof value === "object") return Object.entries(value).forEach(([key, item]) => { if (forbiddenKeys.test(key) && item != null && item !== "") throw new Error(`Sensitive key ${location}.${key}`); inspect(item, `${location}.${key}`); }); if (typeof value === "string" && forbiddenValues.test(value)) throw new Error(`Sensitive value at ${location}`); }
const files = fs.readdirSync(directory).filter((name) => name.endsWith(".json"));
if (files.length !== 9) throw new Error(`Expected 9 JSON artifacts, found ${files.length}.`);
for (const name of files) { const parsed = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8")); if (parsed.schemaVersion !== 1 || parsed.project !== "TrustLane" || parsed.environment !== "Prava Sandbox" || !parsed.generatedAt || !("data" in parsed)) throw new Error(`Invalid envelope: ${name}`); inspect(parsed, name); }
console.log(`Validated ${files.length} public evidence artifacts; no sensitive fields or values detected.`);
