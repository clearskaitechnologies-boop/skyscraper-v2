/**
 * Portal Claims Actions - Unified action handler for portal claim operations
 *
 * POST /api/portal/claims/[claimId]/actions
 * Actions: accept, access, upload_photo, upload_document, add_event, add_comment
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { assertPortalAccess } from "@/lib/auth/portalAccess";
import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
  }),
  z.object({
    action: z.literal("add_event"),
    title: z.string(),
    description: z.string().optional(),
    eventType: z.string().optional(),
  }),
  z.object({
    action: z.literal("add_comment"),
    fileId: z.string(),
    content: z.string(),
  }),
  z.object({
    action: z.literal("request_access"),
    message: z.string().optional(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  const authResult = await requirePortalAuth();
  if (isPortalAuthError(authResult)) return authResult;
  const { userId } = authResult;

  try {
    const { claimId } = await params;
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Verify portal access for most actions
    if (input.action !== "request_access") {
      await assertPortalAccess({ userId, claimId });
    }

    switch (input.action) {
      case "accept":
        return handleAccept(claimId, userId);

      case "add_event":
        return handleAddEvent(claimId, userId, input);

      case "add_comment":
        return handleAddComment(claimId, userId, input);

      case "request_access":
        return handleRequestAccess(claimId, userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error("[Portal Claims Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleAccept(claimId: string, userId: string) {
  // Find the client
  const client = await prisma.client.findFirst({
    where: { userId },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Update the portal access to mark as accepted
  await prisma.portalAccess.updateMany({
    where: {
      claimId,
      userId,
    },
    data: {
      accepted: true,
      acceptedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, message: "Claim access accepted" });
}

async function handleAddEvent(
  claimId: string,
  userId: string,
  input: Extract<ActionInput, { action: "add_event" }>
) {
  const event = await prisma.claimEvent.create({
    data: {
      claimId,
      title: input.title,
      description: input.description || "",
      eventType: input.eventType || "note",
      createdBy: userId,
    },
  });

  return NextResponse.json({ success: true, event });
}

async function handleAddComment(
  claimId: string,
  userId: string,
  input: Extract<ActionInput, { action: "add_comment" }>
) {
  // Verify the file belongs to this claim (prevent cross-claim file comments)
  const file = await prisma.file_assets.findFirst({
    where: {
      id: input.fileId,
      claimId,
    },
  });

  if (!file) {
    return NextResponse.json(
      { error: "File not found or does not belong to this claim" },
      { status: 404 }
    );
  }

  // Get client info for the comment
  const client = await prisma.client.findFirst({
    where: { userId },
    select: { id: true, name: true },
  });

  const comment = await prisma.fileComment.create({
    data: {
      fileId: input.fileId,
      content: input.content,
      authorId: userId,
      authorName: client?.name || "Portal User",
      authorType: "client",
    },
  });

  return NextResponse.json({ success: true, comment });
}

async function handleRequestAccess(
  claimId: string,
  userId: string,
  input: Extract<ActionInput, { action: "request_access" }>
) {
  // Check if access already exists
  const existing = await prisma.portalAccess.findFirst({
    where: { claimId, userId },
  });

  if (existing) {
    return NextResponse.json({ error: "Access already requested or granted" }, { status: 400 });
  }

  // Create access request
  await prisma.portalAccess.create({
    data: {
      claimId,
      userId,
      accepted: false,
      requestMessage: input.message,
    },
  });

  return NextResponse.json({ success: true, message: "Access requested" });
}
