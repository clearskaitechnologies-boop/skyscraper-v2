/**
 * PATCH /api/claims/[claimId]/report
 * Update individual sections of claim report
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  logReportCreated,
  logReportFinalized,
  logReportReopened,
  logReportSubmitted,
  logReportUpdated,
} from "@/lib/claims/logReportActivity";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section, data } = await req.json();

    // Validate section name
    const validSections = [
      "coverPage",
      "executiveSummary",
      "damageSummary",
      "damagePhotos",
      "weatherVerification",
      "codeCompliance",
      "systemFailure",
      "scopeOfWork",
      "professionalOpinion",
      "signatures",
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section name" }, { status: 400 });
    }

    // Verify claim ownership
    const claim = await prisma.claims.findUnique({
      where: { id: params.claimId },
      include: { properties: { include: { Org: true } }, Org: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Check if user has access (org member)
    const orgMember = await prisma.user_organizations.findFirst({
      where: {
        organizationId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if report exists for this claim
    const existingReport = await prisma.reports.findFirst({
      where: { claimId: params.claimId },
    });

    const isNewReport = !existingReport;

    // Update or create report with section data stored in sections JSON
    let report;
    if (existingReport) {
      const existingSections = (existingReport.sections as Record<string, unknown>) || {};
      report = await prisma.reports.update({
        where: { id: existingReport.id },
        data: {
          sections: { ...existingSections, [section]: data },
          updatedAt: new Date(),
        },
      });
    } else {
      report = await prisma.reports.create({
        data: {
          id: crypto.randomUUID(),
          claimId: params.claimId,
          createdById: userId,
          type: "claim_report",
          title: `Claim Report - ${claim.claimNumber}`,
          sections: { [section]: data },
          updatedAt: new Date(),
        },
      });
    }

    // Log activity
    if (isNewReport) {
      await logReportCreated(params.claimId, userId);
    } else {
      await logReportUpdated(params.claimId, [section], userId);
    }

    console.log(`[REPORT_UPDATE] Section ${section} updated for claim ${params.claimId}`);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("[REPORT_UPDATE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/claims/[claimId]/report
 * Fetch complete claim report
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify claim ownership
    const claim = await prisma.claims.findUnique({
      where: { id: params.claimId },
      include: {
        properties: { include: { Org: true } },
        Org: true,
        reports: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Check if user has access (org member)
    const orgMember = await prisma.user_organizations.findFirst({
      where: {
        organizationId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the first report for this claim (primary report)
    const claimReport = claim.reports[0];
    if (!claimReport) {
      return NextResponse.json({ error: "Report not yet generated" }, { status: 404 });
    }

    return NextResponse.json({ report: claimReport });
  } catch (error) {
    console.error("[REPORT_FETCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/claims/[claimId]/report
 * Finalize, submit, or reopen a report
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, carrierName } = await req.json();

    // Validate action
    const validActions = ["finalize", "submit", "reopen"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Verify claim ownership
    const claim = await prisma.claims.findUnique({
      where: { id: params.claimId },
      include: { properties: { include: { Org: true } }, Org: true, reports: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get the primary report for this claim
    const claimReport = claim.reports[0];
    if (!claimReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user has access (org member)
    const orgMember = await prisma.user_organizations.findFirst({
      where: {
        organizationId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only admins can reopen submitted reports
    if (action === "reopen" && orgMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can reopen submitted reports" },
        { status: 403 }
      );
    }

    // Get current meta or initialize it
    const currentMeta = (claimReport.meta as Record<string, unknown>) || {};
    const currentStatus = (currentMeta.status as string) || "draft";
    let finalizedAt: string | null = (currentMeta.finalizedAt as string) || null;
    let submittedAt: string | null = (currentMeta.submittedAt as string) || null;

    // Update meta based on action
    let newStatus: string;
    switch (action) {
      case "finalize":
        newStatus = "finalized";
        finalizedAt = new Date().toISOString();
        break;
      case "submit":
        newStatus = "submitted";
        submittedAt = new Date().toISOString();
        break;
      case "reopen":
        newStatus = "draft";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedReport = await prisma.reports.update({
      where: { id: claimReport.id },
      data: {
        meta: {
          ...currentMeta,
          status: newStatus,
          finalizedAt,
          submittedAt,
        },
        updatedAt: new Date(),
      },
    });

    // Log activity
    switch (action) {
      case "finalize":
        await logReportFinalized(params.claimId, userId);
        break;
      case "submit":
        await logReportSubmitted(params.claimId, carrierName || claim.carrier, userId);
        break;
      case "reopen":
        await logReportReopened(params.claimId, userId);
        break;
    }

    console.log(`[REPORT_ACTION] ${action} completed for claim ${params.claimId}`);

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error("[REPORT_ACTION] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
