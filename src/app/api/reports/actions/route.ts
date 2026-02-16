/**
 * Reports Generate Actions - Unified handler for report generation
 *
 * POST /api/reports/generate
 * Actions: generate, generate_from_template, compose, summary, supplement, queue
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
    action: z.literal("generate"),
    claimId: z.string(),
    reportType: z.string(),
    options: z.record(z.any()).optional(),
  }),
  z.object({
    action: z.literal("generate_from_template"),
    claimId: z.string(),
    templateId: z.string(),
    variables: z.record(z.any()).optional(),
  }),
  z.object({
    action: z.literal("compose"),
    claimId: z.string(),
    sections: z.array(
      z.object({
        key: z.string(),
        content: z.string().optional(),
        include: z.boolean().optional(),
      })
    ),
  }),
  z.object({
    action: z.literal("summary"),
    claimId: z.string(),
    format: z.enum(["brief", "detailed", "executive"]).optional(),
  }),
  z.object({
    action: z.literal("supplement"),
    claimId: z.string(),
    originalReportId: z.string().optional(),
    newDamage: z.array(z.record(z.any())).optional(),
  }),
  z.object({
    action: z.literal("queue"),
    claimId: z.string(),
    reportType: z.string(),
    priority: z.enum(["low", "normal", "high"]).optional(),
    scheduledFor: z.string().optional(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
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

    // Verify org
    const org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const input = parsed.data;

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: input.claimId, orgId: org.id },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    switch (input.action) {
      case "generate":
        return handleGenerate(claim.id, org.id, userId, input);

      case "generate_from_template":
        return handleGenerateFromTemplate(claim.id, org.id, userId, input);

      case "compose":
        return handleCompose(claim.id, org.id, userId, input);

      case "summary":
        return handleSummary(claim.id, org.id, userId, input);

      case "supplement":
        return handleSupplement(claim.id, org.id, userId, input);

      case "queue":
        return handleQueue(claim.id, org.id, userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error("[Reports Generate] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleGenerate(
  claimId: string,
  orgId: string,
  userId: string,
  input: Extract<ActionInput, { action: "generate" }>
) {
  // Create report record
  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: input.reportType,
      status: "generating",
      createdBy: userId,
      options: input.options || {},
    },
  });

  // In production, trigger async generation job here
  // For now, mark as pending
  await prisma.ai_reports.update({
    where: { id: report.id },
    data: { status: "pending" },
  });

  return NextResponse.json({
    success: true,
    report: { id: report.id, status: "pending" },
    message: "Report generation started",
  });
}

async function handleGenerateFromTemplate(
  claimId: string,
  orgId: string,
  userId: string,
  input: Extract<ActionInput, { action: "generate_from_template" }>
) {
  // Verify template exists
  const template = await prisma.reportTemplate.findFirst({
    where: { id: input.templateId, orgId },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: template.type,
      templateId: input.templateId,
      status: "generating",
      createdBy: userId,
      variables: input.variables || {},
    },
  });

  return NextResponse.json({
    success: true,
    report: { id: report.id },
    message: "Report generation from template started",
  });
}

async function handleCompose(
  claimId: string,
  orgId: string,
  userId: string,
  input: Extract<ActionInput, { action: "compose" }>
) {
  // Create composed report with sections
  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: "composed",
      status: "draft",
      createdBy: userId,
      sections: input.sections,
    },
  });

  return NextResponse.json({
    success: true,
    report: { id: report.id },
    message: "Composed report created",
  });
}

async function handleSummary(
  claimId: string,
  orgId: string,
  userId: string,
  input: Extract<ActionInput, { action: "summary" }>
) {
  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: "summary",
      status: "generating",
      createdBy: userId,
      options: { format: input.format || "detailed" },
    },
  });

  return NextResponse.json({
    success: true,
    report: { id: report.id },
    message: "Summary generation started",
  });
}

async function handleSupplement(
  claimId: string,
  orgId: string,
  userId: string,
  input: Extract<ActionInput, { action: "supplement" }>
) {
  const report = await prisma.ai_reports.create({
    data: {
      claimId,
      orgId,
      reportType: "supplement",
      status: "generating",
      createdBy: userId,
      parentReportId: input.originalReportId,
      supplementData: { newDamage: input.newDamage || [] },
    },
  });

  return NextResponse.json({
    success: true,
    report: { id: report.id },
    message: "Supplement generation started",
  });
}

async function handleQueue(
  claimId: string,
  orgId: string,
  userId: string,
  input: Extract<ActionInput, { action: "queue" }>
) {
  const queueItem = await prisma.reportQueue.create({
    data: {
      claimId,
      orgId,
      reportType: input.reportType,
      priority: input.priority || "normal",
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
      createdBy: userId,
      status: "queued",
    },
  });

  return NextResponse.json({
    success: true,
    queueItem: { id: queueItem.id },
    message: "Report queued for generation",
  });
}
