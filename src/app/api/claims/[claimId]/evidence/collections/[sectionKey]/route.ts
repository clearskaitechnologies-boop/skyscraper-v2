/**
 * PATCH /api/claims/[claimId]/evidence/collections/[sectionKey]
 * Update collection item ordering (drag-and-drop)
 *
 * @deprecated This endpoint uses evidenceCollection/evidenceCollectionItem models that don't exist in schema.
 */

import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { claimId: string; sectionKey: string } }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    return NextResponse.json(
      {
        error: "Evidence collection feature not yet implemented",
        deprecated: true,
        message:
          "This feature requires schema updates to add evidenceCollection/evidenceCollectionItem models",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[PATCH /api/claims/[claimId]/evidence/collections/[sectionKey]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
