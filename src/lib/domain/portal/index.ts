/**
 * Portal Domain Services
 *
 * Pure business logic functions for portal/client operations.
 */

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface AcceptClaimAccessInput {
  claimId: string;
  userId: string;
}

export interface AddClaimEventInput {
  claimId: string;
  userId: string;
  title: string;
  description?: string;
  eventType?: string;
}

export interface AddFileCommentInput {
  claimId: string;
  userId: string;
  fileId: string;
  content: string;
}

export interface RequestAccessInput {
  claimId: string;
  userId: string;
  message?: string;
}

export interface AcceptInvitationInput {
  invitationId: string;
  userId: string;
}

export interface DeclineInvitationInput {
  invitationId: string;
  reason?: string;
}

export interface SendInvitationInput {
  userId: string;
  email: string;
  claimId?: string;
  message?: string;
}

export interface SendMessageInput {
  userId: string;
  threadId: string;
  content: string;
  attachments?: string[];
}

export interface CreateThreadInput {
  userId: string;
  recipientId: string;
  subject?: string;
  initialMessage: string;
  claimId?: string;
  jobId?: string;
}

// ============================================================================
// Claims Services
// ============================================================================

/**
 * Accept portal access to a claim
 */
export async function acceptClaimAccess(input: AcceptClaimAccessInput) {
  const { claimId, userId } = input;

  const client = await prisma.client.findFirst({
    where: { userId },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  await prisma.portalAccess.updateMany({
    where: { claimId, userId },
    data: {
      accepted: true,
      acceptedAt: new Date(),
    },
  });

  return { success: true, message: "Claim access accepted" };
}

/**
 * Add a timeline event to a claim
 */
export async function addClaimEvent(input: AddClaimEventInput) {
  const { claimId, userId, title, description, eventType } = input;

  const event = await prisma.claimEvent.create({
    data: {
      claimId,
      title,
      description: description || "",
      eventType: eventType || "note",
      createdBy: userId,
    },
  });

  return { success: true, event };
}

/**
 * Add a comment to a file
 */
export async function addFileComment(input: AddFileCommentInput) {
  const { userId, fileId, content } = input;

  const client = await prisma.client.findFirst({
    where: { userId },
    select: { id: true, name: true },
  });

  const comment = await prisma.fileComment.create({
    data: {
      fileId,
      content,
      authorId: userId,
      authorName: client?.name || "Portal User",
      authorType: "client",
    },
  });

  return { success: true, comment };
}

/**
 * Request access to a claim
 */
export async function requestClaimAccess(input: RequestAccessInput) {
  const { claimId, userId, message } = input;

  const existing = await prisma.portalAccess.findFirst({
    where: { claimId, userId },
  });

  if (existing) {
    throw new Error("Access already requested or granted");
  }

  await prisma.portalAccess.create({
    data: {
      claimId,
      userId,
      accepted: false,
      requestMessage: message,
    },
  });

  return { success: true, message: "Access requested" };
}

// ============================================================================
// Invitation Services
// ============================================================================

/**
 * Accept an invitation
 */
export async function acceptInvitation(input: AcceptInvitationInput) {
  const { invitationId, userId } = input;

  const invitation = await prisma.portalInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  await prisma.portalInvitation.update({
    where: { id: invitationId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
      acceptedBy: userId,
    },
  });

  // Create portal access if claim invitation
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

  return { success: true, message: "Invitation accepted" };
}

/**
 * Decline an invitation
 */
export async function declineInvitation(input: DeclineInvitationInput) {
  const { invitationId, reason } = input;

  const invitation = await prisma.portalInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  await prisma.portalInvitation.update({
    where: { id: invitationId },
    data: {
      status: "declined",
      declinedAt: new Date(),
      declineReason: reason,
    },
  });

  return { success: true, message: "Invitation declined" };
}

/**
 * Send an invitation
 */
export async function sendInvitation(input: SendInvitationInput) {
  const { userId, email, claimId, message } = input;

  const invitation = await prisma.portalInvitation.create({
    data: {
      email,
      claimId,
      message,
      invitedBy: userId,
      status: "pending",
    },
  });

  // TODO: Trigger email send
  return { success: true, invitation: { id: invitation.id } };
}

// ============================================================================
// Messaging Services
// ============================================================================

/**
 * Send a message in a thread
 */
export async function sendMessage(input: SendMessageInput) {
  const { userId, threadId, content, attachments } = input;

  // Verify user has access
  const thread = await prisma.messageThread.findFirst({
    where: {
      id: threadId,
      participants: {
        some: { oduserId: userId },
      },
    },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  const message = await prisma.message.create({
    data: {
      threadId,
      senderId: userId,
      content,
      attachments: attachments || [],
    },
  });

  await prisma.messageThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  return { success: true, message };
}

/**
 * Create a new message thread
 */
export async function createThread(input: CreateThreadInput) {
  const { userId, recipientId, subject, initialMessage, claimId, jobId } = input;

  const thread = await prisma.messageThread.create({
    data: {
      subject,
      claimId,
      jobId,
      participants: {
        create: [{ oduserId: userId }, { oduserId: recipientId }],
      },
      messages: {
        create: {
          senderId: userId,
          content: initialMessage,
        },
      },
    },
    include: {
      messages: true,
      participants: true,
    },
  });

  return { success: true, thread };
}

/**
 * Mark a thread as read
 */
export async function markThreadRead(userId: string, threadId: string) {
  await prisma.messageReadReceipt.upsert({
    where: {
      threadId_userId: {
        threadId,
        oduserId: userId,
      },
    },
    create: {
      threadId,
      oduserId: userId,
      readAt: new Date(),
    },
    update: {
      readAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Archive a thread
 */
export async function archiveThread(userId: string, threadId: string) {
  await prisma.threadArchive.create({
    data: {
      threadId,
      oduserId: userId,
      archivedAt: new Date(),
    },
  });

  return { success: true };
}

// ============================================================================
// Job Invitation Services
// ============================================================================

export interface SendJobInviteInput {
  userId: string;
  email: string;
  jobId: string;
  message?: string;
}

/**
 * Send a job invitation
 */
export async function sendJobInvite(input: SendJobInviteInput) {
  const { userId, email, jobId, message } = input;

  const invitation = await prisma.jobInvitation.create({
    data: {
      email,
      jobId,
      message,
      invitedBy: userId,
      status: "pending",
    },
  });

  return { success: true, invitation: { id: invitation.id } };
}
