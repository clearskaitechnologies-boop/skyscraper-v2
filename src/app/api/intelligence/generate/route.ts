import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import type { ReportType } from "@/lib/intelligence/report-builder";
import { runIntelligenceReportBuilder } from "@/lib/intelligence/report-builder";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { claimId, reportType, features } = body;

    if (!claimId || !reportType) {
      return NextResponse.json(
        { error: "claimId and reportType are required" },
        { status: 400 }
      );
    }

    // Validate report type
    const validTypes: ReportType[] = ["QUICK", "CLAIMS_READY", "RETAIL", "FORENSIC"];
    if (!validTypes.includes(reportType as ReportType)) {
      return NextResponse.json(
        { error: `Invalid reportType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate the intelligence report
    const report = await runIntelligenceReportBuilder({
      claimId,
      orgId,
      userId,
      reportType: reportType as ReportType,
      featureOverrides: features || {},
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    logger.error("Error generating intelligence report:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate intelligence report" },
      { status: 500 }
    );
  }
}
