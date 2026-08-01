import "server-only";

export class OpenAIRequestError extends Error {
  constructor(message: string, readonly diagnostics: { status?: number; code?: string; type?: string; request_id?: string; responseBody?: unknown; cause?: unknown }) {
    super(message);
    this.name = "OpenAIRequestError";
  }
}

/** A small server-only Responses API client. Its public surface can be swapped for the OpenAI SDK without affecting agents. */
export const openai = {
  async createResponse(body: Record<string, unknown>) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.OPENAI_MODEL;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
      if (!model) throw new Error("OPENAI_MODEL is not configured.");
      const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, ...body }), cache: "no-store", signal: AbortSignal.timeout(90_000) });
      if (!response.ok) {
        const responseBody: unknown = await response.json().catch(async () => await response.text().catch(() => undefined));
        const apiError = typeof responseBody === "object" && responseBody !== null && "error" in responseBody ? (responseBody as { error?: { code?: string; type?: string; message?: string } }).error : undefined;
        const diagnostics = { status: response.status, code: apiError?.code, type: apiError?.type, message: apiError?.message, request_id: response.headers.get("x-request-id") ?? undefined, responseBody };
        const error = new OpenAIRequestError(apiError?.message ?? `OpenAI request failed (${response.status}).`, diagnostics);
        console.error("[TrustLane OpenAI error]", error, diagnostics);
        throw error;
      }
      return response.json() as Promise<{ output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }>;
    } catch (error) {
      if (error instanceof OpenAIRequestError) throw error;
      const diagnostics = { status: undefined, code: undefined, type: error instanceof DOMException && error.name === "TimeoutError" ? "timeout" : undefined, message: error instanceof Error ? error.message : String(error), request_id: undefined, responseBody: undefined, cause: error };
      console.error("[TrustLane OpenAI error]", error, diagnostics);
      throw new OpenAIRequestError(diagnostics.message, diagnostics);
    }
  },
};
