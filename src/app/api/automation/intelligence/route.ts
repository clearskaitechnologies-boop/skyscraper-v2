// app/api/automation/intelligence/route.ts
/**
 * GET /api/automation/intelligence
 * 
 * Gets automation intelligence for a claim (tasks, alerts, recommendations)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { getClaimAutomationIntelligence } from "@/lib/intel/automation/engine";

export async function GET(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
    }

    const intelligence = await getClaimAutomationIntelligence(claimId, orgId);

    return NextResponse.json(intelligence);
  } catch (error) {
    logger.error("[AUTOMATION INTELLIGENCE] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch intelligence", details: String(error) },
      { status: 500 }
    );
  }
}
