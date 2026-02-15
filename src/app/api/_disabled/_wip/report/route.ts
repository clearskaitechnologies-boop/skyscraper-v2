/**
 * PATCH /api/claims/[claimId]/report
 * Update individual sections of claim report
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
    const orgMember = await prisma.org_members.findFirst({
      where: {
        orgId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upsert report section
    const report = await prisma.reports.upsert({
      where: { claimId: params.claimId },
      update: {
        [section]: data,
        updatedAt: new Date(),
      },
      create: {
        claimId: params.claimId,
        [section]: data,
      },
    });

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
        ClaimReport: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Check if user has access (org member)
    const orgMember = await prisma.org_members.findFirst({
      where: {
        orgId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!claim.ClaimReport) {
      return NextResponse.json({ error: "Report not yet generated" }, { status: 404 });
    }

    return NextResponse.json({ report: claim.ClaimReport });
  } catch (error) {
    console.error("[REPORT_FETCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
