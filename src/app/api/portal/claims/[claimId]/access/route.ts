import { NextRequest, NextResponse } from "next/server";

import { assertPortalAccess } from "@/lib/auth/portalAccess";
import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/portal/claims/[claimId]/access
 * Returns user's access level (role) for this claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId } = authResult;

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
