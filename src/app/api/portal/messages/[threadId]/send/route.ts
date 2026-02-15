import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/portal/messages/[threadId]/send
 * Sends a message in an existing thread.
 * Works for BOTH client (portal) users and pro users.
 */
export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = params.threadId;
    const body = await req.json();
    const { body: messageBody } = body;

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json({ error: "Message body required" }, { status: 400 });
    }

    // Verify thread exists and user has access via participants or clientId
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Access check: userId in participants, OR user owns the linked client record
    let hasAccess = thread.participants.includes(userId);
    if (!hasAccess && thread.clientId) {
      const client = await prisma.client.findFirst({ where: { id: thread.clientId, userId } });
      if (client) hasAccess = true;
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        threadId,
        senderUserId: userId,
        senderType: "client",
        body: messageBody,
        fromPortal: true,
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    // Notify other participants (skip the sender)
    const otherParticipants = thread.participants.filter((p) => p !== userId);
    for (const participantOrgId of otherParticipants) {
      try {
        await prisma.tradeNotification.create({
          data: {
            recipientId: participantOrgId,
            type: "new_message",
            title: "New Message",
            message: messageBody.substring(0, 200),
            actionUrl: `/trades/messages?thread=${threadId}`,
            metadata: { threadId, senderType: "client" },
          },
        });
      } catch (notifError) {
        console.error("[portal/messages] Notification create failed:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("[SEND_MESSAGE_ERROR]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
