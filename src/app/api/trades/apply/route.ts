import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Prisma singleton imported from @/lib/db/prisma

/**
 * POST /api/trades/apply
 * Body: { postId: string, intro: string, attachments?: any[] }
 *
 * Apply to a job opportunity.
 * - Creates a new thread with poster and applicant
 * - Sends first message with intro
 * - Costs 1 token (unless Full Access)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, intro, attachments = [] } = await req.json();

    if (!postId || !intro) {
      return NextResponse.json({ error: "Missing postId or intro" }, { status: 400 });
    }

    // Get post and verify it exists
    const post = await prisma.$queryRaw<
      Array<{
        id: string;
        created_by: string;
        title: string;
        is_active: boolean;
      }>
    >`
      SELECT id, created_by, title, is_active 
      FROM tn_posts 
      WHERE id = ${postId}::uuid 
      AND is_active = true
    `;

    if (!post || post.length === 0) {
      return NextResponse.json({ error: "Post not found or inactive" }, { status: 404 });
    }

    const postData = post[0];

    // Can't apply to your own post
    if (postData.created_by === userId) {
      return NextResponse.json({ error: "Cannot apply to your own opportunity" }, { status: 400 });
    }

    // Check Full Access or deduct token
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
            description: "You need 1 token to apply to opportunities",
          },
          { status: 402 }
        );
      }
    }

    // Create thread
    const thread = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO tn_threads (post_id, visibility, created_by)
      VALUES (${postId}::uuid, 'post_applicants', ${userId}::uuid)
      RETURNING id
    `;

    const threadId = thread[0].id;

    // Add participants (applicant + poster)
    await prisma.$queryRaw`
      INSERT INTO tn_participants (thread_id, userId, role)
      VALUES 
        (${threadId}::uuid, ${userId}::uuid, 'applicant'),
        (${threadId}::uuid, ${postData.created_by}::uuid, 'poster')
    `;

    // Send first message
    const message = await prisma.$queryRaw<Array<any>>`
      INSERT INTO tn_messages (thread_id, sender_id, body, attachments)
      VALUES (${threadId}::uuid, ${userId}::uuid, ${intro}, ${JSON.stringify(attachments)}::jsonb)
      RETURNING id, thread_id, sender_id, body, created_at
    `;

    return NextResponse.json({
      ok: true,
      threadId,
      description: message[0],
      tokenSpent: hasFullAccess[0]?.has_access ? 0 : 1,
    });
  } catch (err: any) {
    console.error("Apply to post error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
