/**
 * PHASE 50 - CARRIER SUMMARY API
 * GET /api/claims/[claimId]/carrier-summary
 * 
 * Generates complete carrier submission packet
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { formatPacketForDelivery,generateCarrierSummary } from "@/lib/claims/generators/carrierSummary";

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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json or text

    console.log(`[carrier-summary-api] Generating carrier summary for claim ${claimId}`);

    // Generate carrier summary
    const summary = await generateCarrierSummary(claimId);

    console.log(`[carrier-summary-api] Successfully generated carrier summary for claim ${claimId}`);

    // Return formatted text if requested
    if (format === "text") {
      const formattedText = formatPacketForDelivery(summary);
      return new NextResponse(formattedText, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="claim-${claimId}-submission.txt"`,
        },
      });
    }

    // Return JSON by default
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("[carrier-summary-api] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate carrier summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
