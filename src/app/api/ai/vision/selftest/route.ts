export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * AI Vision Selftest API
 *
 * Verifies OpenAI API key, model access, and Vision API connectivity.
 * Returns success/failure to confirm server can reach OpenAI.
 *
 * Requires authentication - calls billable OpenAI API.
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

async function GET_INNER(_req: Request, ctx: { userId: string; orgId: string | null }) {
  const { userId, orgId } = ctx;

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "OPENAI_API_KEY missing from environment",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Test Vision API
  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Return 'ok' only.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "ping",
            },
            {
              type: "image_url",
              image_url: {
                url: "https://picsum.photos/600", // Random test image
              },
            },
          ],
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      ok: true,
      content,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("OpenAI Vision selftest failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || String(error),
        code: error.code,
        type: error.type,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withAiBilling(createAiConfig("vision_selftest", { costPerRequest: 0 }), GET_INNER);
