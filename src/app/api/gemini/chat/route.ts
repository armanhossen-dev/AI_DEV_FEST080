import { NextRequest, NextResponse } from "next/server";
import { askSentinelCopilot } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const result = await askSentinelCopilot(query, context || {});
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Copilot API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate copilot response", details: error.message },
      { status: 500 }
    );
  }
}
