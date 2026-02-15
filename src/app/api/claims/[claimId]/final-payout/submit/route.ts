/**
 * Final Payout Submit API
 * Submits the final payout package to the insurance carrier
 * Sends email notification and updates status
 */

import { NextRequest, NextResponse } from "next/server";

import { getOrgBranding } from "@/lib/branding/getOrgBranding";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/claims/[claimId]/final-payout/submit
 * Submit final payout package to carrier
 */
export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const ctx = await getActiveOrgContext();
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;
    const body = await request.json();
    const {
      certificationSigned,
      signatureData,
      signedBy,
      signedAt,
      notesToCarrier,
      sendEmail = true,
    } = body;

    if (!certificationSigned) {
      return NextResponse.json(
        { error: "Certification must be signed before submission" },
        { status: 400 }
      );
    }

    // Get claim with all needed data
    const claim = await prisma.claims.findUnique({
      where: { id: claimId, orgId: ctx.orgId },
      include: {
        properties: true,
        depreciation_items: true,
        supplements: {
          where: { status: "approved" },
        },
        reports: {
          where: { type: { in: ["FINAL_PAYOUT_PACKET", "DEPRECIATION"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
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

    // Calculate amounts
    const totalDepreciation = claim.depreciation_items.reduce(
      (sum, item) => sum + (item.rcv - item.acv),
      0
    );
    const supplementsTotal = claim.supplements.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalDue = totalDepreciation + supplementsTotal;

    // Get branding for email
    const branding = await getOrgBranding(ctx.orgId);

    // Update or create depreciation tracker
    const tracker = await prisma.depreciation_trackers.upsert({
      where: { claim_id: claimId },
      create: {
        id: `dep_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        claim_id: claimId,
        org_id: ctx.orgId,
        total_depreciation: totalDepreciation,
        requested_amount: totalDue,
        status: "REQUESTED",
        requested_at: new Date(),
        timeline: [
          {
            type: "submitted",
            timestamp: new Date().toISOString(),
            userId: ctx.userId,
            signedBy,
            notes: notesToCarrier || "Final payout package submitted to carrier",
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: {
        status: "REQUESTED",
        requested_amount: totalDue,
        requested_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Add submission event to timeline
    const currentTimeline = (tracker.timeline as any[]) || [];
    await prisma.depreciation_trackers.update({
      where: { id: tracker.id },
      data: {
        timeline: [
          ...currentTimeline,
          {
            type: "submitted",
            timestamp: new Date().toISOString(),
            userId: ctx.userId,
            signedBy,
            totalDue,
            notesToCarrier,
          },
        ],
        emails_sent: tracker.emails_sent + 1,
        last_email_sent_at: new Date(),
      },
    });

    // Create submission record in depreciation_packages
    const packageId = `pkg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const completionDate = claim.jobs[0]?.actualEnd || new Date();

    await prisma.depreciation_packages.create({
      data: {
        id: packageId,
        claim_id: claimId,
        org_id: ctx.orgId,
        invoice: {
          claimNumber: claim.claimNumber,
          carrier: claim.carrier,
          insured_name: claim.insured_name,
          propertyAddress: claim.properties?.street,
          totalDepreciation,
          supplementsTotal,
          totalDue,
          generatedAt: new Date().toISOString(),
        },
        contractor_statement: {
          signedBy,
          signedAt: signedAt || new Date().toISOString(),
          certificationText:
            "I certify that all work has been completed in accordance with the approved scope of work.",
          signatureData: signatureData || null,
        },
        homeowner_acceptance: {
          status: "pending",
        },
        total_depreciation_owed: totalDepreciation,
        payments_received: 0,
        final_invoice_total: totalDue,
        supplement_amount: supplementsTotal > 0 ? supplementsTotal : null,
        status: "SUBMITTED",
        sent_at: new Date(),
        sent_to: claim.adjusterEmail ? [claim.adjusterEmail] : [],
        generated_by: ctx.userId || "system",
        created_at: new Date(),
        updated_at: new Date(),
        notes: notesToCarrier,
      },
    });

    // Send email to adjuster if requested and we have an email
    let emailSent = false;
    if (sendEmail && claim.adjusterEmail) {
      try {
        // Create a notification record for email tracking
        await prisma.projectNotification.create({
          data: {
            id: `notif_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
            claimId,
            orgId: ctx.orgId,
            notificationType: "FINAL_PAYOUT_SUBMITTED",
            title: `Final Payout Package - ${claim.claimNumber}`,
            message: `A final payout package for claim ${claim.claimNumber} has been submitted. Total due: $${totalDue.toLocaleString()}`,
            metadata: {
              recipientEmail: claim.adjusterEmail,
              totalDue,
            },
          },
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Failed to queue email notification:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    // Update claim status if needed
    if (claim.status !== "pending_payment" && claim.status !== "closed") {
      await prisma.claims.update({
        where: { id: claimId },
        data: {
          status: "pending_payment",
          lifecycle_stage: "DEPRECIATION",
          updatedAt: new Date(),
        },
      });
    }

    // Create activity record
    await prisma.activities.create({
      data: {
        id: `act_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        orgId: ctx.orgId,
        claimId,
        type: "FINAL_PAYOUT_SUBMITTED",
        title: "Final Payout Package Submitted",
        description: `Submitted final payout package to carrier. Total due: $${totalDue.toLocaleString()}`,
        userId: ctx.userId,
        userName: "System",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Final payout package submitted successfully",
      data: {
        packageId,
        trackerId: tracker.id,
        status: "REQUESTED",
        totalDue,
        submittedAt: new Date().toISOString(),
        emailSent,
        recipientEmail: claim.adjusterEmail,
      },
    });
  } catch (error) {
    console.error("[POST /api/claims/[claimId]/final-payout/submit] Error:", error);
    return NextResponse.json({ error: "Failed to submit final payout package" }, { status: 500 });
  }
}
