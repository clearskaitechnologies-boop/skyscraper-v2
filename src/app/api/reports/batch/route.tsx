// app/api/reports/batch/route.ts

import { renderToBuffer } from "@react-pdf/renderer";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { ClaimsReportPDF } from "@/components/pdf/ClaimsReportPDF";
import { RetailReportPDF } from "@/components/pdf/RetailReportPDF";
import { requireApiOrg } from "@/lib/auth/apiAuth";
import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";
import { buildReportData } from "@/lib/reports/buildReportData";
import { ReportSectionId, ReportType } from "@/lib/reports/types";
import { uploadPdfToFirebase } from "@/lib/storage/uploadPdfToFirebase";

interface BatchReportRequest {
  claimIds: string[];
  reportType: ReportType;
  sections: ReportSectionId[];
  emailWhenDone?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireApiOrg();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { orgId } = authResult;

    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body: BatchReportRequest = await req.json();
    const { claimIds, reportType, sections, emailWhenDone } = body;

    if (!claimIds || claimIds.length === 0) {
      return NextResponse.json({ error: "No claims IDs provided" }, { status: 400 });
    }

    // Verify all claims belong to this Org
    const claims = await prisma.claims.findMany({
      where: {
        id: { in: claimIds },
        orgId,
      },
      select: { id: true, claimNumber: true },
    });

    if (claims.length !== claimIds.length) {
      return NextResponse.json({ error: "Some claims not found or unauthorized" }, { status: 403 });
    }

    const generatedReports: Array<{
      claimId: string;
      claimNumber: string | null;
      reportId: string;
      url: string;
    }> = [];

    // Generate report for each claim
    for (const claim of claims) {
      try {
        // Build report data
        const reportData = await buildReportData({
          orgId,
          claimId: claim.id,
          type: reportType,
          sections,
        });

        // Render PDF
        const Component = reportType === "RETAIL_PROPOSAL" ? RetailReportPDF : ClaimsReportPDF;
        const pdfBuffer = await renderToBuffer(<Component data={reportData} sections={sections} />);

        // Upload to Firebase
        const fileName = `${reportType.toLowerCase()}-${claim.claimNumber || claim.id.slice(0, 8)}-${Date.now()}.pdf`;
        const downloadUrl = await uploadPdfToFirebase(pdfBuffer, orgId, claim.id, fileName);

        // Save to database
        const savedReport = await getDelegate("reportRecord").create({
          data: {
            orgId,
            claimId: claim.id,
            reportType,
            sections,
            url: downloadUrl,
            fileName,
          },
        });

        generatedReports.push({
          claimId: claim.id,
          claimNumber: claim.claimNumber,
          reportId: savedReport.id,
          url: downloadUrl,
        });
      } catch (error) {
        logger.error(`Failed to generate report for claim ${claim.id}:`, error);
        // Continue with other reports
      }
    }

    // TODO: Send email if requested
    if (emailWhenDone && generatedReports.length > 0) {
      // Implement email notification
      logger.debug("Email notification requested but not yet implemented");
    }

    return NextResponse.json({
      success: true,
      totalRequested: claimIds.length,
      totalGenerated: generatedReports.length,
      reports: generatedReports,
    });
  } catch (error) {
    logger.error("Batch report generation error:", error);
    return NextResponse.json({ error: "Failed to generate batch reports" }, { status: 500 });
  }
}
