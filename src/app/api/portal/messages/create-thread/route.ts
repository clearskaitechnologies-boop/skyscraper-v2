import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/portal/messages/create-thread
 * Creates a message thread between homeowner and contractor.
 * Works for client (portal) users — no org context required.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contractorOrgId, contractorId, subject, initialMessage } = body;

    // Support both contractorOrgId (legacy) and contractorId (from profile pages)
    let targetOrgId = contractorOrgId;

    if (!targetOrgId && contractorId) {
      // contractorId is a tradesCompanyMember.id - look up their company/org
      const member = await prisma.tradesCompanyMember.findUnique({
        where: { id: contractorId },
        select: {
          id: true,
          companyId: true,
          userId: true,
          company: {
            select: { id: true },
          },
        },
      });

      if (member?.companyId) {
        targetOrgId = member.companyId;
      } else if (member?.userId) {
        // Fall back to using memberId as a participant identifier
        targetOrgId = member.id;
      }
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: "Contractor ID required" }, { status: 400 });
    }

    // Look up the client record for this user (if they have one)
    const clientRecord = await prisma.client.findFirst({
      where: { userId },
      select: { id: true, name: true },
    });

    // Check if thread already exists between these parties
    // Also check for threads using clientId + tradePartnerId pattern
    const existingThread = await prisma.messageThread.findFirst({
      where: {
        OR: [
          {
            participants: {
              hasEvery: [userId, targetOrgId],
            },
          },
          // Also match by clientId + tradePartnerId if a client record exists
          ...(clientRecord ? [{ clientId: clientRecord.id, tradePartnerId: targetOrgId }] : []),
        ],
      },
    });

    if (existingThread) {
      // If the thread exists but doesn't have initial message, send one
      if (initialMessage) {
        const existingMsg = await prisma.message.findFirst({
          where: { threadId: existingThread.id },
        });
        if (!existingMsg) {
          await prisma.message.create({
            data: {
              id: crypto.randomUUID(),
              threadId: existingThread.id,
              senderUserId: userId,
              senderType: "client",
              body: initialMessage,
              fromPortal: true,
            },
          });
          await prisma.messageThread.update({
            where: { id: existingThread.id },
            data: { updatedAt: new Date() },
          });
        }
      }

      return NextResponse.json({
        success: true,
        threadId: existingThread.id,
        existing: true,
      });
    }

    // Create new thread with both participants AND clientId/tradePartnerId for cross-system compatibility
    const thread = await prisma.messageThread.create({
      data: {
        id: crypto.randomUUID(),
        subject: subject || "New Message",
        participants: [userId, targetOrgId].filter((v, i, a) => a.indexOf(v) === i), // deduplicate
        orgId: targetOrgId, // Set to contractor's company ID so they can find it
        clientId: clientRecord?.id || null, // Link to client record if exists
        tradePartnerId: targetOrgId, // Link to contractor company
        isPortalThread: true,
      },
    });

    // Send initial message if provided
    if (initialMessage) {
      await prisma.message.create({
        data: {
          id: crypto.randomUUID(),
          threadId: thread.id,
          senderUserId: userId,
          senderType: "client",
          body: initialMessage,
          fromPortal: true,
        },
      });

      // Update thread with last message timestamp
      await prisma.messageThread.update({
        where: { id: thread.id },
        data: { updatedAt: new Date() },
      });
    }

    // Create notification for contractor
    try {
      await prisma.tradeNotification.create({
        data: {
          recipientId: targetOrgId,
          type: "new_message",
          title: "New Message Thread",
          message: initialMessage
            ? initialMessage.substring(0, 200)
            : "A client started a new conversation",
          actionUrl: `/trades/messages?thread=${thread.id}`,
          metadata: { threadId: thread.id, senderType: "client" },
        },
      });
    } catch (notifError) {
      console.error("[portal/messages/create-thread] Notification create failed:", notifError);
    }

    return NextResponse.json({
      success: true,
      threadId: thread.id,
      existing: false,
    });
  } catch (error) {
    console.error("[CREATE_THREAD_ERROR]", error);
    return NextResponse.json({ error: "Failed to create message thread" }, { status: 500 });
  }
}
