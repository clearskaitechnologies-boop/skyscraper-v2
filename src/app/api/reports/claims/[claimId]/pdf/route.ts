import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import { getBrandingForOrg } from "@/lib/branding/fetchBranding";
import prisma from "@/lib/prisma";
import { buildClaimHtml } from "@/lib/reports/claims-html";
import { htmlToPdfBuffer } from "@/lib/reports/pdf-utils";
import { uploadClaimPdf, uploadClaimPdfAI } from "@/lib/storage/files";

/**
 * POST /api/reports/claims/[claimId]/pdf
 *
 * Generate PDF for insurance claims - supports TWO modes:
 *
 * MODE 1: Legacy ClaimMaterial system (empty body)
 * MODE 2: AI Claims Builder (body with lineItems)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { claimId: string } }
): Promise<NextResponse> {
  const { userId, orgId } = await auth();
  const devKeyHeader = request.headers.get("x-dev-pdf-key");
  const devKeyEnv = process.env.PDF_DEV_KEY;
  let effectiveUserId = userId;
  let effectiveOrgId: string | null | undefined = orgId;

  // Dev-only bypass (non-production) when Clerk auth unavailable
  if (
    !effectiveUserId &&
    devKeyEnv &&
    devKeyHeader === devKeyEnv &&
    process.env.NODE_ENV !== "production"
  ) {
    try {
      const fallbackUser = await prisma.users.findFirst({
        select: { clerkUserId: true, orgId: true },
      });
      if (fallbackUser) {
        effectiveUserId = fallbackUser.clerkUserId;
        effectiveOrgId = fallbackUser.orgId;
      }
    } catch (e) {
      console.warn("Dev bypass user lookup failed, proceeding with anonymous stub:", e);
      // Use deterministic stub values to allow PDF generation without DB
      effectiveUserId = "dev-bypass-user";
      effectiveOrgId = null;
    }
  }

  if (!effectiveUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claimId = params.claimId;

  try {
    const body = await request.json().catch(() => null);
    if (body && body.lineItems && body.lineItems.length > 0) {
      return await generateAIBuilderPDF(claimId, body, effectiveUserId, effectiveOrgId ?? null);
    }
    return await generateLegacyClaimPDF(claimId, effectiveUserId);
  } catch (error) {
    console.error("Claims PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function generateLegacyClaimPDF(claimId: string, userId: string): Promise<NextResponse> {
  let materials: any[] = [];
  try {
    // Use lowercase prisma model names
    materials = await (prisma as any).ClaimMaterial.findMany({
      where: { claimId },
      include: { VendorProduct: true, claims: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.warn("ClaimMaterial query failed (dev degraded mode)", e);
  }

  let orgName = "PreLoss Vision";
  let orgInternalId: string | null = null;
  try {
    const user = await prisma.users.findFirst({
      where: { clerkUserId: userId },
      select: { orgId: true },
    });
    if (user?.orgId) {
      orgInternalId = user.orgId;
      const org = await prisma.org.findUnique({
        where: { id: user.orgId },
        select: { name: true },
      });
      if (org?.name) orgName = org.name;
    }
  } catch (e) {
    console.warn("Org resolution failed (dev degraded mode)", e);
  }

  // 🔥 FETCH BRANDING FOR CLAIM PDF
  const branding = orgInternalId ? await getBrandingForOrg(orgInternalId) : null;

  // Use branding info in orgName if available
  if (branding?.companyName) {
    orgName = branding.companyName;
  }

  const html = await buildClaimHtml({
    claimId,
    materials: materials as any,
    orgName,
    generatedAt: new Date(),
  });

  const pdfBuffer = await htmlToPdfBuffer(html);
  const upload = await uploadClaimPdf(claimId, pdfBuffer);
  return NextResponse.json({
    url: upload.url,
    claimId,
    materialCount: materials.length,
    provider: upload.provider,
    path: upload.path,
  });
}

async function generateAIBuilderPDF(
  claimId: string,
  body: any,
  userId: string,
  orgId: string | null
): Promise<NextResponse> {
  const { lineItems, photos, propertyAddress, clientName, lossType } = body;

  // 🔥 FETCH BRANDING FOR AI BUILDER PDF
  let branding: Awaited<ReturnType<typeof getBrandingForOrg>> = null;
  let businessName = "SkaiScraper";
  if (orgId) {
    try {
      const org = await prisma.org.findUnique({
        where: { clerkOrgId: orgId },
        select: { id: true },
      });
      if (org) {
        branding = await getBrandingForOrg(org.id);
        businessName = branding?.companyName || "SkaiScraper";
      }
    } catch (e) {
      console.warn("Branding fetch failed", e);
    }
  }

  let pdfBuffer: Buffer;
  try {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    // 🔥 BRANDED HEADER
    if (branding?.logoUrl) {
      // Note: PDFKit logo rendering would require image loading - simplified for now
      doc
        .fontSize(16)
        .fillColor(branding.colorPrimary || "#0A1A2F")
        .text(businessName, { align: "center" });
    } else {
      doc.fontSize(16).text(businessName, { align: "center" });
    }
    doc
      .fontSize(10)
      .fillColor("#666")
      .text([branding?.phone, branding?.email].filter(Boolean).join(" | "), { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(24).fillColor("#000").text("Insurance Claim Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Claim ID: ${claimId}`, { align: "center" });
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      { align: "center" }
    );
    doc.moveDown();
    doc.strokeColor("#e2e8f0").lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);
    doc.fontSize(16).text("Property Information");
    doc.moveDown(0.5);
    doc.fontSize(11);
    if (clientName) doc.text(`Property Owner: ${clientName}`);
    if (propertyAddress) doc.text(`Address: ${propertyAddress}`);
    if (lossType) doc.text(`Loss Type: ${lossType}`);
    doc.moveDown();
    doc.fontSize(16).text("Line Items");
    doc.moveDown(0.5);
    doc.fontSize(10);
    lineItems.forEach((li: any, idx: number) => {
      doc.text(`${idx + 1}. ${li.description || li.name} - $${li.price || li.amount || 0}`);
    });
    if (Array.isArray(photos) && photos.length) {
      doc.addPage();
      doc.fontSize(16).text("Photos");
      doc.moveDown(0.5).fontSize(10).text(`Attached photo count: ${photos.length}`);
    }
    doc.end();
    pdfBuffer = Buffer.concat(chunks);
  } catch (e) {
    console.warn("PDFKit failed, falling back to HTML placeholder PDF", e);
    const fallbackHtml = `<html><body><h1>Claim ${claimId}</h1><p>PDF fallback generated.</p></body></html>`;
    pdfBuffer = await htmlToPdfBuffer(fallbackHtml);
  }

  const upload = await uploadClaimPdfAI(claimId, pdfBuffer);
  return NextResponse.json({
    url: upload.url,
    claimId,
    mode: "ai-builder",
    lineItemCount: lineItems.length,
    provider: upload.provider,
    path: upload.path,
  });
}
