export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// EXPORT API ROUTE - /api/reports/[reportId]/export
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import {
  useReportBranding,
  useReportClaimData,
  useReportCodes,
  useReportLineItems,
  useReportPhotos,
  useReportSupplements,
  useReportWeather,
} from "@/modules/reports/core/DataProviders";
import { exportReport } from "@/modules/reports/export/orchestrator";
import type { ExportFormat, ReportContext,SectionKey } from "@/modules/reports/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { format, sections } = body as {
      format: ExportFormat;
      sections: SectionKey[];
    };

    if (!format || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Invalid request: format and sections required" },
        { status: 400 }
      );
    }

    // Build report context with mock data (replace with real DB queries in Phase 2)
    const context: ReportContext = {
      branding: useReportBranding(),
      metadata: useReportClaimData(),
      weather: useReportWeather(),
      photos: useReportPhotos(),
      lineItems: useReportLineItems(),
      codes: useReportCodes(),
      supplements: useReportSupplements(),
      executiveSummary: `This report documents storm damage to the property. A qualifying weather event occurred, resulting in damage requiring full roof replacement.`,
      adjusterNotes: "Contractor notes and rebuttals will appear here.",
    };

    // Export the report
    const result = await exportReport({
      reportId: params.id,
      userId,
      format,
      sections,
      context,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Export failed" },
        { status: 500 }
      );
    }

    // Return file as blob
    if (result.buffer) {
      const contentTypes = {
        pdf: "application/pdf",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        zip: "application/zip",
      };

      return new NextResponse(result.buffer as any, {
        headers: {
          "Content-Type": contentTypes[format],
          "Content-Disposition": `attachment; filename="contractor-packet-${params.id}.${format}"`,
        },
      });
    }

    return NextResponse.json({ error: "No file generated" }, { status: 500 });
  } catch (error) {
    logger.error("[Export API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", stack: error.stack },
      { status: 500 }
    );
  }
}
