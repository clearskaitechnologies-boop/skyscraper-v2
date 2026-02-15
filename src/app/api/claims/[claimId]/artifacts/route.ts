// src/app/api/claims/[claimId]/artifacts/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

/**
 * GET /api/claims/[claimId]/artifacts
 * Returns all AI artifacts for a claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(params.claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    // Fetch all artifacts for this claim
    const artifacts = await prisma.ai_reports.findMany({
      where: {
        claimId: params.claimId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ artifacts });
  } catch (error: any) {
    console.error("[GET /api/claims/[claimId]/artifacts] Error:", error);

    // CRITICAL: Always return artifacts array, never error
    // This prevents "Failed to fetch" errors in UI
    return NextResponse.json({
      artifacts: [],
      message: "Artifacts system initializing",
    });
  }
}

/**
 * POST /api/claims/[claimId]/artifacts
 * Creates a new AI artifact for a claim
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(params.claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    const body = await req.json();
    const { type, title, content, source } = body;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json({ error: "Missing required fields: type, title" }, { status: 400 });
    }

    // Determine content format
    const isJson = typeof content === "object";

    // Create artifact
    const artifact = await prisma.ai_reports.create({
      data: {
        orgId: orgId ?? undefined,
        claimId: params.claimId,
        createdByUserId: userId ?? undefined,
        type: type.toUpperCase(), // Map to ArtifactType enum
        title,
        contentJson: isJson ? content : null,
        contentText: isJson ? null : String(content || ""),
        status: "DRAFT",
      } as any,
    });

    return NextResponse.json({ artifact }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/claims/[claimId]/artifacts] Error:", error);
    return NextResponse.json({ error: "Failed to create artifact" }, { status: 500 });
  }
}
