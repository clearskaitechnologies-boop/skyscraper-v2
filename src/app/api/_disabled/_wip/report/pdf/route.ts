/**
 * GET /api/claims/[claimId]/report/pdf
 * Generate and download PDF report
 */

import { auth } from "@clerk/nextjs/server";
import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

import { generateReportPDF } from "@/lib/pdf/generateReportPDF";
import prisma from "@/lib/prisma";

/** Shape of the JSON report sections stored in ClaimReport */
interface ReportData {
  coverPage: Record<string, unknown>;
  executiveSummary: Record<string, unknown>;
  damageSummary: Record<string, unknown>;
  damagePhotos: unknown[];
  weatherVerification: Record<string, unknown>;
  codeCompliance: unknown[];
  systemFailure: Record<string, unknown>;
  scopeOfWork: unknown[];
  professionalOpinion: Record<string, unknown>;
  signatures: Record<string, unknown>;
}

export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch claim with all related data
    const claim = await prisma.claims.findUnique({
      where: { id: params.claimId },
      include: {
        properties: {
          include: {
            Org: true,
            contacts: true,
          },
        },
        Org: true,
        ClaimReport: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify access
    const orgMember = await prisma.org_members.findFirst({
      where: {
        orgId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!claim.ClaimReport) {
      return NextResponse.json({ error: "Report not yet generated" }, { status: 404 });
    }

    const report = claim.ClaimReport;

    // Build report data structure
    const reportData: ReportData = {
      coverPage: report.coverPage as Record<string, unknown>,
      executiveSummary: report.executiveSummary as Record<string, unknown>,
      damageSummary: report.damageSummary as Record<string, unknown>,
      damagePhotos: report.damagePhotos as unknown[],
      weatherVerification: report.weatherVerification as Record<string, unknown>,
      codeCompliance: report.codeCompliance as unknown[],
      systemFailure: report.systemFailure as Record<string, unknown>,
      scopeOfWork: report.scopeOfWork as unknown[],
      professionalOpinion: report.professionalOpinion as Record<string, unknown>,
      signatures: report.signatures as Record<string, unknown>,
    };

    // Generate portal URL
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client-portal/${claim.id}`;

    // Generate PDF
    const pdfDoc = await generateReportPDF(
      reportData as unknown as Parameters<typeof generateReportPDF>[0],
      portalUrl
    );
    const stream = await renderToStream(pdfDoc);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = (stream as unknown as ReadableStream<Uint8Array>).getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF
    const filename = `claim-${claim.claimNumber || claim.id}-report.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF_GENERATE] Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
