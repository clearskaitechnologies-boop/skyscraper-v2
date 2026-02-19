import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";
import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { htmlToPdfBuffer } from "@/lib/reports/pdf-utils";
import { depreciationExportPdfSchema, validateAIRequest } from "@/lib/validation/aiSchemas";

/**
 * POST /api/ai/depreciation/export-pdf
 * Generate branded depreciation report PDF with company branding and claim details
 */
async function POST_INNER(req: NextRequest, ctx: { userId: string; orgId: string | null }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    if (!orgId) {
      return NextResponse.json({ error: "Organization required." }, { status: 400 });
    }
    const body = await req.json();
    const validation = validateAIRequest(depreciationExportPdfSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }
    const { claimId, rcv, age, lifespan, depreciationType, acv, depreciation } = validation.data;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // Fetch claim and org for branding
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
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
    });

    // Get org branding (uses user's ownerId)
    const branding = await prisma.org_branding.findFirst({
      where: { orgId },
    });

    // Get basic org info
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        brandLogoUrl: true,
      },
    });

    if (!claim || !org) {
      return NextResponse.json({ error: "Claim or organization not found" }, { status: 404 });
    }

    // Combine org and branding data
    const orgData = {
      name: branding?.companyName || org.name,
      logo_url: branding?.logoUrl || org.brandLogoUrl,
      primary_color: branding?.colorPrimary || "#3b82f6",
      phone: branding?.phone || null,
      email: branding?.email || null,
      website: branding?.website || null,
      license_number: branding?.license || null,
    };

    // Build property address
    const propertyAddress = claim.properties
      ? `${claim.properties.street || ""}${claim.properties.city ? `, ${claim.properties.city}` : ""}${claim.properties.state ? ` ${claim.properties.state}` : ""} ${claim.properties.zipCode || ""}`.trim()
      : "N/A";

    const depreciationPercent = rcv > 0 ? ((depreciation || 0) / rcv) * 100 : 0;

    // Generate branded HTML
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
            border-bottom: 3px solid ${orgData.primary_color || "#3b82f6"}; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo { max-height: 60px; max-width: 200px; }
          .org-info { text-align: right; font-size: 12px; color: #6b7280; }
          h1 { 
            color: ${orgData.primary_color || "#1e3a8a"}; 
            font-size: 28px; 
            margin-bottom: 10px;
          }
          .meta { 
            background: #f9fafb; 
            padding: 20px; 
            border-left: 4px solid ${orgData.primary_color || "#3b82f6"}; 
            margin: 24px 0;
            font-size: 14px;
          }
          .meta strong { color: #374151; }
          .value-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
          }
          .value-card h2 {
            font-size: 18px;
            margin-bottom: 10px;
            opacity: 0.9;
          }
          .value-card .amount {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
          }
          .calculation-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .calc-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
          }
          .calc-box h3 {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .calc-box .value {
            font-size: 32px;
            font-weight: bold;
            color: ${orgData.primary_color || "#1e3a8a"};
          }
          .calc-box .label {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 5px;
          }
          .depreciation-bar {
            background: #e5e7eb;
            height: 40px;
            border-radius: 8px;
            overflow: hidden;
            margin: 30px 0;
            position: relative;
          }
          .depreciation-fill {
            background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
            height: 100%;
            width: ${depreciationPercent}%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          .methodology {
            background: #fef3c7;
            padding: 20px;
            border-left: 4px solid #f59e0b;
            margin: 30px 0;
            border-radius: 4px;
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
            background: #dbeafe;
            color: #1e40af;
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
            ${orgData.logo_url ? `<img src="${orgData.logo_url}" alt="${orgData.name}" class="logo" />` : `<h2 style="margin: 0;">${orgData.name}</h2>`}
          </div>
          <div class="org-info">
            ${orgData.phone ? `<div>📞 ${orgData.phone}</div>` : ""}
            ${orgData.email ? `<div>✉️ ${orgData.email}</div>` : ""}
            ${orgData.website ? `<div>🌐 ${orgData.website}</div>` : ""}
            ${orgData.license_number ? `<div>License: ${orgData.license_number}</div>` : ""}
          </div>
          </div>
        </div>

        <span class="type-badge">DEPRECIATION ANALYSIS</span>
        <h1>ACV vs RCV Calculation Report</h1>

        <div class="meta">
          <strong>Claim Number:</strong> ${claim.claimNumber || claimId}<br/>
          <strong>Property:</strong> ${propertyAddress}<br/>
          <strong>Homeowner:</strong> ${claim.insured_name || "N/A"}<br/>
          <strong>Date of Loss:</strong> ${claim.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : "N/A"}<br/>
          <strong>Generated:</strong> ${new Date().toLocaleString()}
        </div>

        <div class="calculation-grid">
          <div class="calc-box">
            <h3>Replacement Cost Value</h3>
            <div class="value">$${(rcv || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="label">Full replacement cost</div>
          </div>
          
          <div class="calc-box">
            <h3>Item Age / Lifespan</h3>
            <div class="value">${age || 0} / ${lifespan || 0}</div>
            <div class="label">Years (${lifespan ? ((age / lifespan) * 100).toFixed(1) : 0}% of life used)</div>
          </div>
        </div>

        <h2 style="margin: 40px 0 20px 0; color: #374151;">Depreciation Calculation</h2>
        
        <div class="depreciation-bar">
          <div class="depreciation-fill">
            ${depreciationPercent > 10 ? `${depreciationPercent.toFixed(1)}% Depreciation` : ""}
          </div>
        </div>

        <div class="calculation-grid">
          <div class="calc-box" style="background: #fee2e2; border-color: #fecaca;">
            <h3>Total Depreciation</h3>
            <div class="value" style="color: #dc2626;">-$${(depreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="label">${depreciationPercent.toFixed(1)}% of RCV</div>
          </div>
          
          <div class="calc-box" style="background: #d1fae5; border-color: #a7f3d0;">
            <h3>Actual Cash Value</h3>
            <div class="value" style="color: #059669;">$${(acv || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="label">Settlement amount</div>
          </div>
        </div>

        <div class="methodology">
          <h3 style="margin-bottom: 10px; color: #92400e;">Calculation Methodology</h3>
          <p style="font-size: 13px; line-height: 1.8; color: #78350f;">
            <strong>Method:</strong> ${depreciationType === "straight-line" ? "Straight-Line Depreciation" : "Custom Method"}<br/>
            <strong>Formula:</strong> ACV = RCV × (1 - (Age ÷ Lifespan))<br/>
            <strong>Calculation:</strong> $${(rcv || 0).toFixed(2)} × (1 - (${age || 0} ÷ ${lifespan || 1})) = $${(acv || 0).toFixed(2)}
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="margin-bottom: 10px; color: #374151;">Important Notes</h3>
          <ul style="font-size: 13px; color: #6b7280; line-height: 1.8; margin-left: 20px;">
            <li>This calculation is based on standard depreciation schedules</li>
            <li>Actual carrier depreciation may vary based on policy terms</li>
            <li>Recoverable depreciation may be available upon completion of repairs</li>
            <li>Consult policy documents for specific coverage details</li>
          </ul>
        </div>

        <div class="footer">
          Generated by ${orgData.name} using SkaiScraper AI • ${new Date().toLocaleDateString()}<br/>
          This analysis is for informational purposes only. Actual settlement amounts may vary.
        </div>
      </body>
      </html>
    `;

    // Generate PDF
    const pdfBuffer = await htmlToPdfBuffer(html, { format: "Letter" });

    // Return PDF as download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="depreciation-${claim.claimNumber || claimId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    logger.error("[Depreciation Export PDF Error]", error);
    return NextResponse.json({ error: error.message || "Failed to export PDF" }, { status: 500 });
  }
}

export const POST = withAiBilling(
  createAiConfig("depreciation_export", { costPerRequest: 15 }),
  POST_INNER
);
