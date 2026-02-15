import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Prisma singleton imported from @/lib/db/prisma

/**
 * POST /api/trades/send-message
 * Body: { threadId: string, body: string, attachments?: any[] }
 *
 * Sends a message in an existing thread.
 * - First message in thread costs 1 token (unless Full Access)
 * - Replies are free for all users
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId, body, attachments = [] } = await req.json();

    if (!threadId || !body) {
      return NextResponse.json({ error: "Missing threadId or body" }, { status: 400 });
    }

    // Check if user is participant in thread
    const participant = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM tn_participants 
      WHERE thread_id = ${threadId}::uuid 
      AND user_id = ${userId}::uuid
    `;

    if (!participant || Number(participant[0]?.count) === 0) {
      return NextResponse.json(
        { error: "You are not a participant in this thread" },
        { status: 403 }
      );
    }

    // Check if this is the first message in thread (costs token)
    const messageCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM tn_messages 
      WHERE thread_id = ${threadId}::uuid
    `;

    const isFirstMessage = Number(messageCount[0]?.count) === 0;

    // If first message, check Full Access or deduct token
    if (isFirstMessage) {
      const hasFullAccess = await prisma.$queryRaw<Array<{ has_access: boolean }>>`
        SELECT has_full_access(${userId}::uuid) as has_access
      `;

      if (!hasFullAccess[0]?.has_access) {
        // Deduct 1 token
        const tokenResult = await prisma.$queryRaw<Array<{ success: boolean }>>`
          SELECT tokens_spend(${userId}::uuid, 1) as success
        `;

        if (!tokenResult[0]?.success) {
          return NextResponse.json(
            {
              error: "insufficient_tokens",
              description: "You need 1 token to start a conversation",
            },
            { status: 402 }
          );
        }
      }
    }

    // Insert message
    const message = await prisma.$queryRaw<Array<any>>`
      INSERT INTO tn_messages (thread_id, sender_id, body, attachments)
      VALUES (${threadId}::uuid, ${userId}::uuid, ${body}, ${JSON.stringify(attachments)}::jsonb)
      RETURNING id, thread_id, sender_id, body, attachments, created_at
    `;

    return NextResponse.json({
      ok: true,
      description: message[0],
      tokenSpent: isFirstMessage ? 1 : 0,
    });
  } catch (err: any) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
