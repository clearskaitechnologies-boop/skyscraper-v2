/**
 * GET /api/claims/[claimId]/evidence
 * List all evidence collections with their assets
 * NOTE: evidenceCollection and evidenceAsset models don't exist in schema
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    // Authentication
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // TODO: evidenceCollection and evidenceAsset models don't exist in schema
    // Return stub response with FileAsset data instead
    const assets = await prisma.file_assets.findMany({
      where: {
        claimId,
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      collections: [],
      ungroupedAssets: assets.map((asset) => ({
        id: asset.id,
        fileName: asset.filename,
        mimeType: asset.mimeType,
        url: asset.publicUrl,
        createdAt: asset.createdAt,
      })),
      stats: {
        totalCollections: 0,
        totalAssets: assets.length,
        ungroupedCount: assets.length,
      },
    });
  } catch (error) {
    console.error("Evidence list error:", error);
    return NextResponse.json(
      {
        error: "Failed to list evidence",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
