import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const createSupplementSchema = z.object({
  totalCents: z.number().int().min(0),
  status: z.enum(["REQUESTED", "APPROVED", "DENIED", "DISPUTED"]).default("REQUESTED"),
  data: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/claims/[id]/supplements - Add supplement request to claim
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createSupplementSchema.parse(body);

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: params.claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Create supplement
    const supplement = await prisma.claim_supplements.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: params.claimId,
        total_cents: validated.totalCents,
        status: validated.status,
        data: validated.data || {},
        updated_at: new Date(),
      },
    });

    // Log activity
    await prisma.claim_activities.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: params.claimId,
        user_id: userId,
        type: "SUPPLEMENT",
        message:
          validated.notes ||
          `Supplement ${validated.status} for $${(validated.totalCents / 100).toFixed(2)}`,
        metadata: {
          supplementId: supplement.id,
          totalCents: validated.totalCents,
          status: validated.status,
        },
      },
    });

    // Update claim exposure
    const supplements = await prisma.claim_supplements.findMany({
      where: {
        claim_id: params.claimId,
        status: { in: ["APPROVED", "REQUESTED"] },
      },
    });

    const supplementTotal = supplements.reduce(
      (sum: number, s: any) => sum + (s.totalCents || 0),
      0
    );

    await prisma.claims.update({
      where: { id: params.claimId },
      data: { exposure_cents: supplementTotal },
    });

    return NextResponse.json(
      { supplement },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    logger.error(`[POST /api/claims/${params.claimId}/supplements] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to create supplement" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claims/[id]/supplements - List all supplements for claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: params.claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const supplements = await prisma.claim_supplements.findMany({
      where: { claim_id: params.claimId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ supplements }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    logger.error(`[GET /api/claims/${params.claimId}/supplements] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch supplements" },
      { status: 500 }
    );
  }
}
