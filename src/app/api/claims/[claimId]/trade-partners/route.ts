import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

const assignTradeSchema = z.object({
  tradePartnerId: z.string(),
  role: z.string().optional().default("Contractor"),
});

// GET /api/claims/[claimId]/trade-partners — List available trade partners
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    const { claimId } = params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // Fetch available trade partners (active trades companies)
    const tradePartners = await prisma.tradesCompany.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        licenseNumber: true,
        phone: true,
        email: true,
        specialties: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      assignments: tradePartners.map((tp) => ({
        id: tp.id,
        role: "Contractor",
        addedAt: new Date().toISOString(),
        tradePartner: {
          id: tp.id,
          businessName: tp.name,
          licenseNumber: tp.licenseNumber,
          phone: tp.phone,
          email: tp.email,
          specialties: tp.specialties,
        },
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch trade partners";
    console.error("[GET /api/claims/:claimId/trade-partners] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/claims/[claimId]/trade-partners — Assign trade to claim
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return NextResponse.json({ error: "Organization context required" }, { status: 401 });
    }

    const { claimId } = params;
    const body = await req.json();
    const validated = assignTradeSchema.parse(body);

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId: ctx.orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify trade partner exists
    const tradePartner = await prisma.tradesCompany.findFirst({
      where: { id: validated.tradePartnerId, isActive: true },
    });

    if (!tradePartner) {
      return NextResponse.json({ error: "Trade partner not found" }, { status: 404 });
    }

    // Note: ClaimTradePartner model doesn't exist yet
    // For now, return success with the trade partner info
    // TODO: Create a ClaimTradePartner model or use ClientProConnection
    return NextResponse.json({
      ok: true,
      assignment: {
        id: `${claimId}-${validated.tradePartnerId}`,
        role: validated.role,
        addedAt: new Date().toISOString(),
        tradePartner: {
          id: tradePartner.id,
          businessName: tradePartner.name,
          licenseNumber: tradePartner.licenseNumber,
          phone: tradePartner.phone,
          email: tradePartner.email,
          specialties: tradePartner.specialties,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[POST /api/claims/:claimId/trade-partners] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to assign trade partner";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
