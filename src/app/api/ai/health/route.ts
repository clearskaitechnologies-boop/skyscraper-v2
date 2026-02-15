/**
 * AI Health Check Endpoint
 * GET /api/ai/health
 *
 * Returns AI service configuration status without making actual OpenAI API calls.
 * Use this to verify that OpenAI is properly configured in production.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const keyLength = process.env.OPENAI_API_KEY?.length || 0;
  const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7) || "missing";

  return NextResponse.json({
    status: hasOpenAIKey ? "healthy" : "unhealthy",
    ai: {
      openai: {
        configured: hasOpenAIKey,
        keyLength,
        keyPrefix, // Shows "sk-proj" or similar for verification
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      },
    },
    runtime: "nodejs",
    timestamp: new Date().toISOString(),
  });
}
