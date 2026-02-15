/**
 * POST /api/claims/[id]/dol
 *
 * Update claim Date of Loss
 * Can be triggered from weather report selection
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const UpdateDolSchema = z.object({
  dol: z.string(), // ISO date
  source: z.enum(["weather_report", "manual", "adjuster", "other"]).default("manual"),
  weatherReportId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = UpdateDolSchema.parse(body);

    // Verify claim exists and belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: params.claimId,
        orgId,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Update DOL
    const updatedClaim = await prisma.claims.update({
      where: { id: params.claimId },
      data: {
        dateOfLoss: new Date(validated.dol),
      },
    });

    // Log activity
    try {
      await prisma.claim_activities.create({
        data: {
          id: crypto.randomUUID(),
          claim_id: claim.id,
          user_id: userId,
          type: "STATUS_CHANGE",
          message: `Date of Loss updated to ${validated.dol} (source: ${validated.source})${validated.weatherReportId ? ` - Weather Report ID: ${validated.weatherReportId}` : ""}`,
          metadata: {
            previousDol: claim.dateOfLoss,
            newDol: validated.dol,
            source: validated.source,
            weatherReportId: validated.weatherReportId,
          },
        },
      });
    } catch (activityError) {
      console.warn("[POST /api/claims/[id]/dol] Failed to log activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
    });
  } catch (error: any) {
    console.error(`[POST /api/claims/${params.claimId}/dol] Error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || "Failed to update DOL" }, { status: 500 });
  }
}
