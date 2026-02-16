/**
 * Trades Connections Actions - Unified handler for connection operations
 *
 * POST /api/trades/connections/actions
 * Actions: accept, decline, remove, block
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
    connectionId: z.string(),
  }),
  z.object({
    action: z.literal("decline"),
    connectionId: z.string(),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("remove"),
    connectionId: z.string(),
  }),
  z.object({
    action: z.literal("block"),
    profileId: z.string(),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("send_request"),
    targetProfileId: z.string(),
    message: z.string().optional(),
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

    // Get user's profile
    const profile = await prisma.tradesProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Trades profile required" }, { status: 400 });
    }

    switch (input.action) {
      case "accept":
        return handleAccept(profile.id, input);

      case "decline":
        return handleDecline(profile.id, input);

      case "remove":
        return handleRemove(profile.id, input);

      case "block":
        return handleBlock(profile.id, input);

      case "send_request":
        return handleSendRequest(profile.id, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Trades Connections Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleAccept(profileId: string, input: Extract<ActionInput, { action: "accept" }>) {
  // Verify this connection request is for the current user
  const connection = await prisma.tradesConnection.findFirst({
    where: {
      id: input.connectionId,
      targetId: profileId,
      status: "pending",
    },
  });

  if (!connection) {
    return NextResponse.json({ error: "Connection request not found" }, { status: 404 });
  }

  await prisma.tradesConnection.update({
    where: { id: input.connectionId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, message: "Connection accepted" });
}

async function handleDecline(
  profileId: string,
  input: Extract<ActionInput, { action: "decline" }>
) {
  const connection = await prisma.tradesConnection.findFirst({
    where: {
      id: input.connectionId,
      targetId: profileId,
      status: "pending",
    },
  });

  if (!connection) {
    return NextResponse.json({ error: "Connection request not found" }, { status: 404 });
  }

  await prisma.tradesConnection.update({
    where: { id: input.connectionId },
    data: {
      status: "declined",
      declineReason: input.reason,
    },
  });

  return NextResponse.json({ success: true, message: "Connection declined" });
}

async function handleRemove(profileId: string, input: Extract<ActionInput, { action: "remove" }>) {
  // Can remove connections where user is either requester or target
  const connection = await prisma.tradesConnection.findFirst({
    where: {
      id: input.connectionId,
      OR: [{ requesterId: profileId }, { targetId: profileId }],
      status: "accepted",
    },
  });

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  await prisma.tradesConnection.delete({
    where: { id: input.connectionId },
  });

  return NextResponse.json({ success: true, message: "Connection removed" });
}

async function handleBlock(profileId: string, input: Extract<ActionInput, { action: "block" }>) {
  // Create block record
  await prisma.tradesBlock.create({
    data: {
      blockerId: profileId,
      blockedId: input.profileId,
      reason: input.reason,
    },
  });

  // Remove any existing connection
  await prisma.tradesConnection.deleteMany({
    where: {
      OR: [
        { requesterId: profileId, targetId: input.profileId },
        { requesterId: input.profileId, targetId: profileId },
      ],
    },
  });

  return NextResponse.json({ success: true, message: "User blocked" });
}

async function handleSendRequest(
  profileId: string,
  input: Extract<ActionInput, { action: "send_request" }>
) {
  // Check if connection already exists
  const existing = await prisma.tradesConnection.findFirst({
    where: {
      OR: [
        { requesterId: profileId, targetId: input.targetProfileId },
        { requesterId: input.targetProfileId, targetId: profileId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Connection already exists or pending" }, { status: 400 });
  }

  // Check if blocked
  const blocked = await prisma.tradesBlock.findFirst({
    where: {
      OR: [
        { blockerId: profileId, blockedId: input.targetProfileId },
        { blockerId: input.targetProfileId, blockedId: profileId },
      ],
    },
  });

  if (blocked) {
    return NextResponse.json({ error: "Cannot connect with this user" }, { status: 400 });
  }

  const connection = await prisma.tradesConnection.create({
    data: {
      requesterId: profileId,
      targetId: input.targetProfileId,
      message: input.message,
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, connection });
}
