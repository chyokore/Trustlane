import { runShoppingAgents } from "@/lib/agents/agent-orchestrator";
import { OpenAIRequestError } from "@/services/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const prompt = typeof body === "object" && body !== null && "prompt" in body ? (body as { prompt?: unknown }).prompt : undefined;
    if (typeof prompt !== "string" || prompt.trim().length < 3) return Response.json({ error: "Please provide a shopping prompt." }, { status: 400 });
    return Response.json(await runShoppingAgents(prompt.trim()));
  } catch (error) {
    console.error("[TrustLane research route error]", error);
    if (process.env.NODE_ENV !== "production") {
      const diagnostics = error instanceof OpenAIRequestError ? error.diagnostics : undefined;
      return Response.json({ error: error instanceof Error ? error.message : String(error), diagnostics }, { status: diagnostics?.status ?? 500 });
    }
    return Response.json({ error: "AI research could not be completed." }, { status: 500 });
  }
}
