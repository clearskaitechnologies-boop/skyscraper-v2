// app/api/automation/run/route.ts
/**
 * 🔥 DOMINUS AUTOMATION API
 * POST /api/automation/run
 * 
 * Runs full automation pipeline for a claim
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { runDominusAutomations } from "@/lib/intel/automation/engine";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId } = body;

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
    }

    logger.debug(`[API] Running Dominus automations for ${claimId}`);

    // Run the automation engine
    const result = await runDominusAutomations(claimId, orgId);

    return NextResponse.json({
      success: result.success,
      triggersDetected: result.triggersDetected.length,
      actionsExecuted: result.actionsExecuted,
      results: result.results,
      errors: result.errors,
    });
  } catch (error) {
    logger.error("[AUTOMATION API] Error:", error);
    return NextResponse.json(
      { error: "Automation failed", details: String(error) },
      { status: 500 }
    );
  }
}
