/**
 * /api/storage/quota
 *
 * Check organization storage quota and usage
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  checkMonthlyClaimsLimit,
  getStorageSummary,
  STORAGE_LIMITS,
} from "@/lib/storage/guardrails";

/**
 * GET /api/storage/quota
 * Get current storage usage and limits
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getStorageSummary(orgId);
    const claimsCheck = await checkMonthlyClaimsLimit(orgId);

    return NextResponse.json({
      ok: true,
      storage: {
        used: summary.used,
        max: summary.max,
        percentUsed: summary.percentUsed,
        filesCount: summary.filesCount,
        isNearLimit: summary.isNearLimit,
        isAtLimit: summary.isAtLimit,
      },
      plan: {
        name: summary.plan,
        limits: summary.limits,
      },
      claims: {
        canCreateMore: claimsCheck.valid,
        limitMessage: claimsCheck.error,
      },
      allPlans: STORAGE_LIMITS,
    });
  } catch (error) {
    console.error("[Storage Quota] Error:", error);
    return NextResponse.json({ error: "Failed to get storage quota" }, { status: 500 });
  }
}
