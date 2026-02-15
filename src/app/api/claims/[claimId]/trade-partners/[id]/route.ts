import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";

// DELETE /api/claims/[claimId]/trade-partners/[id] — Remove trade assignment
// NOTE: ClaimTradePartner model doesn't exist in schema - stubbed route
export async function DELETE(
  req: NextRequest,
  { params }: { params: { claimId: string; id: string } }
) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    const { claimId, id } = params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // TODO: ClaimTradePartner model doesn't exist in schema
    return NextResponse.json(
      {
        ok: false,
        message: "Trade partner management not yet implemented (model missing)",
      },
      { status: 501 }
    );
  } catch (error: any) {
    console.error("[DELETE /api/claims/:claimId/trade-partners/:id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove trade partner" },
      { status: 500 }
    );
  }
}
