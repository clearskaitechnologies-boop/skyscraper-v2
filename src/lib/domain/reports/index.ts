/**
 * Reports Domain Services
 *
 * Pure business logic functions - no HTTP, no Next.js, no UI.
 * Route handlers call these, they return results.
 */

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface ApproveReportInput {
  reportId: string;
  orgId: string;
  userId: string;
  notes?: string;
}

export interface RejectReportInput {
  reportId: string;
  orgId: string;
  userId: string;
  reason: string;
  notes?: string;
}

export interface SendReportInput {
  reportId: string;
  orgId: string;
  userId: string;
  recipientEmail: string;
  recipientType?: "adjuster" | "homeowner" | "contractor";
  message?: string;
}

export interface SendPacketInput {
  reportId: string;
  orgId: string;
  userId: string;
  recipientEmail: string;
  message?: string;
  includePhotos?: boolean;
  includeDocuments?: boolean;
}

export interface GenerateReportInput {
  claimId: string;
  orgId: string;
  userId: string;
  reportType: string;
  options?: Record<string, unknown>;
}

export interface UpdateReportStatusInput {
  reportId: string;
  status: string;
}

export interface AddReportNoteInput {
  reportId: string;
  userId: string;
  content: string;
  noteType?: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Approve a report
 */
export async function approveReport(input: ApproveReportInput) {
  const { reportId, orgId, userId, notes } = input;

  const report = await prisma.ai_reports.update({
    where: { id: reportId },
    data: {
      status: "approved",
      approvedAt: new Date(),
      approvedBy: userId,
      approvalNotes: notes,
    },
  });

  // Log the event
  await prisma.reportEvent.create({
    data: {
      reportId,
      orgId,
      eventType: "approved",
      userId,
      metadata: { notes },
    },
  });

  return { success: true, report };
}

/**
 * Reject a report
 */
export async function rejectReport(input: RejectReportInput) {
  const { reportId, orgId, userId, reason, notes } = input;

  const report = await prisma.ai_reports.update({
    where: { id: reportId },
    data: {
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: userId,
      rejectionReason: reason,
      rejectionNotes: notes,
    },
  });

  await prisma.reportEvent.create({
    data: {
      reportId,
      orgId,
      eventType: "rejected",
      userId,
      metadata: { reason, notes },
    },
  });

  return { success: true, report };
}

/**
 * Send a report to a recipient
 */
export async function sendReport(input: SendReportInput) {
  const { reportId, orgId, userId, recipientEmail, recipientType, message } = input;

  // Create send record
  const sendRecord = await prisma.reportSend.create({
    data: {
      reportId,
      recipientEmail,
      recipientType: recipientType || "adjuster",
      message,
      sentBy: userId,
      sentAt: new Date(),
    },
  });

  // Update report status
  await prisma.ai_reports.update({
    where: { id: reportId },
    data: { status: "sent", sentAt: new Date() },
  });

  await prisma.reportEvent.create({
    data: {
      reportId,
      orgId,
      eventType: "sent",
      userId,
      metadata: { recipientEmail, recipientType },
    },
  });

  // TODO: Trigger actual email send via queue
  return { success: true, sendRecord };
}

/**
 * Send a complete packet with attachments
 */
export async function sendPacket(input: SendPacketInput) {
  const { reportId, orgId, userId, recipientEmail, message, includePhotos, includeDocuments } =
    input;

  const packet = await prisma.reportPacket.create({
    data: {
      reportId,
      recipientEmail,
      message,
      includePhotos: includePhotos ?? true,
      includeDocuments: includeDocuments ?? true,
      sentBy: userId,
      sentAt: new Date(),
    },
  });

  await prisma.reportEvent.create({
    data: {
      reportId,
      orgId,
      eventType: "packet_sent",
      userId,
      metadata: { packetId: packet.id },
    },
  });

  return { success: true, packet };
}

/**
 * Generate a new report
 */
export async function generateReport(input: GenerateReportInput) {
  const { claimId, orgId, userId, reportType, options } = input;

  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType,
      status: "generating",
      createdBy: userId,
      options: options || {},
    },
  });

  // TODO: Queue async generation job
  await prisma.ai_reports.update({
    where: { id: report.id },
    data: { status: "pending" },
  });

  return { success: true, report: { id: report.id, status: "pending" } };
}

/**
 * Update report status
 */
export async function updateReportStatus(input: UpdateReportStatusInput) {
  const { reportId, status } = input;

  await prisma.ai_reports.update({
    where: { id: reportId },
    data: { status },
  });

  return { success: true };
}

/**
 * Add a note to a report
 */
export async function addReportNote(input: AddReportNoteInput) {
  const { reportId, userId, content, noteType } = input;

  const note = await prisma.reportNote.create({
    data: {
      reportId,
      content,
      noteType: noteType || "general",
      authorId: userId,
    },
  });

  return { success: true, note };
}

/**
 * Regenerate share links for a report
 */
export async function regenerateShareLinks(reportId: string, expireExisting?: boolean) {
  if (expireExisting) {
    await prisma.reportShareLink.updateMany({
      where: { reportId, active: true },
      data: { active: false, expiredAt: new Date() },
    });
  }

  const token = crypto.randomUUID();
  const link = await prisma.reportShareLink.create({
    data: {
      reportId,
      token,
      active: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return {
    success: true,
    shareUrl: `/reports/share/${token}`,
    link,
  };
}

/**
 * Save draft content
 */
export async function saveDraft(reportId: string, content: Record<string, unknown>) {
  await prisma.ai_reports.update({
    where: { id: reportId },
    data: {
      draftContent: content,
      status: "draft",
    },
  });

  return { success: true };
}

/**
 * Create email draft
 */
export async function createEmailDraft(
  reportId: string,
  subject: string,
  body: string,
  recipientType: "adjuster" | "homeowner" | "contractor"
) {
  const draft = await prisma.emailDraft.create({
    data: {
      reportId,
      subject,
      body,
      recipientType,
    },
  });

  return { success: true, draft };
}
