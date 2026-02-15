// src/app/api/claims/[claimId]/cover-photo/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * @deprecated This endpoint uses coverPhotoUrl/coverPhotoId fields that don't exist on claims.
 * Cover photo feature needs schema update to add these fields.
 */
export async function POST(req: Request, { params }: { params: { claimId: string } }) {
  return NextResponse.json(
    {
      error: "Cover photo feature not yet implemented",
      deprecated: true,
      message: "This feature requires schema updates to add coverPhotoUrl/coverPhotoId to claims",
    },
    { status: 501 }
  );
}
