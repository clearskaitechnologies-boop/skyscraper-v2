/**
 * ADMIN REPORT METRICS API
 * Returns Universal Report metrics for admin dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { getReportMetrics } from "@/lib/analytics/reportMetrics";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.userId || !ctx.orgId) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }
    const { userId, orgId, role: ctxRole } = ctx;

    // Check if user is admin
    const role = ctxRole as string | undefined;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Feature flag check
    if (process.env.ENABLE_UNIVERSAL_REPORTS !== "true") {
      return NextResponse.json({ error: "Universal Reports feature not enabled" }, { status: 403 });
    }

    // Get orgId from query params (allow admins to check other orgs if needed)
    const searchParams = request.nextUrl.searchParams;
    const targetOrgId = searchParams.get("orgId") || orgId;

    // Get metrics
    const metrics = await getReportMetrics(targetOrgId);

    return NextResponse.json(metrics);
  } catch (error) {
    logger.error("[Admin Report Metrics] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
