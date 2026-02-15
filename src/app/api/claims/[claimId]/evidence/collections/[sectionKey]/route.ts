/**
 * PATCH /api/claims/[claimId]/evidence/collections/[sectionKey]
 * Update collection item ordering (drag-and-drop)
 *
 * @deprecated This endpoint uses evidenceCollection/evidenceCollectionItem models that don't exist in schema.
 */

import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { claimId: string; sectionKey: string } }
) {
  return NextResponse.json(
    {
      error: "Evidence collection feature not yet implemented",
      deprecated: true,
      message:
        "This feature requires schema updates to add evidenceCollection/evidenceCollectionItem models",
    },
    { status: 501 }
  );
}
