/**
 * API: Generate Universal Claims Report
 * POST /api/claims/[claimId]/generate-report
 */

import { NextRequest, NextResponse } from "next/server";

import { generateUniversalReport } from "@/lib/ai/report-generator";
import { getOrgClaimOrThrow, OrgScopeError } from "@/lib/auth/orgScope";
import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { orgId, userId } = auth;

    const { claimId } = params;

    console.log(`[GENERATE_REPORT] Starting for claim ${claimId}`);

    // Verify claim exists and belongs to this org
    await getOrgClaimOrThrow(orgId, claimId);

    // Generate the universal report
    const report = await generateUniversalReport(claimId, userId);

    console.log(`[GENERATE_REPORT] Complete for claim ${claimId}`);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    if (error instanceof OrgScopeError) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    console.error("[GENERATE_REPORT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
