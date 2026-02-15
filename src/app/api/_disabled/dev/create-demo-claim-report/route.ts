/**
 * CREATE DEMO CLAIM REPORT API
 * Generates a complete demo claim with fully populated ClaimReport
 * For training and testing purposes only
 *
 * DEPRECATED: reports model schema doesn't support coverPage, executiveSummary etc.
 * Those fields would need to be stored in sections/summary JSON fields
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This route requires schema fields that don't exist on reports model
    // reports has: id, orgId, claimId, createdById, type, title, subtitle, sections, summary, meta
    // NOT: status, coverPage, executiveSummary, damageSummary, damagePhotos, etc.
    return NextResponse.json(
      {
        ok: false,
        error: "Feature not implemented",
        deprecated: true,
        message:
          "reports model schema doesn't support coverPage/executiveSummary etc. Need to restructure to use sections/summary JSON fields.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[Create Demo Claim Report] Error:", error);
    return NextResponse.json({ error: "Failed to create demo claim" }, { status: 500 });
  }
}
