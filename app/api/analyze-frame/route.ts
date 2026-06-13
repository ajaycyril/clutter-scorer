import { NextResponse } from "next/server";
import { analyzeFrameWithGemini } from "../../../lib/gemini";
import { analyzeFrameRequestSchema } from "../../../lib/schema";

export const runtime = "nodejs";

function typedError(error: string, detail: string, status: number) {
  return NextResponse.json({ error, detail }, { status });
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return typedError("GEMINI_API_KEY_MISSING", "Add GEMINI_API_KEY to run physical reasoning.", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return typedError("REQUEST_JSON_INVALID", "Request body must be valid JSON.", 400);
  }

  const parsed = analyzeFrameRequestSchema.safeParse(body);
  if (!parsed.success) {
    return typedError("REQUEST_INVALID", parsed.error.issues.map((issue) => issue.message).join("; "), 400);
  }

  if (!parsed.data.edgeMetrics.usable) {
    return typedError(
      "FRAME_NOT_USABLE",
      parsed.data.edgeMetrics.rejectionReason ?? "The selected frame is not usable for analysis.",
      422,
    );
  }

  try {
    const analysis = await analyzeFrameWithGemini(parsed.data);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (message === "MODEL_RESPONSE_INVALID") {
      return typedError("MODEL_RESPONSE_INVALID", "Gemini response did not match schema.", 502);
    }
    if (message === "MODEL_RESPONSE_EMPTY") {
      return typedError("MODEL_RESPONSE_EMPTY", "Gemini returned an empty response.", 502);
    }
    return typedError("GEMINI_REQUEST_FAILED", message, 502);
  }
}
