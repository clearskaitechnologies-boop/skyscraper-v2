/**
 * Trades Domain Services
 *
 * Pure business logic functions - no HTTP, no Next.js, no UI.
 * All HTTP handlers should call these services.
 */

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface AcceptConnectionInput {
  connectionId?: string;
  inviteId?: string;
}

export interface RemoveConnectionInput {
  profileId: string;
  connectionId: string;
}

export interface BlockUserInput {
  profileId: string;
  targetProfileId: string;
  reason?: string;
}

export interface SendRequestInput {
  profileId: string;
  targetProfileId: string;
  message?: string;
}

// Company types
export interface UpdateCompanyCoverInput {
  companyId: string;
  coverUrl: string;
}

export interface AddEmployeeInput {
  companyId: string;
  email: string;
  role?: string;
}

export interface RemoveEmployeeInput {
  companyId: string;
  employeeId: string;
}

export interface HandleJoinRequestInput {
  companyId: string;
  requestId: string;
  approve: boolean;
  message?: string;
}

export interface InviteSeatInput {
  companyId: string;
  invitedBy: string;
  email: string;
  role?: string;
}

export interface AcceptSeatInput {
  userId: string;
  inviteId: string;
}

export interface UpdateCompanyInfoInput {
  companyId: string;
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: Record<string, unknown>;
}

// Profile types
export interface UpdateProfileInput {
  profileId: string;
  data: Record<string, unknown>;
}

export interface UpdateProfilePhotoInput {
  profileId: string;
  photoUrl: string;
}

export interface AddCertificationInput {
  profileId: string;
  name: string;
  issuer: string;
  issuedAt?: Date;
  expiresAt?: Date;
  documentUrl?: string;
}

