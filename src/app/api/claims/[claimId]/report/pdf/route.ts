/**
 * GET /api/claims/[claimId]/report/pdf
 * Generate and download PDF report
 */

import { auth } from "@clerk/nextjs/server";
import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

import { logReportPDFGenerated } from "@/lib/claims/logReportActivity";
import { runJob } from "@/lib/jobs/runJob";
import { generateReportPDF } from "@/lib/pdf/generateReportPDF";
import prisma from "@/lib/prisma";
import { emitEvent } from "@/lib/telemetry";

export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch claim with all related data (claims has 'reports' not 'ClaimReport')
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
        reports: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify access
    const orgMember = await prisma.user_organizations.findFirst({
      where: {
        organizationId: claim.orgId,
        userId: userId,
      },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!claim.reports || claim.reports.length === 0) {
      return NextResponse.json({ error: "Report not yet generated" }, { status: 404 });
    }

    const report = claim.reports[0];

    // Section data lives in the `sections` or `meta` JSON columns, not as top-level columns
    const sections = (report.sections ?? report.meta ?? {}) as Record<string, any>;

    // Build report data structure
    const reportData = {
      coverPage: sections.coverPage ?? null,
      executiveSummary: sections.executiveSummary ?? null,
      damageSummary: sections.damageSummary ?? null,
      damagePhotos: sections.damagePhotos ?? null,
      weatherVerification: sections.weatherVerification ?? null,
      codeCompliance: sections.codeCompliance ?? null,
      systemFailure: sections.systemFailure ?? null,
      scopeOfWork: sections.scopeOfWork ?? null,
      professionalOpinion: sections.professionalOpinion ?? null,
      signatures: sections.signatures ?? null,
    };

    // Generate portal URL
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client-portal/${claim.id}`;

    const pdfBuffer = await runJob({
      orgId: claim.orgId,
      queue: "api",
      jobName: "report.pdf_generate",
      meta: { claimId: params.claimId, reportId: report.id },
      fn: async () => {
        // Generate PDF
        const pdfDoc = await generateReportPDF(reportData, portalUrl);
        const stream = await renderToStream(pdfDoc);

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        const reader = (stream as unknown as ReadableStream<Uint8Array>).getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        return Buffer.concat(chunks);
      },
    });

    // Log PDF generation activity
    await logReportPDFGenerated(params.claimId, userId);

    await emitEvent({
      orgId: claim.orgId,
      clerkUserId: userId,
      kind: "report.pdf_generated",
      refType: "claim",
      refId: params.claimId,
      title: "Claim report PDF generated",
      meta: {
        reportId: report.id,
        bytes: pdfBuffer.length,
      },
    });

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
