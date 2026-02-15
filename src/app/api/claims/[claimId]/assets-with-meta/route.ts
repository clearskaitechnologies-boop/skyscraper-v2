import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getClaimAssetsWithMetadata } from "@/server/claims/getClaimAssetsWithMetadata";

export async function GET(_req: Request, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { claimId } = params;
    if (!claimId) return NextResponse.json({ assets: [] });
    const data = await getClaimAssetsWithMetadata(claimId);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}