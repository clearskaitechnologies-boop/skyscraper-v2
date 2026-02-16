/**
 * Portal Invitations Actions - Unified handler for invitation operations
 *
 * POST /api/portal/invitations/actions
 * Actions: accept, decline, send_invite, send_job_invite
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
    invitationId: z.string(),
  }),
  z.object({
    action: z.literal("decline"),
    invitationId: z.string(),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("send_invite"),
    email: z.string().email(),
    claimId: z.string().optional(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("send_job_invite"),
    email: z.string().email(),
    jobId: z.string(),
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

    switch (input.action) {
      case "accept":
        return handleAccept(userId, input);

      case "decline":
        return handleDecline(userId, input);

      case "send_invite":
        return handleSendInvite(userId, input);

      case "send_job_invite":
        return handleSendJobInvite(userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error("[Portal Invitations Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleAccept(userId: string, input: Extract<ActionInput, { action: "accept" }>) {
  const invitation = await prisma.portalInvitation.findUnique({
    where: { id: input.invitationId },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  // Update invitation status
  await prisma.portalInvitation.update({
    where: { id: input.invitationId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
      acceptedBy: userId,
    },
  });

  // Create portal access if this is a claim invitation
  if (invitation.claimId) {
    await prisma.portalAccess.upsert({
      where: {
        claimId_userId: {
          claimId: invitation.claimId,
          userId,
        },
      },
      create: {
        claimId: invitation.claimId,
        userId,
        accepted: true,
        acceptedAt: new Date(),
      },
      update: {
        accepted: true,
        acceptedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ success: true, message: "Invitation accepted" });
}

async function handleDecline(userId: string, input: Extract<ActionInput, { action: "decline" }>) {
  const invitation = await prisma.portalInvitation.findUnique({
    where: { id: input.invitationId },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  await prisma.portalInvitation.update({
    where: { id: input.invitationId },
    data: {
      status: "declined",
      declinedAt: new Date(),
      declineReason: input.reason,
    },
  });

  return NextResponse.json({ success: true, message: "Invitation declined" });
}

async function handleSendInvite(
  userId: string,
  input: Extract<ActionInput, { action: "send_invite" }>
) {
  // Create the invitation
  const invitation = await prisma.portalInvitation.create({
    data: {
      email: input.email,
      claimId: input.claimId,
      message: input.message,
      invitedBy: userId,
      status: "pending",
    },
  });

  // In production, send email here
  return NextResponse.json({
    success: true,
    invitation: { id: invitation.id },
    message: "Invitation sent",
  });
}

async function handleSendJobInvite(
  userId: string,
  input: Extract<ActionInput, { action: "send_job_invite" }>
) {
  const invitation = await prisma.jobInvitation.create({
    data: {
      email: input.email,
      jobId: input.jobId,
      message: input.message,
      invitedBy: userId,
      status: "pending",
    },
  });

  return NextResponse.json({
    success: true,
    invitation: { id: invitation.id },
    message: "Job invitation sent",
  });
}
