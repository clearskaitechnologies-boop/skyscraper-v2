import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export async function GET(req: Request) {
  const ctx = await safeOrgContext();

  if (ctx.status !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all message threads where user is a participant
    const threads = await prisma.messageThread.findMany({
      where: {
        orgId: ctx.orgId ?? undefined,
        participants: {
          has: ctx.userId,
        },
      },
      include: {
        Message: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Last message
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculate unread count for each thread
    const threadsWithUnread = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await prisma.message.count({
          where: {
            threadId: thread.id,
            senderUserId: { not: ctx.userId ?? undefined },
            read: false,
          },
        });

        return {
          ...thread,
          unreadCount,
          lastMessage: (thread as Record<string, unknown>).Message?.[0] || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: threadsWithUnread });
  } catch (error) {
    logger.error("Error fetching message threads:", error);
    return NextResponse.json({ error: "Failed to fetch message threads" }, { status: 500 });
  }
}
