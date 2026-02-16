/**
 * Trades Actions - Unified action handler for trades network operations
 *
 * POST /api/trades/actions
 * Actions: accept, decline, apply, connect, match, convert_lead, invite_client,
 *          cancel_subscription, attach_to_claim
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
    connectionId: z.string().optional(),
    inviteId: z.string().optional(),
  }),
  z.object({
    action: z.literal("decline"),
    connectionId: z.string().optional(),
    inviteId: z.string().optional(),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("apply"),
    jobId: z.string(),
    message: z.string().optional(),
    quote: z.number().optional(),
  }),
  z.object({
    action: z.literal("connect"),
    targetProfileId: z.string(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("match"),
    claimId: z.string(),
    tradeType: z.string(),
    location: z
      .object({
        lat: z.number(),
        lng: z.number(),
        radius: z.number().optional(),
      })
      .optional(),
  }),
  z.object({
    action: z.literal("convert_lead"),
    leadId: z.string(),
    claimData: z.record(z.any()).optional(),
  }),
  z.object({
    action: z.literal("invite_client"),
    email: z.string().email(),
    claimId: z.string().optional(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("cancel_subscription"),
    reason: z.string().optional(),
    feedback: z.string().optional(),
  }),
  z.object({
    action: z.literal("attach_to_claim"),
    claimId: z.string(),
    tradesCompanyId: z.string(),
    role: z.string().optional(),
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

      case "apply":
        return handleApply(userId, input);

      case "connect":
        return handleConnect(userId, input);

      case "match":
        return handleMatch(userId, input);

      case "convert_lead":
        return handleConvertLead(userId, input);

      case "invite_client":
        return handleInviteClient(userId, input);

      case "cancel_subscription":
        return handleCancelSubscription(userId, input);

      case "attach_to_claim":
        return handleAttachToClaim(userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Trades Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleAccept(userId: string, input: Extract<ActionInput, { action: "accept" }>) {
  if (input.connectionId) {
    await prisma.tradesConnection.update({
      where: { id: input.connectionId },
      data: { status: "accepted", acceptedAt: new Date() },
    });
  } else if (input.inviteId) {
    await prisma.tradesInvite.update({
      where: { id: input.inviteId },
      data: { status: "accepted", respondedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true, message: "Accepted" });
}

async function handleDecline(userId: string, input: Extract<ActionInput, { action: "decline" }>) {
  if (input.connectionId) {
    await prisma.tradesConnection.update({
      where: { id: input.connectionId },
      data: { status: "declined", declineReason: input.reason },
    });
  } else if (input.inviteId) {
    await prisma.tradesInvite.update({
      where: { id: input.inviteId },
      data: { status: "declined", respondedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true, message: "Declined" });
}

async function handleApply(userId: string, input: Extract<ActionInput, { action: "apply" }>) {
  // Get trades profile
  const profile = await prisma.tradesProfile.findFirst({
    where: { userId },
  });

  if (!profile) {
    return NextResponse.json({ error: "Trades profile required" }, { status: 400 });
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: input.jobId,
      profileId: profile.id,
      message: input.message,
      quote: input.quote,
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, application });
}

async function handleConnect(userId: string, input: Extract<ActionInput, { action: "connect" }>) {
  const profile = await prisma.tradesProfile.findFirst({
    where: { userId },
  });

  if (!profile) {
    return NextResponse.json({ error: "Trades profile required" }, { status: 400 });
  }

  const connection = await prisma.tradesConnection.create({
    data: {
      requesterId: profile.id,
      targetId: input.targetProfileId,
      message: input.message,
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, connection });
}

async function handleMatch(userId: string, input: Extract<ActionInput, { action: "match" }>) {
  // Find matching trades profiles based on trade type and location
  const matches = await prisma.tradesProfile.findMany({
    where: {
      primaryTrade: input.tradeType,
      verified: true,
    },
    take: 10,
    select: {
      id: true,
      businessName: true,
      primaryTrade: true,
      rating: true,
      reviewCount: true,
      logoUrl: true,
    },
  });

  return NextResponse.json({ success: true, matches });
}

async function handleConvertLead(
  userId: string,
  input: Extract<ActionInput, { action: "convert_lead" }>
) {
  // Get user's org
  const orgUser = await prisma.orgUser.findFirst({
    where: { oduserId: userId },
  });

  if (!orgUser) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  // Update lead status
  const lead = await prisma.lead.update({
    where: { id: input.leadId },
    data: { status: "converted", convertedAt: new Date() },
  });

  // Create claim from lead if data provided
  let claim = null;
  if (input.claimData) {
    claim = await prisma.claims.create({
      data: {
        ...input.claimData,
        orgId: orgUser.orgId,
        leadId: lead.id,
      },
    });
  }

  return NextResponse.json({ success: true, lead, claim });
}

async function handleInviteClient(
  userId: string,
  input: Extract<ActionInput, { action: "invite_client" }>
) {
  const invitation = await prisma.clientInvitation.create({
    data: {
      email: input.email,
      claimId: input.claimId,
      message: input.message,
      invitedBy: userId,
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, invitation });
}

async function handleCancelSubscription(
  userId: string,
  input: Extract<ActionInput, { action: "cancel_subscription" }>
) {
  // Get user's subscription
  const subscription = await prisma.tradesSubscription.findFirst({
    where: { userId, status: "active" },
  });

  if (!subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  // Mark for cancellation at period end
  await prisma.tradesSubscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
      cancelReason: input.reason,
      cancelFeedback: input.feedback,
    },
  });

  return NextResponse.json({ success: true, message: "Subscription will cancel at period end" });
}

async function handleAttachToClaim(
  userId: string,
  input: Extract<ActionInput, { action: "attach_to_claim" }>
) {
  // Create claim-trades association
  const attachment = await prisma.claimTradesCompany.create({
    data: {
      claimId: input.claimId,
      tradesCompanyId: input.tradesCompanyId,
      role: input.role || "vendor",
      attachedBy: userId,
    },
  });

  return NextResponse.json({ success: true, attachment });
}
