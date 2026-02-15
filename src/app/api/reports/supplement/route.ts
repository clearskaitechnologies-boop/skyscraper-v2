// TODO: This route has 0 callers. The supplement sub-routes are used instead. Wire to UI or remove.
// src/app/api/reports/supplement/route.ts
/**
 * Supplement Builder API
 * Generates supplement packets with AI narratives and photo documentation
 */

import { NextRequest, NextResponse } from "next/server";

import { getOrgBranding } from "@/lib/branding/getOrgBranding";
import prisma from "@/lib/prisma";
import { htmlToPdfBuffer, uploadReport } from "@/lib/reports/pdf-utils";
import type { SupplementLine, SupplementReportPayload } from "@/lib/reports/types";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok") {
      return NextResponse.json({ error: "Organization context required" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, carrierScopeText, supplementNotes, selectedPhotoIds } = body;

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

    // 3. Parse carrier scope text into estimate lines
    const estimateLines: SupplementLine[] = carrierScopeText
      ? parseXactimateText(carrierScopeText)
      : [];

    // 4. Calculate RCV impact (optional)
    const supplementRcv = estimateLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const rcvImpact =
      supplementRcv > 0
        ? {
            baseRcv: claim.estimatedValue || 0,
            supplementRcv,
            newRcv: (claim.estimatedValue || 0) + supplementRcv,
          }
        : undefined;

    // 5. Build narrative (use provided or generate default)
    const narrative =
      supplementNotes || generateDefaultNarrative(estimateLines, claim.insured_name || "Insured");

    // 6. Load photos (if IDs provided)
    let photos: { url: string; caption: string }[] = [];
    if (selectedPhotoIds && selectedPhotoIds.length > 0) {
      const photoAssets = await prisma.file_assets.findMany({
        where: {
          id: { in: selectedPhotoIds },
          mimeType: { startsWith: "image/" },
        },
      });
      photos = photoAssets.map((p) => ({
        url: p.publicUrl,
        caption: p.note || p.filename || "Photo",
      }));
    }

    // 7. Build payload
    const propertyAddress = claim.properties
      ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
      : "Property Address";
    const payload: SupplementReportPayload = {
      branding: {
        companyName: branding.companyName,
        addressLine: branding.addressLine,
        phone: branding.phone,
        email: branding.email,
        website: branding.website,
        rocNumber: branding.rocNumber,
        logoUrl: branding.logoUrl,
        colorPrimary: branding.colorPrimary,
        colorAccent: branding.colorAccent,
      },
      claim: {
        insured_name: claim.insured_name || "Insured",
        claimNumber: claim.claimNumber,
        propertyAddress,
        carrierName: claim.carrier || undefined,
        stormDate: claim.dateOfLoss?.toISOString(),
      },
      estimateLines,
      rcvImpact,
      narrative,
      photos: photos || [],
    };

    // 8. Generate PDF
    const { url: pdfUrl, storageKey } = await generateSupplementPDF(payload);

    // 9. Create database record using ai_reports table (appropriate for claim documents)
    const document = await prisma.ai_reports.create({
      data: {
        id: crypto.randomUUID(),
        claimId,
        orgId,
        type: "supplement",
        title: `Supplement Request - ${claim.claimNumber}`,
        content: pdfUrl,
        status: "generated",
        tokensUsed: 0,
        userId: ctx.userId || "system",
        userName: "System",
        attachments: {
          storageKey,
          description: supplementNotes || narrative.slice(0, 200),
          mimeType: "application/pdf",
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      url: pdfUrl,
      type: "supplement",
    });
  } catch (error: any) {
    console.error("[POST /api/reports/supplement] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate supplement report" },
      { status: 500 }
    );
  }
}

/**
 * Parse Xactimate-style text into estimate lines
 * Example input: "RFG - Remove Felt & Gravel | 45 SQ @ $2.50 = $112.50"
 */
function parseXactimateText(text: string): SupplementLine[] {
  const lines: SupplementLine[] = [];

  const rows = text.split("\n").filter((r) => r.trim());

  for (const row of rows) {
    // Simplified parser: extract description, qty, rate, total
    // Format: "CODE - Description | QTY UNIT @ $RATE = $TOTAL"
    const match = row.match(
      /^([\w\s-]+)\s*\|\s*(\d+\.?\d*)\s+(\w+)\s*@\s*\$(\d+\.?\d*)\s*=\s*\$(\d+\.?\d*)$/
    );

    if (match) {
      const [, description, qty, unit, rate, total] = match;
      lines.push({
        description: description.trim(),
        qty: parseFloat(qty),
        unit: unit.toUpperCase(),
        unitRate: parseFloat(rate),
        lineTotal: parseFloat(total),
      });
    } else {
      // Fallback: use whole line as description
      lines.push({
        description: row.trim(),
        qty: 1,
        unit: "EA",
        unitRate: 0,
        lineTotal: 0,
      });
    }
  }

  return lines;
}

/**
 * Generate default narrative if none provided
 */
