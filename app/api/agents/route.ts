import { runShoppingAgents } from "@/lib/agents/agent-orchestrator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { prompt?: unknown };
    if (typeof body.prompt !== "string" || body.prompt.trim().length < 3) return Response.json({ error: "Please provide a shopping prompt." }, { status: 400 });
    const result = await runShoppingAgents(body.prompt.trim());
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI research could not be completed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
