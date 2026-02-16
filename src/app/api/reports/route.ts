export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

/**
 * GET /api/reports
 * Fetch claim reports for the authenticated org
 * Optionally filter by claimId
 */
export async function GET(req: NextRequest) {
  try {
    // Use org context pattern (same as dashboard/claims)
    const orgContext = await getActiveOrgContext({ required: true });

    if (!orgContext.ok) {
      return NextResponse.json({ error: "Organization context required" }, { status: 401 });
    }

    const { orgId } = orgContext;
    const searchParams = req.nextUrl.searchParams;
    const claimId = searchParams.get("claimId");

    // Fetch reports using Prisma (ai_reports table)
    const reports = await prisma.ai_reports.findMany({
      where: {
        orgId,
        ...(claimId ? { claimId } : {}),
      },
      include: {
        claims: {
          select: {
            id: true,
            claimNumber: true,
            insured_name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return empty array (not error) if no reports
    return NextResponse.json({
      ok: true,
      reports: reports || [],
      count: reports.length,
    });
  } catch (error: any) {
    logger.error("[API /reports] Error fetching reports:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to fetch reports",
        reports: [], // Graceful degradation
      },
      { status: 500 }
    );
  }
}
