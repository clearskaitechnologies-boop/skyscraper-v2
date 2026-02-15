import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { runReportBuilder } from "@/lib/report-engine/ai";
import { ReportAudience,ReportKind } from "@/lib/report-engine/report-types";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      claimId,
      reportType,
      audience,
      addonPayload,
      address,
      roofType,
      lossType,
    } = body as {
      claimId: string;
      reportType: ReportKind;
      audience: ReportAudience;
      addonPayload: any;
      address: string;
      roofType?: string;
      lossType?: string;
    };

    if (!claimId || !reportType || !audience || !address) {
      return NextResponse.json(
        { error: "Missing required fields (claimId, reportType, audience, address)." },
        { status: 400 }
      );
    }

    const report = await runReportBuilder({
      claimId,
      reportType,
      audience,
      addonPayload: addonPayload ?? {},
      address,
      roofType,
      lossType,
      orgId,
    });

    const fileName = `report-${report.meta?.claimNumber || claimId}.json`;

    return new NextResponse(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error("Error exporting smart report JSON:", err);
    return NextResponse.json(
      { error: err.message || "Failed to export report." },
      { status: 500 }
    );
  }
}
