import "server-only";
import { openai } from "@/services/openai";

export async function runStructuredAgent<T>(name: string, instructions: string, input: unknown, schema: Record<string, unknown>): Promise<T> {
  const payload = await openai.createResponse({ instructions, input: JSON.stringify(input), text: { format: { type: "json_schema", name, strict: true, schema } } });
  const text = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no structured output.");
  return JSON.parse(text) as T;
}

export const string = { type: "string" };
export const boolean = { type: "boolean" };
export const integer = { type: "integer" };
export const arrayOfStrings = { type: "array", items: string };
