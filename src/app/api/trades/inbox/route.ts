import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Prisma singleton imported from @/lib/db/prisma

/**
 * GET /api/trades/inbox
 *
 * Returns user's message threads with last message preview
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's trades member ID for proper inbox scoping
    const memberRecord = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!memberRecord) {
      return NextResponse.json({ ok: true, threads: [], count: 0 });
    }

    const memberId = memberRecord.id;

    // Query inbox scoped to threads where user is a participant
    const threads: any = await prisma.$queryRaw`
      SELECT DISTINCT ON (t.id)
        t.id as thread_id,
        t.post_id,
        t.visibility,
        t.created_at as thread_created_at,
        m.created_at as last_message_at,
        (SELECT COUNT(*) FROM tn_messages WHERE thread_id = t.id) as message_count,
        m.body as last_message_body,
        m.sender_id as last_sender_id
      FROM tn_threads t
      LEFT JOIN tn_messages m ON m.thread_id = t.id
      WHERE EXISTS (
        SELECT 1 FROM tn_participants
        WHERE thread_id = t.id
        AND user_id = ${memberId}::uuid
      )
      ORDER BY t.id, m.created_at DESC
    `;

    return NextResponse.json({
      ok: true,
      threads: threads || [],
      count: threads?.length || 0,
    });
  } catch (err: any) {
    console.error("Get inbox error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
