import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getClaimPermissions } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/claims/[claimId]/permissions
 * Returns all permissions for the current user on a specific claim
 * Used by UI to show/hide action buttons and enforce access control
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  try {
    const { userId } = await auth();
    const { claimId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = await getClaimPermissions({ userId, claimId });

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error: any) {
    console.error("[permissions] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
