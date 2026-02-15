// TODO: This route has 0 frontend callers. Certificate PDF generation not wired to UI.
// src/app/api/reports/certificate/route.ts
/**
 * Certificate of Completion API
 * Generates single-page completion certificate
 */

import { NextRequest, NextResponse } from "next/server";

import { getOrgBranding } from "@/lib/branding/getOrgBranding";
import prisma from "@/lib/prisma";
import { htmlToPdfBuffer, uploadReport } from "@/lib/reports/pdf-utils";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok") {
      return NextResponse.json({ error: "Organization context required" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, jobId } = body;

    if (!claimId) {
      return NextResponse.json({ error: "claimId is required" }, { status: 400 });
    }

    // 1. Get branding
    const orgId = ctx.orgId || "";
    const branding = await getOrgBranding(orgId);

    // 2. Load claim
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        properties: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // 3. Load job
    const job = jobId
      ? await prisma.jobs.findUnique({ where: { id: jobId } })
      : await prisma.jobs.findFirst({
          where: { claimId },
          orderBy: { createdAt: "desc" },
        });

    if (!job) {
      return NextResponse.json({ error: "No job found for this claim" }, { status: 404 });
    }

    // 4. Generate PDF
    const { url: pdfUrl, storageKey } = await generateCertificatePDF({
      branding,
      claim: {
        insured_name: claim.insured_name || "Insured",
        claimNumber: claim.claimNumber,
        propertyAddress: claim.properties
          ? [
              claim.properties.street,
              claim.properties.city,
              claim.properties.state,
              claim.properties.zipCode,
            ]
              .filter(Boolean)
              .join(", ")
          : "Property Address",
      },
      job: {
        jobNumber: job.id.slice(0, 8),
        completionDate:
          job.actualEnd?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        descriptionOfWork: job.description || "Restoration work completed per scope of loss.",
      },
    });

    // 5. Create database record
    const document = await prisma.documents.create({
      data: {
        claimId,
        orgId,
        type: "CERTIFICATE" as any,
        title: `Certificate of Completion - ${claim.claimNumber}`,
        description: `Completion certificate for job #${job.id.slice(0, 8)}`,
        storageKey,
        publicUrl: pdfUrl,
        mimeType: "application/pdf",
        visibleToClient: false,
        createdById: ctx.userId || undefined,
      } as any,
    });

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      url: pdfUrl,
      type: "certificate",
    });
  } catch (error: any) {
    console.error("[POST /api/reports/certificate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

/**
 * Generate Certificate of Completion PDF
 */
async function generateCertificatePDF(payload: {
  branding: any;
  claim: {
    insured_name: string;
    claimNumber: string;
    propertyAddress: string;
  };
  job: {
    jobNumber?: string;
    completionDate?: string;
    descriptionOfWork?: string;
  };
}): Promise<{ url: string; storageKey: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      padding: 80px 60px;
      color: #1a1a1a;
      line-height: 1.6;
      background: white;
    }
    .header {
      border-bottom: 4px solid ${payload.branding.colorPrimary};
      padding-bottom: 30px;
      margin-bottom: 60px;
      text-align: center;
    }
    .company-name {
      font-size: 32px;
      font-weight: 700;
      color: ${payload.branding.colorPrimary};
      margin-bottom: 12px;
    }
    .company-info {
      font-size: 14px;
      color: #666;
    }
    .certificate-title {
      font-size: 36px;
      font-weight: 700;
      text-align: center;
      color: ${payload.branding.colorPrimary};
      margin: 40px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .statement {
      font-size: 18px;
      line-height: 1.8;
      text-align: center;
      margin: 40px auto;
      max-width: 700px;
      color: #333;
    }
    .statement strong {
      color: ${payload.branding.colorPrimary};
      font-weight: 600;
    }
    .job-meta {
      background: #f9f9f9;
      border-left: 4px solid ${payload.branding.colorAccent};
      padding: 30px;
      margin: 50px 0;
      border-radius: 8px;
    }
    .job-meta p {
      font-size: 16px;
      margin: 12px 0;
      color: #333;
    }
    .job-meta strong {
      color: #000;
      display: inline-block;
      min-width: 180px;
    }
    .signature-section {
      margin-top: 80px;
      display: flex;
      justify-content: space-between;
      gap: 60px;
    }
    .signature-block {
      flex: 1;
      text-align: center;
    }
    .signature-line {
      border-top: 2px solid #333;
      margin-bottom: 10px;
      padding-top: 60px;
    }
    .signature-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    .footer {
      margin-top: 100px;
      padding-top: 30px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${payload.branding.companyName}</div>
    <div class="company-info">
      ${payload.branding.phone ? `${payload.branding.phone} | ` : ""}
      ${payload.branding.email ? `${payload.branding.email} | ` : ""}
      ${payload.branding.website || ""}
      ${payload.branding.rocNumber ? `<br>ROC #${payload.branding.rocNumber}` : ""}
    </div>
  </div>

  <div class="certificate-title">Certificate of Completion</div>

  <div class="statement">
    This is to certify that <strong>${payload.branding.companyName}</strong> has completed 
    all restoration work at the property of <strong>${payload.claim.insured_name}</strong> 
    in accordance with the approved scope of work and industry standards.
  </div>

  <div class="job-meta">
    <p><strong>Property Owner:</strong> ${payload.claim.insured_name}</p>
    <p><strong>Property Address:</strong> ${payload.claim.propertyAddress}</p>
    <p><strong>Claim Number:</strong> ${payload.claim.claimNumber}</p>
    ${payload.job.jobNumber ? `<p><strong>Job Number:</strong> #${payload.job.jobNumber}</p>` : ""}
    ${payload.job.completionDate ? `<p><strong>Date of Completion:</strong> ${payload.job.completionDate}</p>` : ""}
  </div>

  <div class="statement" style="font-size: 16px; margin-top: 40px;">
    ${payload.job.descriptionOfWork}
  </div>

  <div class="statement" style="font-size: 16px; margin-top: 40px;">
    All work has been performed in a professional manner and complies with local building codes 
    and manufacturer specifications. This property is ready for final inspection and occupancy.
  </div>

  <div class="signature-section">
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-label">Contractor Signature</div>
      <div class="signature-label" style="margin-top: 5px;">${payload.branding.companyName}</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-label">Date</div>
    </div>
  </div>

  <div class="footer">
    ${payload.branding.companyName} | 
    ${payload.branding.phone || ""} | 
    ${payload.branding.email || ""}
    ${payload.branding.rocNumber ? ` | ROC #${payload.branding.rocNumber}` : ""}
  </div>
</body>
</html>
  `;

  // Generate PDF buffer with retry
  try {
    const buffer = await htmlToPdfBuffer(html, { retries: 2 });

    // Upload to storage with retry
    const timestamp = Date.now();
    const key = `reports/certificate/${payload.claim.claimNumber}-${timestamp}.pdf`;
    const url = await uploadReport({
      bucket: "reports",
      key,
      buffer,
      retries: 2,
    });

    return { url, storageKey: key };
  } catch (error) {
    console.error("[generateCertificatePDF] Failed:", error);
    throw new Error(
      `PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
