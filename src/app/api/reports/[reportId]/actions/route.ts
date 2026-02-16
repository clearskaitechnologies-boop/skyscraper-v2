/**
 * Reports Actions - Unified action handler for report workflow operations
 *
 * POST /api/reports/[reportId]/actions
 * Actions: approve, reject, send, send_packet, draft, draft_email,
 *          regenerate_links, update_status, add_note
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    notes: z.string().optional(),
  }),
  z.object({
    action: z.literal("reject"),
    reason: z.string(),
    notes: z.string().optional(),
  }),
  z.object({
    action: z.literal("send"),
    recipientEmail: z.string().email(),
    recipientType: z.enum(["adjuster", "homeowner", "contractor"]).optional(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("send_packet"),
    includePhotos: z.boolean().optional(),
    includeDocuments: z.boolean().optional(),
    recipientEmail: z.string().email(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("draft"),
    content: z.record(z.any()),
  }),
  z.object({
    action: z.literal("draft_email"),
    subject: z.string(),
    body: z.string(),
    recipientType: z.enum(["adjuster", "homeowner", "contractor"]),
  }),
  z.object({
    action: z.literal("regenerate_links"),
    expireExisting: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("update_status"),
    status: z.string(),
  }),
  z.object({
    action: z.literal("add_note"),
    content: z.string(),
    noteType: z.string().optional(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await params;
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify org access
    const org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Verify report belongs to org
    const report = await prisma.ai_reports.findFirst({
      where: { id: reportId, orgId: org.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const input = parsed.data;

    switch (input.action) {
      case "approve":
        return handleApprove(reportId, userId, org.id, input);

      case "reject":
        return handleReject(reportId, userId, org.id, input);

      case "send":
        return handleSend(reportId, userId, org.id, input);

      case "send_packet":
        return handleSendPacket(reportId, userId, org.id, input);

      case "draft":
        return handleDraft(reportId, input);

      case "draft_email":
        return handleDraftEmail(reportId, input);

      case "regenerate_links":
        return handleRegenerateLinks(reportId, input);

      case "update_status":
        return handleUpdateStatus(reportId, input);

      case "add_note":
        return handleAddNote(reportId, userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Reports Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleApprove(
  reportId: string,
  userId: string,
  orgId: string,
  input: Extract<ActionInput, { action: "approve" }>
) {
  await prisma.ai_reports.update({
    where: { id: reportId },
    data: {
      status: "approved",
      approvedAt: new Date(),
      approvedBy: userId,
      approvalNotes: input.notes,
    },
  });

  // Log event
  await prisma.reportEvent.create({
    data: {
      reportId,
      orgId,
      eventType: "approved",
      userId,
      metadata: { notes: input.notes },
    },
  });

  return NextResponse.json({ success: true, message: "Report approved" });
}

async function handleReject(
  reportId: string,
  userId: string,
  orgId: string,
  input: Extract<ActionInput, { action: "reject" }>
) {
  await prisma.ai_reports.update({
    where: { id: reportId },
    data: {
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: userId,
      rejectionReason: input.reason,
      rejectionNotes: input.notes,
    },
  });

  await prisma.reportEvent.create({
    data: {
      reportId,
      orgId,
      eventType: "rejected",
      userId,
      metadata: { reason: input.reason, notes: input.notes },
    },
  });

  return NextResponse.json({ success: true, message: "Report rejected" });
}

async function handleSend(
  reportId: string,
  userId: string,
  orgId: string,
  input: Extract<ActionInput, { action: "send" }>
) {
  // Create send record
  await prisma.reportSend.create({
    data: {
      reportId,
      recipientEmail: input.recipientEmail,
      recipientType: input.recipientType || "adjuster",
      message: input.message,
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
      metadata: { recipientEmail: input.recipientEmail },
    },
  });

  // In production, trigger email send here
  return NextResponse.json({ success: true, message: "Report sent" });
}

async function handleSendPacket(
  reportId: string,
  userId: string,
  orgId: string,
  input: Extract<ActionInput, { action: "send_packet" }>
) {
  // Create packet record
  const packet = await prisma.reportPacket.create({
    data: {
      reportId,
      recipientEmail: input.recipientEmail,
      message: input.message,
      includePhotos: input.includePhotos ?? true,
      includeDocuments: input.includeDocuments ?? true,
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

  return NextResponse.json({ success: true, packet });
}

async function handleDraft(reportId: string, input: Extract<ActionInput, { action: "draft" }>) {
  await prisma.ai_reports.update({
    where: { id: reportId },
    data: {
      draftContent: input.content,
      status: "draft",
    },
  });

  return NextResponse.json({ success: true, message: "Draft saved" });
}

async function handleDraftEmail(
  reportId: string,
  input: Extract<ActionInput, { action: "draft_email" }>
) {
  const draft = await prisma.emailDraft.create({
    data: {
      reportId,
      subject: input.subject,
      body: input.body,
      recipientType: input.recipientType,
    },
  });

  return NextResponse.json({ success: true, draft });
}

async function handleRegenerateLinks(
  reportId: string,
  input: Extract<ActionInput, { action: "regenerate_links" }>
) {
  if (input.expireExisting) {
    await prisma.reportShareLink.updateMany({
      where: { reportId, active: true },
      data: { active: false, expiredAt: new Date() },
    });
  }

  // Generate new share link
  const token = crypto.randomUUID();
  const link = await prisma.reportShareLink.create({
    data: {
      reportId,
      token,
      active: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return NextResponse.json({
    success: true,
    shareUrl: `/reports/share/${token}`,
    link,
  });
}

async function handleUpdateStatus(
  reportId: string,
  input: Extract<ActionInput, { action: "update_status" }>
) {
  await prisma.ai_reports.update({
    where: { id: reportId },
    data: { status: input.status },
  });

  return NextResponse.json({ success: true });
}

async function handleAddNote(
  reportId: string,
  userId: string,
  input: Extract<ActionInput, { action: "add_note" }>
) {
  const note = await prisma.reportNote.create({
    data: {
      reportId,
      content: input.content,
      noteType: input.noteType || "general",
      authorId: userId,
    },
  });

  return NextResponse.json({ success: true, note });
}
