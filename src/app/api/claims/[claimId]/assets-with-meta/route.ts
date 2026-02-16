import { NextResponse } from "next/server";

import { getOrgClaimOrThrow, OrgScopeError } from "@/lib/auth/orgScope";
import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import { getClaimAssetsWithMetadata } from "@/server/claims/getClaimAssetsWithMetadata";

export async function GET(_req: Request, { params }: { params: { claimId: string } }) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { orgId } = auth;

    const { claimId } = params;
    if (!claimId) return NextResponse.json({ assets: [] });

    // Verify claim belongs to this org
    await getOrgClaimOrThrow(orgId, claimId);

    const data = await getClaimAssetsWithMetadata(claimId);
    return NextResponse.json(data);
  } catch (e: any) {
    if (e instanceof OrgScopeError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
