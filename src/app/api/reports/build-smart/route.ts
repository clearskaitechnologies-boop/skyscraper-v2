// src/app/api/reports/build-smart/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/apiError";
import { logInfo, timeExecution } from "@/lib/log";
import { runReportBuilder } from "@/lib/report-engine/ai";
import { ReportAudience, ReportKind } from "@/lib/report-engine/report-types";
import { saveGeneratedReportToDb } from "@/lib/report-engine/save";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const { claimId, reportType, audience, addonPayload, address, roofType, lossType, save } =
      body as {
        claimId: string;
        reportType: ReportKind;
        audience: ReportAudience;
        addonPayload: any;
        address: string;
        roofType?: string;
        lossType?: string;
        save?: boolean;
      };

    if (!claimId || !reportType || !audience || !address) {
      return NextResponse.json(
        { error: "Missing required fields (claimId, reportType, audience, address)." },
        { status: 400 }
      );
    }

    // Generate the report using the unified AI engine
    const buildStart = Date.now();
    const report = await timeExecution("report.buildSmart", () =>
      runReportBuilder({
        claimId,
        reportType,
        audience,
        addonPayload: addonPayload ?? {},
        address,
        roofType,
        lossType,
        orgId,
      })
    );
    const ms = Date.now() - buildStart;
    logInfo("report.buildSmart.completed", { claimId, ms, reportType });

    let savedReport: { id: string } | null = null;

    // Optionally save to database
    if (save) {
      const created = await saveGeneratedReportToDb({
        claimId,
        orgId,
        userId,
        report,
      });
      savedReport = { id: created.id };
    }

    return NextResponse.json(
      {
        report,
        reportId: savedReport?.id ?? null,
        performance: { buildMs: ms },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in build-smart report route:", err);
    return apiError(500, "INTERNAL_ERROR", err.message || "Failed to build AI report.");
  }
}
