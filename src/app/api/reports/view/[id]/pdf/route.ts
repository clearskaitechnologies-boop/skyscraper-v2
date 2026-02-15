/**
 * POST /api/reports/view/[id]/pdf
 *
 * Generate and export report as PDF
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch report with all relations
    const report = await prisma.ai_reports.findUnique({
      where: { id: params.id },
      include: {
        // Note: ai_reports doesn't have createdBy relation - has userId and userName instead
        claims: {
          select: {
            claimNumber: true,
            insured_name: true,
            carrier: true,
            policy_number: true,
            propertyId: true,
          },
        },
      },
    });

    if (!report || report.orgId !== orgId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Fetch org branding
    const branding = await prisma.org_branding.findFirst({
      where: {
        orgId: orgId as string,
      },
      select: {
        companyName: true,
        logoUrl: true,
        colorPrimary: true,
        license: true,
        phone: true,
        email: true,
      },
    });

    // PHASE 2: PDF Generation System
    // Options:
    // 1. react-pdf: Generate PDFs from React components (npm install @react-pdf/renderer)
    // 2. Puppeteer: Render HTML to PDF (requires Chrome binary)
    // 3. PDFKit: Low-level PDF creation
    // Example with react-pdf:
    // const pdfBuffer = await generateReportPDF({
    //   report,
    //   branding,
    //   options: {
    //     includeTableOfContents: true,
    //     includePageNumbers: true,
    //     footerText: branding?.companyName || "Report",
    //   },
    // });

    // FEATURE NOT IMPLEMENTED: PDF export requires PDFKit integration
    // Return proper 501 error instead of mock response
    return NextResponse.json(
      {
        error: "PDF export not yet implemented",
        message: "This feature requires PDFKit or similar PDF generation library to be integrated.",
        reportId: report.id,
        reportType: report.type,
        title: report.title,
        statusCode: 501,
        // PRODUCTION IMPLEMENTATION:
        // 1. Install PDFKit: npm install pdfkit
        // 2. Generate PDF with report data + branding
        // 3. Upload to storage (Firebase/S3)
        // 4. Return: { pdfUrl, filename, size }
      },
      { status: 501 }
    );
  } catch (error: any) {
    console.error(`[POST /api/reports/view/${params.id}/pdf] Error:`, error);
    return NextResponse.json({ error: error.message || "Failed to export PDF" }, { status: 500 });
  }
}
