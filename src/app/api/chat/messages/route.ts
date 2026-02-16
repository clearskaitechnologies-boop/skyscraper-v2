/**
 * Chat Messages API
 * Handle listing and sending messages in a conversation
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { chatService } from "@/lib/services/chat-service";

// GET /api/chat/messages?conversationId=xxx - Get messages for a conversation
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const before = searchParams.get("before") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    // Get internal user ID
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ messages: [] });
    }

    try {
      const messages = await chatService.getMessages(conversationId, user.id, { limit, before });

      // Mark messages as read when fetching
      await chatService.markAsRead(conversationId, user.id);

      return NextResponse.json({ messages });
    } catch (error) {
      logger.debug("Chat tables may not exist:", error);
      return NextResponse.json({ messages: [] });
    }
  } catch (error) {
    logger.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, content, messageType = "text", attachments } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    if (!content?.trim() && messageType === "text") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Get current user
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const senderRole = (user.role as string) === "contractor" ? "pro" : "client";

    try {
      const result = await chatService.sendMessage(
        conversationId,
        user.id,
        senderRole as "client" | "pro",
        content,
        messageType,
        attachments
      );

      if (result.success) {
        return NextResponse.json({ message: result.message });
      } else {
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
      }
    } catch (error) {
      logger.error("Error sending message (tables may not exist):", error);
      // Return mock message
      return NextResponse.json({
        message: {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: user.id,
          senderRole,
          content,
          messageType,
          attachments: attachments || [],
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    logger.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
