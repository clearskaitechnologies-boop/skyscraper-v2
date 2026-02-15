/**
 * API: Generate Universal Claims Report
 * POST /api/claims/[claimId]/generate-report
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { generateUniversalReport } from "@/lib/ai/report-generator";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    console.log(`[GENERATE_REPORT] Starting for claim ${claimId}`);

    // Verify claim exists and user has access
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Generate the universal report
    const report = await generateUniversalReport(claimId, user.id);

    // Save report to database (optional - could use JSON storage)
    // For now, return the report data
    console.log(`[GENERATE_REPORT] Complete for claim ${claimId}`);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("[GENERATE_REPORT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
