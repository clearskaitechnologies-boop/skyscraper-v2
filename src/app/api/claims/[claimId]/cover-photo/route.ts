// src/app/api/claims/[claimId]/cover-photo/route.ts
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";

export const dynamic = "force-dynamic";

/**
 * @deprecated This endpoint uses coverPhotoUrl/coverPhotoId fields that don't exist on claims.
 * Cover photo feature needs schema update to add these fields.
 */
export async function POST(req: Request, { params }: { params: { claimId: string } }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    return NextResponse.json(
      {
        error: "Cover photo feature not yet implemented",
        deprecated: true,
        message: "This feature requires schema updates to add coverPhotoUrl/coverPhotoId to claims",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[POST /api/claims/[claimId]/cover-photo] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
