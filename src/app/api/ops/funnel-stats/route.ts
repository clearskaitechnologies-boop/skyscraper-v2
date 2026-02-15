import { NextResponse } from "next/server";

import { getProductEventsSummary } from "@/lib/analytics/track";
import { requireApiAuth } from "@/lib/auth/apiAuth";

/**
 * GET /api/ops/funnel-stats
 * Returns conversion funnel statistics for ops dashboard
 */
export async function GET() {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const events = await getProductEventsSummary();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[OPS_FUNNEL_STATS] Failed:", error);
    return NextResponse.json({ events: [] });
  }
}
