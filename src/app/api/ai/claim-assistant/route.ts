import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getOpenAI } from "@/lib/ai/client";

// Force Node.js runtime for OpenAI SDK
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { message, claimId, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Get auth - but allow demo claims to work
    const { userId } = await auth();

    // Initialize OpenAI client
    const openai = getOpenAI();

    const systemPrompt = `You are an expert roofing and restoration claim assistant. Help contractors with:
- Supplement strategy and negotiations
- Weather verification and storm data
- Claim approval probability analysis
- Documentation and photo best practices
- Carrier-specific requirements
- Material pricing and labor calculations

Provide actionable, specific advice. Use markdown formatting for clarity. Keep responses under 200 words.`;

    const contextMessages =
      history?.slice(-5).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

    logger.debug("[claim-assistant] Making OpenAI request for user:", userId || "demo");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        { role: "user", content: message + (claimId ? ` (Claim ID: ${claimId})` : "") },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    logger.debug("[claim-assistant] OpenAI response received successfully");

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[claim-assistant] Error:", error?.message || error);

    // Return more specific error messages
    if (error?.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please contact support." },
        { status: 503 }
      );
    }
    if (error?.code === "invalid_api_key") {
      return NextResponse.json({ error: "AI service configuration error." }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
