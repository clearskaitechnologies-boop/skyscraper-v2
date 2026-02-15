/**
 * POST /api/reports/save
 * GET /api/reports/save?claimId=xxx or ?leadId=xxx
 *
 * Save a report to database OR list reports for a claim/lead
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SaveReportSchema = z.object({
  claim_id: z.string().optional(),
  leadId: z.string().optional(),
  type: z.enum(["inspection_report", "adjuster_packet", "homeowner_report", "internal_summary"]),
  title: z.string(),
  subtitle: z.string().optional(),
  lossType: z.string().optional(),
  dol: z.string().optional(), // ISO date string
  address: z.string().optional(),
  damageAssessmentId: z.string().optional(),
  weatherReportId: z.string().optional(),
  estimateId: z.string().optional(),
  supplementId: z.string().optional(),
  sections: z.array(z.any()),
  summary: z.object({
    highLevel: z.string(),
    recommendedScopeSummary: z.string(),
    notesToReader: z.string().optional(),
  }),
  meta: z.any().optional(),
});

// POST - Save a new report
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = SaveReportSchema.parse(body);

    // Create report - using only fields that exist in ai_reports schema
    const report = await prisma.ai_reports.create({
      data: {
        id: crypto.randomUUID(),
        orgId: orgId as string,
        claimId: validated.claim_id || null,
        userId: userId,
        userName: "User",
        type: validated.type,
        title: validated.title,
        content: JSON.stringify({
          sections: validated.sections,
          summary: validated.summary,
          meta: validated.meta,
          subtitle: validated.subtitle,
          lossType: validated.lossType,
          dol: validated.dol,
          address: validated.address,
        }),
        tokensUsed: 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: report.id,
      status: "saved",
      report,
    });
  } catch (error: any) {
    console.error("[POST /api/reports/save] Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || "Failed to save report" }, { status: 500 });
  }
}

// GET - List reports for claim or lead
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");
    const leadId = searchParams.get("leadId");

    if (!claimId && !leadId) {
      return NextResponse.json({ error: "claimId or leadId is required" }, { status: 400 });
    }

    const reports = await prisma.ai_reports.findMany({
      where: {
        orgId: orgId as string,
        ...(claimId ? { claimId } : {}),
        ...(leadId ? { leadId } : {}),
      },
      // Note: ai_reports doesn't have createdBy relation
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("[GET /api/reports/save] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
