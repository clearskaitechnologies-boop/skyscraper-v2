/**
 * GET /api/reports/recent
 * Fetch recent generated artifacts (PDFs) for the organization
 */

import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Authenticate
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { orgId } = authResult;

    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    // Parse limit from query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Fetch recent artifacts
    const artifacts = await prisma.ai_reports.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(limit, 50), // Cap at 50
      select: {
        id: true,
        title: true,
        type: true,
        claimId: true,
        attachments: true, // PDFs stored in attachments JSON
        createdAt: true,
      },
    });

    // Enrich with claim numbers
    const claimIds = [...new Set(artifacts.map((a) => a.claimId).filter(Boolean) as string[])];
    const claims =
      claimIds.length > 0
        ? await prisma.claims.findMany({
            where: { id: { in: claimIds } },
            select: { id: true, claimNumber: true },
          })
        : [];

    const claimMap = new Map(claims.map((c) => [c.id, c.claimNumber]));

    const enrichedArtifacts = artifacts.map((artifact) => {
      // Extract pdfUrl from attachments JSON if available
      const attachments = artifact.attachments as { pdfUrl?: string } | null;
      return {
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        claimId: artifact.claimId,
        claimNumber: artifact.claimId ? claimMap.get(artifact.claimId) : null,
        pdfUrl: attachments?.pdfUrl || null,
        createdAt: artifact.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      ok: true,
      artifacts: enrichedArtifacts,
    });
  } catch (error: any) {
    console.error("[GET /api/reports/recent] Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch recent PDFs" }, { status: 500 });
  }
}
