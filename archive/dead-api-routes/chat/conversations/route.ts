/**
 * Chat Conversations API
 * Handle listing and creating conversations
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { chatService } from "@/lib/services/chat-service";

// GET /api/chat/conversations - List all conversations for current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get internal user ID
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    try {
      const conversations = await chatService.getConversations(user.id);
      return NextResponse.json({ conversations });
    } catch (error) {
      // Tables may not exist yet
      logger.debug("Chat tables may not exist:", error);
      return NextResponse.json({ conversations: [] });
    }
  } catch (error) {
    logger.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type = "direct",
      participantId,
      participantRole,
      participantName,
      participantAvatarUrl,
      referenceId,
    } = body;

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 });
    }

    // Get current user
    const currentUser = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, name: true, headshot_url: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserName = currentUser.name || "User";
    const currentUserRole = (currentUser.role as string) === "CONTRACTOR" ? "pro" : "client";

    try {
      const result = await chatService.createConversation(
        type,
        [
          {
            userId: currentUser.id,
            role: currentUserRole as "client" | "pro",
            name: currentUserName,
            avatarUrl: currentUser.headshot_url || undefined,
          },
          {
            userId: participantId,
            role: (participantRole || "pro") as "client" | "pro",
            name: participantName || "User",
            avatarUrl: participantAvatarUrl,
          },
        ],
        referenceId
      );

      if (result.success) {
        const conversation = await chatService.getConversation(
          result.conversationId!,
          currentUser.id
        );
        return NextResponse.json({ conversation });
      } else {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      }
    } catch (error) {
      logger.error("Error creating conversation (tables may not exist):", error);
      // Return mock conversation
      return NextResponse.json({
        conversation: {
          id: `temp-${Date.now()}`,
          type,
          participants: [
            { userId: currentUser.id, role: currentUserRole, name: currentUserName },
            {
              userId: participantId,
              role: participantRole || "pro",
              name: participantName || "User",
            },
          ],
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    logger.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
