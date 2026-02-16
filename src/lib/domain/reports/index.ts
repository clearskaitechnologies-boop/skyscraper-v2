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

// ============================================================================
// Batch Report Services (from reports/actions)
// ============================================================================

export interface GenerateFromTemplateInput {
  claimId: string;
  orgId: string;
  userId: string;
  templateId: string;
  variables?: Record<string, unknown>;
}

export interface ComposeReportInput {
  claimId: string;
  orgId: string;
  userId: string;
  sections: Array<{
    key: string;
    content?: string;
    include?: boolean;
  }>;
}

export interface GenerateSummaryInput {
  claimId: string;
  orgId: string;
  userId: string;
  format?: "brief" | "detailed" | "executive";
}

export interface GenerateSupplementInput {
  claimId: string;
  orgId: string;
  userId: string;
  originalReportId?: string;
  newDamage?: Record<string, unknown>[];
}

export interface QueueReportInput {
  claimId: string;
  orgId: string;
  userId: string;
  reportType: string;
  priority?: "low" | "normal" | "high";
  scheduledFor?: string;
}

/**
 * Generate report from template
 */
export async function generateFromTemplate(input: GenerateFromTemplateInput) {
  const { claimId, orgId, userId, templateId, variables } = input;

  // Verify template exists
  const template = await prisma.reportTemplate.findFirst({
    where: { id: templateId, orgId },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: template.type,
      templateId,
      status: "generating",
      createdBy: userId,
      variables: variables || {},
    },
  });

  return { success: true, report: { id: report.id } };
}

/**
 * Compose report with sections
 */
export async function composeReport(input: ComposeReportInput) {
  const { claimId, orgId, userId, sections } = input;

  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: "composed",
      status: "draft",
      createdBy: userId,
      sections,
    },
  });

  return { success: true, report: { id: report.id } };
}

/**
 * Generate summary report
 */
export async function generateSummary(input: GenerateSummaryInput) {
  const { claimId, orgId, userId, format } = input;

  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: "summary",
      status: "generating",
      createdBy: userId,
      options: { format: format || "detailed" },
    },
  });

  return { success: true, report: { id: report.id } };
}

/**
 * Generate supplement report
 */
export async function generateSupplement(input: GenerateSupplementInput) {
  const { claimId, orgId, userId, originalReportId, newDamage } = input;

  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: "supplement",
      status: "generating",
      createdBy: userId,
      parentReportId: originalReportId,
      supplementData: { newDamage: newDamage || [] },
    },
  });

  return { success: true, report: { id: report.id } };
}

/**
 * Queue report for generation
 */
export async function queueReport(input: QueueReportInput) {
  const { claimId, orgId, userId, reportType, priority, scheduledFor } = input;

  const queueItem = await prisma.reportQueue.create({
    data: {
      claimId,
      orgId,
      reportType,
      priority: priority || "normal",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      createdBy: userId,
      status: "queued",
    },
  });

  return { success: true, queueItem: { id: queueItem.id } };
}

/**
 * Start generating a report
 */
export async function startReport(queueId: string) {
  const queueItem = await prisma.reportQueue.update({
    where: { id: queueId },
    data: { status: "processing", startedAt: new Date() },
  });

  return { success: true, queueItem };
}

/**
 * Mark report generation as finished
 */
export async function finishReport(queueId: string, reportId: string) {
  const queueItem = await prisma.reportQueue.update({
    where: { id: queueId },
    data: {
      status: "completed",
      completedAt: new Date(),
      reportId,
    },
  });

  return { success: true, queueItem };
}

/**
 * Regenerate an existing report
 */
export async function regenerateReport(reportId: string, userId: string) {
  const report = await prisma.ai_reports.findUnique({
    where: { id: reportId },
    select: { claimId: true, orgId: true, reportType: true },
  });

  if (!report) {
    return { success: false, error: "Report not found" };
  }

  // Queue a new generation
  const queueItem = await prisma.reportQueue.create({
    data: {
      claimId: report.claimId,
      orgId: report.orgId,
      reportType: report.reportType || "standard",
      priority: "high",
      createdBy: userId,
      status: "queued",
      regenerateFrom: reportId,
    },
  });

  return { success: true, queueItem: { id: queueItem.id } };
}
