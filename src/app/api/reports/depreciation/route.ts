// src/app/api/reports/depreciation/route.ts
/**
 * Depreciation Builder API
 * Generates RCV release package: invoice, lien waiver, certificate, buyer letter
 */

import { NextRequest, NextResponse } from "next/server";

import { getOrgBranding } from "@/lib/branding/getOrgBranding";
import prisma from "@/lib/prisma";
import { generateDepreciationPDF } from "@/lib/reports/generators";
import type { DepreciationReportPayload } from "@/lib/reports/types";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok") {
      return NextResponse.json({ error: "Organization context required" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, notesToCarrier, includeBuyerLetter, includePhotos } = body;

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

    // 3. Load job (if exists)
    const job = await prisma.jobs.findFirst({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    });

    // 4. Calculate supplements total from actual supplements
    const supplements = await prisma.supplements.findMany({
      where: { claim_id: claimId },
      select: { total: true },
    });
    const supplementsTotal = supplements.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

    // 5. Build financials (using claim fields + supplements)
    const rcvTotal = claim.estimatedValue || 0;
    const deductible = claim.deductible || 0;
    const acvPaid = rcvTotal - deductible; // Simplified
    const depreciation = deductible; // Simplified for now
    const totalDue = depreciation + supplementsTotal;

    // 6. Load completion photos if requested
    let photos: { url: string; caption: string }[] = [];
    if (includePhotos) {
      const photoAssets = await prisma.file_assets.findMany({
        where: {
          claimId,
          mimeType: { startsWith: "image/" },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      photos = photoAssets.map((p) => ({
        url: p.publicUrl,
        caption: p.note || p.filename || "Completion photo",
      }));
    }

    // 7. Build payload
    const propertyAddress = claim.properties
      ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
      : "Property Address";
    const payload: DepreciationReportPayload = {
      branding: {
        companyName: branding.companyName,
        logoUrl: branding.logoUrl || undefined,
        colorPrimary: branding.colorPrimary,
        colorAccent: branding.colorAccent,
        phone: branding.phone,
        website: branding.website,
      },
      claim: {
        insured_name: claim.insured_name || "Insured",
        claimNumber: claim.claimNumber,
        propertyAddress,
        carrierName: claim.carrier || undefined,
        stormDate: claim.dateOfLoss?.toISOString(),
      },
      job: {
        jobNumber: job?.id?.slice(0, 8),
        completionDate: job?.actualEnd?.toISOString().split("T")[0],
        descriptionOfWork: job?.description || "Restoration work completed per scope of loss.",
      },
      financials: {
        rcvTotal,
        acvPaid,
        deductible,
        depreciation,
        supplementsTotal,
        totalDue,
      },
      notesToCarrier,
      includeBuyerLetter: includeBuyerLetter || false,
      includePhotos: includePhotos || false,
      photos,
    };

    // 8. Generate PDF
    const { url: pdfUrl, storageKey } = await generateDepreciationPDF(payload);

    // 9. Create database record
    const document = await prisma.completion_documents.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: claimId,
        org_id: orgId,
        type: "DEPRECIATION",
        url: pdfUrl,
        file_name: `Depreciation Package - ${claim.claimNumber}.pdf`,
        uploaded_by: ctx.userId || undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      url: pdfUrl,
      type: "depreciation",
    });
  } catch (error: any) {
    console.error("[POST /api/reports/depreciation] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate depreciation report" },
      { status: 500 }
    );
  }
}
