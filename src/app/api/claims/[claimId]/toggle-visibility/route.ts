import { NextRequest, NextResponse } from "next/server";

import { getOrgClaimOrThrow, OrgScopeError } from "@/lib/auth/orgScope";
import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

/**
 * POST /api/claims/[claimId]/toggle-visibility
 * Toggle clientVisible status for assets/timeline items
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { orgId } = auth;

    const { claimId } = await params;

    // Security: Verify claim belongs to this org
    await getOrgClaimOrThrow(orgId, claimId);

    const body = await req.json();
    const { type, itemIds, visible } = body;

    // type: "photo" | "timeline"
    // itemIds: array of IDs to toggle
    // visible: boolean

    if (!type || !itemIds || typeof visible !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    let updated = 0;

    if (type === "photo") {
      // Use documents table for photos (linked via projectId)
      const claim = await prisma.claims.findUnique({
        where: { id: claimId },
        select: { projectId: true },
      });

      if (claim?.projectId) {
        const result = await prisma.documents.updateMany({
          where: {
            id: { in: itemIds },
            projectId: claim.projectId,
          },
          data: {
            isPublic: visible,
          },
        });
        updated = result.count;
      }
    } else if (type === "timeline") {
      const result = await prisma.claim_timeline_events.updateMany({
        where: {
          id: { in: itemIds },
          claim_id: claimId,
        },
        data: {
          visible_to_client: visible,
        },
      });
      updated = result.count;
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'photo' or 'timeline'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      updated,
      type,
      visible,
    });
  } catch (error) {
    if (error instanceof OrgScopeError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[TOGGLE_VISIBILITY_ERROR]", error);
    return NextResponse.json({ error: "Failed to toggle visibility" }, { status: 500 });
  }
}
