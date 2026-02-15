// src/app/api/claims/[claimId]/artifacts/[artifactId]/export-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { htmlToPdfBuffer, uploadReport } from "@/lib/reports/pdf-utils";

/**
 * POST /api/claims/[claimId]/artifacts/[artifactId]/export-pdf
 * Exports an artifact (ai_reports record) as a PDF
 * NOW WITH FULL PDF GENERATION + BRANDING INJECTION
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string; artifactId: string }> }
) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, orgId } = authResult;
    const resolvedParams = await params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(resolvedParams.claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    // Fetch artifact (stored as ai_reports record)
    const artifact = await prisma.ai_reports.findFirst({
      where: {
        id: resolvedParams.artifactId,
        claimId: resolvedParams.claimId,
        orgId: orgId ?? undefined,
      },
    });

    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found or access denied" }, { status: 404 });
    }

    // Fetch claim with property relation and org for branding
    const [claim, org] = await Promise.all([
      prisma.claims.findUnique({
        where: { id: resolvedParams.claimId },
        include: {
          properties: {
            select: {
              street: true,
              city: true,
              state: true,
              zipCode: true,
            },
          },
        },
      }),
      prisma.org.findUnique({
        where: { id: orgId! },
        select: {
          name: true,
          brandLogoUrl: true,
          pdfHeaderText: true,
          pdfFooterText: true,
        },
      }),
    ]);

    // Get artifact content
    const content = artifact.content || "";

    const orgName = org?.name || "SkaiScraper";
    const orgLogoUrl: string | null = org?.brandLogoUrl ?? null;
    const orgHeaderText: string | null = org?.pdfHeaderText ?? null;
    const orgFooterText: string | null = org?.pdfFooterText ?? null;

    // Build property address from individual fields
    const property = claim?.properties;
    const propertyAddress = property
      ? `${property.street}, ${property.city}, ${property.state} ${property.zipCode}`
      : "N/A";
    const homeownerName = claim?.insured_name || "N/A";
    const dateOfLoss = claim?.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : "N/A";

    // Generate branded HTML with org colors and logo
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            padding: 60px; 
            line-height: 1.6; 
            color: #1f2937;
          }
          .header { 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo { max-height: 60px; max-width: 200px; }
          .org-info { text-align: right; font-size: 12px; color: #6b7280; }
          h1 { 
            color: #1e3a8a; 
            font-size: 28px; 
            margin-bottom: 10px;
          }
          .meta { 
            background: #f9fafb; 
            padding: 20px; 
            border-left: 4px solid #3b82f6; 
            margin: 24px 0;
            font-size: 14px;
          }
          .meta strong { color: #374151; }
          .content { 
            white-space: pre-wrap; 
            font-size: 14px; 
            line-height: 1.8; 
            margin-top: 30px;
          }
          .footer { 
            margin-top: 60px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 11px; 
            color: #9ca3af; 
            text-align: center;
          }
          .type-badge {
            display: inline-block;
            background: #ede9fe;
            color: #6b21a8;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${orgLogoUrl ? `<img src="${orgLogoUrl}" alt="${orgName}" class="logo" />` : `<h2 style="margin: 0;">${orgName}</h2>`}
            ${orgHeaderText ? `<div style="margin-top: 6px; font-size: 12px; color: #6b7280;">${orgHeaderText}</div>` : ""}
          </div>
          <div class="org-info">
            ${claim?.claimNumber ? `<div>Claim: ${claim.claimNumber}</div>` : ""}
          </div>
        </div>

        <span class="type-badge">${artifact.type.replace(/_/g, " ")}</span>
        <h1>${artifact.title}</h1>

        <div class="meta">
          <strong>Property:</strong> ${propertyAddress}<br/>
          <strong>Homeowner:</strong> ${homeownerName}<br/>
          <strong>Date of Loss:</strong> ${dateOfLoss}<br/>
          <strong>Generated:</strong> ${new Date(artifact.createdAt).toLocaleString()}<br/>
          <strong>Status:</strong> ${artifact.status || "generated"}
        </div>

        <div class="content">${content}</div>

        <div class="footer">
          ${orgFooterText ? orgFooterText : `Generated by ${orgName} using SkaiScraper AI • ${new Date().toLocaleDateString()}`}
        </div>
      </body>
      </html>
    `;

    // Generate PDF using existing htmlToPdfBuffer utility
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await htmlToPdfBuffer(html, { format: "Letter" });
    } catch (pdfError) {
      console.error("[Export PDF] PDF generation failed", pdfError);
      return NextResponse.json(
        { success: false, error: "Failed to generate PDF" },
        { status: 200 }
      );
    }

    // Upload PDF to storage
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${artifact.type.toLowerCase()}-${timestamp}.pdf`;

    const storageKey = `reports/artifacts/${resolvedParams.claimId}/${filename}`;
    let publicUrl: string;
    try {
      publicUrl = await uploadReport({
        bucket: "reports",
        key: storageKey,
        buffer: pdfBuffer,
        retries: 2,
      });
    } catch (uploadError) {
      console.error("[Export PDF] Upload failed", uploadError);
      return NextResponse.json({ success: false, error: "Failed to upload PDF" }, { status: 200 });
    }

    // Update artifact status to exported and store the PDF URL in attachments
    await prisma.ai_reports.update({
      where: { id: resolvedParams.artifactId },
      data: {
        status: "exported",
        attachments: {
          pdfUrl: publicUrl,
          exportedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      artifactId: resolvedParams.artifactId,
      filename,
      url: publicUrl,
      message: "PDF generated and exported successfully",
    });
  } catch (error: any) {
    console.error("[Export PDF Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to export PDF" },
      { status: 200 }
    );
  }
}
