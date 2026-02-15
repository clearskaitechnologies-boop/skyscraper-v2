import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { assertPortalAccess } from "@/lib/auth/portalAccess";

export const dynamic = "force-dynamic";

/**
 * GET /api/portal/claims/[claimId]/access
 * Returns user's access level (role) for this claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Get access record
    const access = await assertPortalAccess({ userId, claimId });

    return NextResponse.json({
      role: access.role,
      status: access.status,
      activatedAt: access.activatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