function generateDefaultNarrative(lines: SupplementLine[], insured_name: string): string {
  if (lines.length === 0) {
    return `During restoration work at ${insured_name}'s property, additional items were discovered that were not included in the original scope. These items are necessary to complete the project per code and manufacturer specifications.`;
  }

  const itemCount = lines.length;
  const firstItem = lines[0].description;

  return `During the course of restoration work at ${insured_name}'s property, our team identified ${itemCount} additional scope item(s) that were not captured in the original estimate. These items include ${firstItem.toLowerCase()} and other related work necessary to complete the project to code and manufacturer specifications. All work has been documented with photos and detailed line items below.`;
}

/**
 * Generate PDF from payload and upload to storage
 */
async function generateSupplementPDF(
  payload: SupplementReportPayload
): Promise<{ url: string; storageKey: string }> {
  // Generate styled HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      padding: 60px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid ${payload.branding.colorPrimary};
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: ${payload.branding.colorPrimary};
      margin-bottom: 8px;
    }
    .company-info {
      font-size: 12px;
      color: #666;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
      color: ${payload.branding.colorPrimary};
    }
    h2 {
      font-size: 18px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #333;
    }
    .claim-summary {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .claim-summary p {
      margin: 8px 0;
    }
    .narrative {
      background: #fffbf0;
      padding: 20px;
      border-left: 4px solid ${payload.branding.colorAccent};
      margin: 30px 0;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    th {
      background: ${payload.branding.colorPrimary};
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #ddd;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    tfoot tr {
      font-weight: 700;
      font-size: 15px;
      background: #f0f0f0;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .photo-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .photo-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .photo-caption {
      padding: 12px;
      font-size: 12px;
      background: #f9f9f9;
      color: #333;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${payload.branding.companyName}</div>
    <div class="company-info">
      ${payload.branding.phone ? `Phone: ${payload.branding.phone} | ` : ""}
      ${payload.branding.email ? `Email: ${payload.branding.email} | ` : ""}
      ${payload.branding.website || ""}
    </div>
  </div>

  <h1>Supplement Request</h1>
  
  <div class="claim-summary">
    <p><strong>Insured:</strong> ${payload.claim.insured_name}</p>
    <p><strong>Claim Number:</strong> ${payload.claim.claimNumber}</p>
    <p><strong>Property Address:</strong> ${payload.claim.propertyAddress}</p>
    ${payload.claim.carrierName ? `<p><strong>Carrier:</strong> ${payload.claim.carrierName}</p>` : ""}
    ${payload.claim.stormDate ? `<p><strong>Date of Loss:</strong> ${new Date(payload.claim.stormDate).toLocaleDateString()}</p>` : ""}
  </div>

  <div class="narrative">
    <h2 style="margin-top: 0;">Supplement Narrative</h2>
    <p>${payload.narrative}</p>
  </div>

  <h2>Additional Items</h2>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-center">Qty</th>
        <th class="text-center">Unit</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${payload.estimateLines
        .map(
          (line) => `
        <tr>
          <td>${line.code ? `<strong>${line.code}</strong> - ` : ""}${line.description}</td>
          <td class="text-center">${line.qty.toFixed(2)}</td>
          <td class="text-center">${line.unit}</td>
          <td class="text-right">$${line.unitRate.toFixed(2)}</td>
          <td class="text-right">$${line.lineTotal.toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4"><strong>SUPPLEMENT TOTAL</strong></td>
        <td class="text-right"><strong>$${(payload.rcvImpact?.supplementRcv || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
      </tr>
      ${
        payload.rcvImpact
          ? `
      <tr>
        <td colspan="4"><em>Original RCV: $${payload.rcvImpact.baseRcv.toLocaleString("en-US", { minimumFractionDigits: 2 })} + Supplement: $${payload.rcvImpact.supplementRcv.toLocaleString("en-US", { minimumFractionDigits: 2 })}</em></td>
        <td class="text-right"><strong>NEW RCV: $${payload.rcvImpact.newRcv.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
      </tr>
      `
          : ""
      }
    </tfoot>
  </table>

  ${
    payload.photos.length > 0
      ? `
    <h2>Photo Documentation</h2>
    <div class="photo-grid">
      ${payload.photos
        .map(
          (photo) => `
        <div class="photo-item">
          <img src="${photo.url}" alt="Supplement photo" />
          <div class="photo-caption">${photo.caption}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `
      : ""
  }

  <div class="footer">
    ${payload.branding.rocNumber ? `ROC #${payload.branding.rocNumber} | ` : ""}
    ${payload.branding.companyName} | 
    ${payload.branding.phone || ""} | 
    ${payload.branding.email || ""}
  </div>
</body>
</html>
  `;

  // Generate PDF buffer using Puppeteer with retry
  try {
    const buffer = await htmlToPdfBuffer(html, { retries: 2 });

    // Upload to storage with retry
    const timestamp = Date.now();
    const key = `reports/supplement/${payload.claim.claimNumber}-${timestamp}.pdf`;
    const url = await uploadReport({
      bucket: "reports",
      key,
      buffer,
      retries: 2,
    });

    return { url, storageKey: key };
  } catch (error) {
    console.error("[generateSupplementPDF] Failed:", error);
    throw new Error(
      `PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
