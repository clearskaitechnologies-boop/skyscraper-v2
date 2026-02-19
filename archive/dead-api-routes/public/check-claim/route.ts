/**
 * Auth-free claim check endpoint
 * GET /api/public/check-claim?claimId=demo-claim-john-smith-xxx&orgId=xxx
 */
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const claimId = req.nextUrl.searchParams.get("claimId");
  const orgId = req.nextUrl.searchParams.get("orgId");

  if (!claimId) {
    return NextResponse.json({
      ok: false,
      error: "Missing claimId query param",
      usage: "/api/public/check-claim?claimId=xxx&orgId=xxx",
    });
  }

  try {
    // Check by exact ID
    const claimById = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, claimNumber: true, orgId: true, title: true, status: true },
    });

    // Check by claimNumber
    const claimByNumber = await prisma.claims.findFirst({
      where: { claimNumber: claimId },
      select: { id: true, claimNumber: true, orgId: true, title: true, status: true },
    });

    // If orgId provided, check all claims for that org
    let orgClaims: any[] = [];
    let orgExists = false;
    if (orgId) {
      orgExists = !!(await prisma.org.findUnique({ where: { id: orgId } }));
      orgClaims = await prisma.claims.findMany({
        where: { orgId },
        select: { id: true, claimNumber: true, title: true },
        take: 10,
      });
    }

    // Also list all demo claims in DB
    const demoClaims = await prisma.claims.findMany({
      where: { id: { startsWith: "demo-claim-" } },
      select: { id: true, claimNumber: true, orgId: true },
      take: 20,
    });

    return NextResponse.json({
      ok: true,
      query: { claimId, orgId },
      foundById: claimById ?? null,
      foundByNumber: claimByNumber ?? null,
      orgExists,
      orgClaimsCount: orgClaims.length,
      orgClaims,
      demoClaims,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
