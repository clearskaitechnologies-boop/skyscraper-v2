/**
 * Trades Domain Services
 *
 * Pure business logic functions - no HTTP, no Next.js, no UI.
 */

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface AcceptConnectionInput {
  connectionId?: string;
  inviteId?: string;
}

export interface DeclineConnectionInput {
  connectionId?: string;
  inviteId?: string;
  reason?: string;
}

export interface ApplyToJobInput {
  userId: string;
  jobId: string;
  message?: string;
  quote?: number;
}

export interface ConnectInput {
  userId: string;
  targetProfileId: string;
  message?: string;
}

export interface MatchTradesInput {
  tradeType: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
}

export interface InviteClientInput {
  userId: string;
  email: string;
  claimId?: string;
  message?: string;
}

export interface CancelSubscriptionInput {
  userId: string;
  reason?: string;
  feedback?: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Accept a connection or invite
 */
export async function acceptConnection(input: AcceptConnectionInput) {
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

  return { success: true, message: "Accepted" };
}

/**
 * Decline a connection or invite
 */
export async function declineConnection(input: DeclineConnectionInput) {
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

  return { success: true, message: "Declined" };
}

/**
 * Apply to a job
 */
export async function applyToJob(input: ApplyToJobInput) {
  // Get trades profile
  const profile = await prisma.tradesProfile.findFirst({
    where: { userId: input.userId },
  });

  if (!profile) {
    throw new Error("Trades profile required");
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

  return { success: true, application };
}

/**
 * Send a connection request
 */
export async function sendConnectionRequest(input: ConnectInput) {
  const profile = await prisma.tradesProfile.findFirst({
    where: { userId: input.userId },
  });

  if (!profile) {
    throw new Error("Trades profile required");
  }

  const connection = await prisma.tradesConnection.create({
    data: {
      requesterId: profile.id,
      targetId: input.targetProfileId,
      message: input.message,
      status: "pending",
    },
  });

  return { success: true, connection };
}

/**
 * Find matching trades profiles
 */
export async function matchTrades(input: MatchTradesInput) {
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

  return { success: true, matches };
}

/**
 * Invite a client
 */
export async function inviteClient(input: InviteClientInput) {
  const invitation = await prisma.clientInvitation.create({
    data: {
      email: input.email,
      claimId: input.claimId,
      message: input.message,
      invitedBy: input.userId,
      status: "pending",
    },
  });

  return { success: true, invitation };
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(input: CancelSubscriptionInput) {
  const subscription = await prisma.tradesSubscription.findFirst({
    where: { userId: input.userId, status: "active" },
  });

  if (!subscription) {
    throw new Error("No active subscription");
  }

  await prisma.tradesSubscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
      cancelReason: input.reason,
      cancelFeedback: input.feedback,
    },
  });

  return { success: true, message: "Subscription will cancel at period end" };
}

/**
 * Attach a trades company to a claim
 */
export async function attachToClaim(
  claimId: string,
  tradesCompanyId: string,
  attachedBy: string,
  role?: string
) {
  const attachment = await prisma.claimTradesCompany.create({
    data: {
      claimId,
      tradesCompanyId,
      role: role || "vendor",
      attachedBy,
    },
  });

  return { success: true, attachment };
}

/**
 * Convert a lead to a claim
 */
export async function convertLead(
  userId: string,
  leadId: string,
  claimData?: Record<string, unknown>
) {
  const orgUser = await prisma.orgUser.findFirst({
    where: { oduserId: userId },
  });

  if (!orgUser) {
    throw new Error("Org not found");
  }

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status: "converted", convertedAt: new Date() },
  });

  let claim = null;
  if (claimData) {
    claim = await prisma.claims.create({
      data: {
        ...claimData,
        orgId: orgUser.orgId,
        leadId: lead.id,
      } as any,
    });
  }

  return { success: true, lead, claim };
}
