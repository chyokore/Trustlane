import { arrayOfStrings, boolean, runStructuredAgent, string } from "./openai";
import type { ShoppingIntent } from "./types";
import { prompts } from "@/lib/prompts";
export const runIntentAgent = (prompt: string) => runStructuredAgent<ShoppingIntent>("shopping_intent", prompts.intent, { prompt }, { type: "object", additionalProperties: false, required: ["product", "budget", "currency", "language", "shippingDestination", "warrantyRequired", "merchantPreference", "requirements"], properties: { product: string, budget: string, currency: string, language: string, shippingDestination: string, warrantyRequired: boolean, merchantPreference: string, requirements: arrayOfStrings } });
