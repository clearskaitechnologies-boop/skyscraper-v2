/**
 * Final Payout Generate Packet API
 * Generates the complete final payout PDF packet
 * Includes invoice, lien waiver, completion certificate, and photos
 */

import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { getOrgBranding } from "@/lib/branding/getOrgBranding";
import prisma from "@/lib/prisma";
import { generateDepreciationPDF } from "@/lib/reports/generators";
import type { DepreciationReportPayload } from "@/lib/reports/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/claims/[claimId]/final-payout/generate-packet
 * Generate the final payout PDF packet
 */
export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    const { claimId } = params;
    const body = await request.json();
    const {
      notesToCarrier,
      includePhotos = true,
      includeLienWaiver = true,
      includeCompletionCert = true,
      lineItems, // Optional override of line items
    } = body;

    // Get claim with all related data
    const claim = await prisma.claims.findUnique({
      where: { id: claimId, orgId },
      include: {
        properties: true,
        depreciation_items: true,
        supplements: {
          where: { status: "approved" },
        },
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get branding
    const branding = await getOrgBranding(orgId);

    // Get job info
    const job = claim.jobs[0];

    // Calculate financials
    let depreciationItems = claim.depreciation_items;

    // Use provided line items if available
    if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
      // Filter to only completed and recoverable items
      const recoverableItems = lineItems.filter((item: any) => item.completed && item.recoverable);

      depreciationItems = recoverableItems.map((item: any) => ({
        id: item.id,
        label: item.description,
        rcv: item.rcv,
        acv: item.acv,
        age: item.age || 0,
        expectedLife: item.expectedLife || 20,
      })) as any;
    }

    const rcvTotal = depreciationItems.reduce((sum, item) => sum + item.rcv, 0);
    const acvTotal = depreciationItems.reduce((sum, item) => sum + item.acv, 0);
    const totalDepreciation = rcvTotal - acvTotal;

    const supplementsTotal = claim.supplements.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

    const deductible = claim.deductible || 1000;
    const acvPaid = claim.approvedValue
      ? claim.approvedValue - totalDepreciation
      : (claim.estimatedValue || 0) - deductible;
    const totalDue = totalDepreciation + supplementsTotal;

    // Photos are not directly on claims - they're linked via projects/documents
    // For now, we skip photo inclusion as they need to be fetched separately
    const photos: Array<{ url: string; caption: string }> = [];

    // Build PDF payload with correct types
    const payload: DepreciationReportPayload = {
      branding: branding
        ? {
            companyName: branding.companyName,
            logoUrl: branding.logoUrl || undefined,
            colorPrimary: branding.colorPrimary,
            colorAccent: branding.colorAccent,
            license: branding.rocNumber || undefined,
            phone: branding.phone,
            website: branding.website,
          }
        : undefined,
      claim: {
        claimNumber: claim.claimNumber,
        insured_name: claim.insured_name || "Property Owner",
        propertyAddress:
          [
            claim.properties?.street,
            claim.properties?.city,
            claim.properties?.state,
            claim.properties?.zipCode,
          ]
            .filter(Boolean)
            .join(", ") || "Property Address",
        carrierName: claim.carrier || undefined,
        stormDate: claim.dateOfLoss?.toISOString(),
      },
      job: {
        jobNumber: job?.id?.slice(0, 8) || "N/A",
        completionDate:
          job?.actualEnd?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        descriptionOfWork:
          job?.description || "Restoration work completed per approved scope of loss.",
      },
      financials: {
        rcvTotal,
        acvPaid,
        deductible,
        depreciation: totalDepreciation,
        supplementsTotal,
        totalDue,
      },
      notesToCarrier: notesToCarrier || undefined,
      includeBuyerLetter: true,
      includePhotos,
      photos,
    };

    // Generate PDF
    const { url: pdfUrl, storageKey } = await generateDepreciationPDF(payload);

    // Create report record to track the generated PDF
    const report = await prisma.reports.create({
      data: {
        id: `rpt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        orgId,
        claimId,
        type: "FINAL_PAYOUT_PACKET",
        title: `Final Payout Package - ${claim.claimNumber}`,
        subtitle: `Complete final payout package including invoice, lien waiver, completion certificate`,
        pdfUrl,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        meta: {
          storageKey,
          includePhotos,
          includeLienWaiver,
          includeCompletionCert,
          financials: {
            rcvTotal,
            acvPaid,
            totalDepreciation,
            supplementsTotal,
            totalDue,
          },
        },
      },
    });

    // Update depreciation tracker
    await prisma.depreciation_trackers.upsert({
      where: { claim_id: claimId },
      create: {
        id: `dep_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        claim_id: claimId,
        org_id: orgId,
        total_depreciation: totalDepreciation,
        status: "PENDING",
        timeline: [
          {
            type: "packet_generated",
            timestamp: new Date().toISOString(),
            userId,
            reportId: report.id,
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: {
        total_depreciation: totalDepreciation,
        updated_at: new Date(),
      },
    });

    // Create activity record
    await prisma.activities.create({
      data: {
        id: `act_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        orgId,
        claimId,
        type: "FINAL_PACKET_GENERATED",
        title: "Final Payout Packet Generated",
        description: `Generated final payout package. Total due: $${totalDue.toLocaleString()}`,
        userId,
        userName: "System",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      url: pdfUrl,
      financials: {
        rcvTotal,
        acvPaid,
        totalDepreciation,
        supplementsTotal,
        totalDue,
      },
      lineItemCount: depreciationItems.length,
      photoCount: photos.length,
    });
  } catch (error: any) {
    console.error("[POST /api/claims/[claimId]/final-payout/generate-packet] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate final payout packet" },
      { status: 500 }
    );
  }
}
