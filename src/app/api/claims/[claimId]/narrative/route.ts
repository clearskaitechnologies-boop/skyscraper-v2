/**
 * PHASE 50 - NARRATIVE GENERATOR API
 * POST /api/claims/[claimId]/narrative
 * 
 * Generates a comprehensive claim narrative in various tones
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { generateNarrative } from "@/lib/claims/generators/narrative";

export async function POST(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;
    const body = await request.json();
    const { tone = "adjuster" } = body;

    console.log(`[narrative-api] Generating narrative for claim ${claimId} with tone: ${tone}`);

    // Validate tone
    const validTones = ["contractor", "adjuster", "attorney", "homeowner"];
    if (!validTones.includes(tone)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${validTones.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate narrative
    const narrative = await generateNarrative(claimId, tone as any);

    console.log(`[narrative-api] Successfully generated narrative for claim ${claimId}`);

    return NextResponse.json({
      success: true,
      narrative,
    });
  } catch (error) {
    console.error("[narrative-api] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate narrative",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
