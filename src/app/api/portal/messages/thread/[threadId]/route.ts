import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

/**
 * GET /api/portal/messages/thread/:threadId
 * Get thread details with messages for client portal
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await context.params;

    // Resilient client lookup: userId → email fallback → auto-create
    let client = await prisma.client.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      // Fallback: lookup by email from Clerk and backfill userId
      try {
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
        if (email) {
          client = await prisma.client.findFirst({
            where: { email, userId: null },
            select: { id: true },
          });
          if (client) {
            try {
              await prisma.client.update({
                where: { id: client.id },
                data: { userId },
              });
            } catch {
              /* userId unique constraint – ignore */
            }
          }
        }
      } catch {
        /* currentUser() failed */
      }
    }

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    // Get thread with messages - check clientId OR participants list
    const thread = await prisma.messageThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { clientId: client.id },
          { participants: { has: userId } },
          { participants: { has: client.id } },
        ],
      },
      include: {
        Message: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Get contractor details
    const contractor = thread.tradePartnerId
      ? await prisma.tradesCompany.findUnique({
          where: { id: thread.tradePartnerId },
          select: {
            id: true,
            name: true,
            logo: true,
            isVerified: true,
            rating: true,
            specialties: true,
          },
        })
      : null;

    // Transform messages to match UI format
    // Use senderUserId match for ownership — covers both Clerk userId and client.id
    const messages = thread.Message.map((msg) => ({
      id: msg.id,
      content: msg.body,
      senderId: msg.senderUserId,
      senderType: msg.senderType,
      createdAt: msg.createdAt.toISOString(),
      isOwn: msg.senderUserId === userId || msg.senderUserId === client.id,
    }));

    // Build response
    const response = {
      id: thread.id,
      tradePartnerId: thread.tradePartnerId || null,
      participantName: contractor?.name || "Contractor",
      participantAvatar: contractor?.logo || null,
      verified: contractor?.isVerified || false,
      rating: contractor?.rating || null,
      trade:
        contractor?.specialties && contractor.specialties.length > 0
          ? contractor.specialties[0]
          : null,
      messages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}
