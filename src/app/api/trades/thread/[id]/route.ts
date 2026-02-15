import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Prisma singleton imported from @/lib/db/prisma

/**
 * GET /api/trades/thread/[id]
 *
 * Returns all messages in a thread (if user is participant)
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = params.id;

    // Verify user is participant
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

    // Get thread info
    const thread = await prisma.$queryRaw<Array<any>>`
      SELECT t.*, p.title as post_title
      FROM tn_threads t
      LEFT JOIN tn_posts p ON p.id = t.post_id
      WHERE t.id = ${threadId}::uuid
    `;

    // Get participants
    const participants = await prisma.$queryRaw<Array<{ userId: string; role: string }>>`
      SELECT userId, role
      FROM tn_participants
      WHERE thread_id = ${threadId}::uuid
    `;

    // Get messages
    const messages = await prisma.$queryRaw<Array<any>>`
      SELECT 
        id,
        thread_id,
        sender_id,
        body,
        attachments,
        created_at
      FROM tn_messages
      WHERE thread_id = ${threadId}::uuid
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      ok: true,
      thread: thread[0],
      participants: participants || [],
      messages: messages || [],
    });
  } catch (err: any) {
    console.error("Get thread error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
