import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

import { getOpenAI } from "@/lib/ai/client";
import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";
import { safeAI } from "@/lib/aiGuard";
import { aiFail } from "@/lib/api/aiResponse";
import prisma from "@/lib/prisma";
import { assistantSchema, validateAIRequest } from "@/lib/validation/aiSchemas";

const openai = getOpenAI();

// Use Node.js runtime to allow Prisma access
export const runtime = "nodejs";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST_INNER(req: NextRequest, ctx: { userId: string; orgId: string }) {
  // Early return if API key is missing
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify(aiFail("AI unavailable: missing OpenAI key", "NO_API_KEY")),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { userId } = ctx;

  const body = await req.json();
  const validated = validateAIRequest(assistantSchema, body);
  if (!validated.success) {
    return new Response(JSON.stringify(aiFail(validated.error, "BAD_INPUT")), { status: 422 });
  }

  const { message, sessionId, voiceEnabled } = validated.data;

  // Get or create session
  let session;
  if (sessionId) {
    session = await prisma.$queryRaw<any[]>`
      SELECT * FROM ai_sessions WHERE id = ${sessionId} AND "user_id" = ${userId} LIMIT 1
    `.then((r) => r[0]);
  }

  if (!session) {
    const orgId = userId; // Simplified - use Clerk metadata in production
    try {
      await prisma.$executeRaw`
        INSERT INTO ai_sessions ("org_id", "user_id", voice_enabled)
        VALUES (${orgId}, ${userId}, ${voiceEnabled || false})
        RETURNING id
      `;
      session = await prisma.$queryRaw<any[]>`
        SELECT * FROM ai_sessions WHERE "user_id" = ${userId} ORDER BY created_at DESC LIMIT 1
      `.then((r) => r[0]);
    } catch (err) {
      logger.warn("[AI ASSISTANT] ai_sessions table error, continuing without session logging", {
        error: err.message,
      });
      // Create a mock session object to continue
      session = { id: `temp_${Date.now()}`, org_id: orgId, user_id: userId };
    }
  }

  // Store user message
  await prisma.$executeRaw`
    INSERT INTO ai_messages (session_id, role, content, is_voice)
    VALUES (${session.id}, 'user', ${message}, ${voiceEnabled || false})
  `;

  // Build conversation history
  const history = await prisma.$queryRaw<any[]>`
    SELECT role, content FROM ai_messages
    WHERE session_id = ${session.id}
    ORDER BY created_at ASC
  `;

  const messages: Message[] = [
    {
      role: "system",
      content: `You are SkaiScraper AI, an intelligent roofing industry assistant. Help users with:
- Navigating the platform ("show me claims", "open reports")
- Answering questions about features
- Providing insights on data

Keep responses concise and actionable. Current user: ${userId}`,
    },
    ...history.map((h: any) => ({ role: h.role, content: h.content })),
  ];

  // Stream OpenAI response (guarded)
  const ai = await safeAI("assistant-stream", () =>
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    })
  );

  if (!ai.ok) {
    return new Response(
      JSON.stringify(aiFail(ai.error || "AI stream failed", "STREAM_ERROR", { error: ai.error })),
      { status: ai.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = ai.result;

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        // Store assistant response
        await prisma.$executeRaw`
          INSERT INTO ai_messages (session_id, role, content)
          VALUES (${session.id}, 'assistant', ${fullResponse})
        `;

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        logger.error("AI streaming error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const POST = withAiBilling(
  createAiConfig("ai_assistant", { costPerRequest: 10 }),
  POST_INNER
);
