/**
 * Portal Messages Actions - Unified handler for messaging operations
 *
 * POST /api/portal/messages/actions
 * Actions: send, create_thread, mark_read
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("send"),
    threadId: z.string(),
    content: z.string(),
    attachments: z.array(z.string()).optional(),
  }),
  z.object({
    action: z.literal("create_thread"),
    recipientId: z.string(),
    subject: z.string().optional(),
    initialMessage: z.string(),
    claimId: z.string().optional(),
    jobId: z.string().optional(),
  }),
  z.object({
    action: z.literal("mark_read"),
    threadId: z.string(),
  }),
  z.object({
    action: z.literal("archive"),
    threadId: z.string(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    switch (input.action) {
      case "send":
        return handleSend(userId, input);

      case "create_thread":
        return handleCreateThread(userId, input);

      case "mark_read":
        return handleMarkRead(userId, input);

      case "archive":
        return handleArchive(userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Portal Messages Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleSend(userId: string, input: Extract<ActionInput, { action: "send" }>) {
  // Verify user has access to thread
  const thread = await prisma.messageThread.findFirst({
    where: {
      id: input.threadId,
      participants: {
        some: { oduserId: userId },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      threadId: input.threadId,
      senderId: userId,
      content: input.content,
      attachments: input.attachments || [],
    },
  });

  // Update thread's last message timestamp
  await prisma.messageThread.update({
    where: { id: input.threadId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, message });
}

async function handleCreateThread(
  userId: string,
  input: Extract<ActionInput, { action: "create_thread" }>
) {
  // Create thread with participants
  const thread = await prisma.messageThread.create({
    data: {
      subject: input.subject,
      claimId: input.claimId,
      jobId: input.jobId,
      participants: {
        create: [{ oduserId: userId }, { oduserId: input.recipientId }],
      },
      messages: {
        create: {
          senderId: userId,
          content: input.initialMessage,
        },
      },
    },
    include: {
      messages: true,
      participants: true,
    },
  });

  return NextResponse.json({ success: true, thread });
}

async function handleMarkRead(
  userId: string,
  input: Extract<ActionInput, { action: "mark_read" }>
) {
  // Mark all messages in thread as read for this user
  await prisma.messageReadReceipt.upsert({
    where: {
      threadId_userId: {
        threadId: input.threadId,
        oduserId: userId,
      },
    },
    create: {
      threadId: input.threadId,
      oduserId: userId,
      readAt: new Date(),
    },
    update: {
      readAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

async function handleArchive(userId: string, input: Extract<ActionInput, { action: "archive" }>) {
  // Archive thread for this user
  await prisma.threadArchive.create({
    data: {
      threadId: input.threadId,
      oduserId: userId,
      archivedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
