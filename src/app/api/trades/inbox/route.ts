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

    const threads: any = await prisma.$queryRaw`
      SELECT * FROM v_tn_inbox
      ORDER BY last_message_at DESC NULLS LAST
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
