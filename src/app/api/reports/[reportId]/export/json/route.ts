// src/app/api/reports/[id]/export/json/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type RouteParams = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reportId = params.id;

    const report = await prisma.ai_reports.findFirst({
      where: {
        id: reportId,
        orgId: orgId ?? undefined,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const data = (report as any).data ?? {};

    const payload = {
      version: "1.0",
      exportType: "report",
      reportId: report.id,
      claimId: report.claimId,
      orgId: report.orgId,
      title: report.title,
      reportType: report.type,
      createdAt: report.createdAt,
      sections: data.sections ?? [],
      summary: data.summary ?? "",
      meta: data.meta ?? {},
    };

    const fileName = `report-${report.id}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Error exporting report JSON:", err);
    return NextResponse.json({ error: "Failed to export report." }, { status: 500 });
  }
}
