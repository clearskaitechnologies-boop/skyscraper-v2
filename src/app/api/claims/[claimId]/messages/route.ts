export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/claims/[claimId]/messages
 * List all message threads for a claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: params.claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Fetch threads for this claim
    const threads = await prisma.messageThread.findMany({
      where: { claimId: params.claimId },
      include: {
        Message: {
          orderBy: { createdAt: "desc" },
          take: 1, // Just the latest message for preview
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, threads });
  } catch (error) {
    logger.error("Failed to fetch message threads:", error);
    return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
  }
}

/**
 * POST /api/claims/[claimId]/messages
 * Send a message (creates thread if needed)
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      threadId,
      subject,
      body: messageBody,
      recipientType,
      recipientId,
      isPortalThread,
    } = body;

    if (!messageBody?.trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: params.claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    let thread;

    // Create new thread if threadId not provided
    if (!threadId) {
      if (!subject?.trim()) {
        return NextResponse.json({ error: "Subject is required for new threads" }, { status: 400 });
      }

      const participants = [userId];
      if (recipientId) participants.push(recipientId);

      thread = await prisma.messageThread.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          claimId: params.claimId,
          subject,
          participants,
          isPortalThread: isPortalThread || false,
          tradePartnerId: recipientType === "trade" ? recipientId : undefined,
          clientId: recipientType === "client" ? recipientId : undefined,
        },
      });
    } else {
      // Verify thread exists and belongs to claim
      thread = await prisma.messageThread.findFirst({
        where: {
          id: threadId,
          claimId: params.claimId,
          orgId,
        },
      });

      if (!thread) {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        threadId: thread.id,
        senderUserId: userId,
        senderType: "pro",
        body: messageBody.trim(),
        fromPortal: false,
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    // Emit timeline event for message sent
    await prisma.claim_timeline_events
      .create({
        data: {
          id: crypto.randomUUID(),
          claim_id: params.claimId,
          actor_id: userId,
          type: "message_sent",
          description: `Message sent in thread: ${thread.subject || "Discussion"}`,
          visible_to_client: thread.participants.includes("client"),
        },
      })
      .catch((err) => logger.error("Failed to create timeline event:", err));

    // Create notification for recipient (if they're not the sender)
    const notificationRecipientId = thread.participants.find((p) => p !== userId);
    if (notificationRecipientId) {
      await prisma.projectNotification
        .create({
          data: {
            id: crypto.randomUUID(),
            orgId,
            claimId: params.claimId,
            notificationType: "new_message",
            title: "New Message",
            message: `New message in: ${thread.subject || "Discussion"}`,
            metadata: {
              recipientId: notificationRecipientId,
              threadId: thread.id,
              threadType: "message_thread",
            },
          },
        })
        .catch((err) => logger.error("Failed to create notification:", err));
    }

    return NextResponse.json({ success: true, message, threadId: thread.id });
  } catch (error) {
    logger.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
