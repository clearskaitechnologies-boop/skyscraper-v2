/**
 * PHASE 50 - CODE COMPLIANCE API
 * GET /api/claims/[claimId]/code
 * 
 * Generates code compliance summary with IRC R905.x requirements
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { generateCodeSummary } from "@/lib/claims/generators/code";

export async function GET(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    console.log(`[code-api] Generating code summary for claim ${claimId}`);

    // Generate code summary
    const codeSummary = await generateCodeSummary(claimId);

    console.log(`[code-api] Successfully generated code summary for claim ${claimId}`);

    return NextResponse.json({
      success: true,
      codeSummary,
    });
  } catch (error) {
    console.error("[code-api] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate code summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