export interface RemoveCertificationInput {
  profileId: string;
  certificationId: string;
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

// ============================================================================
// Connection Services (from connections/actions)
// ============================================================================

/**
 * Remove a connection
 */
export async function removeConnection(input: RemoveConnectionInput) {
  const connection = await prisma.tradesConnection.findFirst({
    where: {
      id: input.connectionId,
      OR: [{ requesterId: input.profileId }, { targetId: input.profileId }],
      status: "accepted",
    },
  });

  if (!connection) {
    throw new Error("Connection not found");
  }

  await prisma.tradesConnection.delete({
    where: { id: input.connectionId },
  });

  return { success: true, message: "Connection removed" };
}

/**
 * Block a user
 */
export async function blockUser(input: BlockUserInput) {
  await prisma.tradesBlock.create({
    data: {
      blockerId: input.profileId,
      blockedId: input.targetProfileId,
      reason: input.reason,
    },
  });

  // Remove any existing connections
  await prisma.tradesConnection.deleteMany({
    where: {
      OR: [
        { requesterId: input.profileId, targetId: input.targetProfileId },
        { requesterId: input.targetProfileId, targetId: input.profileId },
      ],
    },
  });

  return { success: true, message: "User blocked" };
}

/**
 * Send connection request (with block check)
 */
export async function sendRequest(input: SendRequestInput) {
  // Check if connection already exists
  const existing = await prisma.tradesConnection.findFirst({
    where: {
      OR: [
        { requesterId: input.profileId, targetId: input.targetProfileId },
        { requesterId: input.targetProfileId, targetId: input.profileId },
      ],
    },
  });

  if (existing) {
    throw new Error("Connection already exists or pending");
  }

  // Check if blocked
  const blocked = await prisma.tradesBlock.findFirst({
    where: {
      OR: [
        { blockerId: input.profileId, blockedId: input.targetProfileId },
        { blockerId: input.targetProfileId, blockedId: input.profileId },
      ],
    },
  });

  if (blocked) {
    throw new Error("Cannot connect with this user");
  }

  const connection = await prisma.tradesConnection.create({
    data: {
      requesterId: input.profileId,
      targetId: input.targetProfileId,
      message: input.message,
      status: "pending",
    },
  });

  return { success: true, connection };
}

// ============================================================================
// Company Services (from company/actions)
// ============================================================================

/**
 * Update company cover photo
 */
export async function updateCompanyCover(input: UpdateCompanyCoverInput) {
  await prisma.tradesCompany.update({
    where: { id: input.companyId },
    data: { coverPhotoUrl: input.coverUrl },
  });

  return { success: true };
}

/**
 * Add employee to company
 */
export async function addEmployee(input: AddEmployeeInput) {
  const employee = await prisma.tradesCompanyEmployee.create({
    data: {
      companyId: input.companyId,
      email: input.email,
      role: input.role || "member",
      status: "invited",
    },
  });

  return { success: true, employee };
}

/**
 * Remove employee from company
 */
export async function removeEmployee(input: RemoveEmployeeInput) {
  await prisma.tradesCompanyEmployee.delete({
    where: {
      id: input.employeeId,
      companyId: input.companyId,
    },
  });

  return { success: true };
}

/**
 * Handle join request
 */
export async function handleJoinRequest(input: HandleJoinRequestInput) {
  if (input.approve) {
    await prisma.tradesJoinRequest.update({
      where: { id: input.requestId },
      data: { status: "approved", approvedAt: new Date() },
    });

    // Add as member
    const request = await prisma.tradesJoinRequest.findUnique({
      where: { id: input.requestId },
    });

    if (request) {
      await prisma.tradesCompanyMember.create({
        data: {
          companyId: input.companyId,
          userId: request.userId,
          role: "member",
        },
      });
    }
  } else {
    await prisma.tradesJoinRequest.update({
      where: { id: input.requestId },
      data: { status: "rejected", rejectionMessage: input.message },
    });
  }

  return { success: true };
}

/**
 * Invite a seat
 */
export async function inviteSeat(input: InviteSeatInput) {
  const invite = await prisma.tradesSeatInvite.create({
    data: {
      companyId: input.companyId,
      email: input.email,
      role: input.role || "member",
      invitedBy: input.invitedBy,
      status: "pending",
    },
  });

  return { success: true, invite };
}

/**
 * Accept seat invite
 */
export async function acceptSeat(input: AcceptSeatInput) {
  const invite = await prisma.tradesSeatInvite.findUnique({
    where: { id: input.inviteId },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  await prisma.tradesSeatInvite.update({
    where: { id: input.inviteId },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  await prisma.tradesCompanyMember.create({
    data: {
      companyId: invite.companyId,
      userId: input.userId,
      role: invite.role || "member",
    },
  });

  return { success: true };
}

/**
 * Update company info
 */
export async function updateCompanyInfo(input: UpdateCompanyInfoInput) {
  const { companyId, ...updateData } = input;

  await prisma.tradesCompany.update({
    where: { id: companyId },
    data: updateData,
  });

  return { success: true };
}

// ============================================================================
// Profile Services (from profile/actions)
// ============================================================================

/**
 * Update profile
 */
export async function updateProfile(input: UpdateProfileInput) {
  await prisma.tradesProfile.update({
    where: { id: input.profileId },
    data: input.data,
  });

  return { success: true };
}

/**
 * Update profile photo
 */
export async function updateProfilePhoto(input: UpdateProfilePhotoInput) {
  await prisma.tradesProfile.update({
    where: { id: input.profileId },
    data: { logoUrl: input.photoUrl },
  });

  return { success: true };
}

/**
 * Add certification
 */
export async function addCertification(input: AddCertificationInput) {
  const cert = await prisma.tradesCertification.create({
    data: {
      profileId: input.profileId,
      name: input.name,
      issuer: input.issuer,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      documentUrl: input.documentUrl,
    },
  });

  return { success: true, certification: cert };
}

/**
 * Remove certification
 */
export async function removeCertification(input: RemoveCertificationInput) {
  await prisma.tradesCertification.delete({
    where: {
      id: input.certificationId,
      profileId: input.profileId,
    },
  });

  return { success: true };
}
