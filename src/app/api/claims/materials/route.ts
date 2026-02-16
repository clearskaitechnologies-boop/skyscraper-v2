import { NextResponse } from "next/server";

import { getOrgClaimOrThrow, OrgScopeError } from "@/lib/auth/orgScope";
import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId } = auth;

  const claimId = new URL(req.url).searchParams.get("claimId");
  if (!claimId) return new NextResponse("Missing claimId", { status: 400 });

  try {
    // Verify claim belongs to this org
    await getOrgClaimOrThrow(orgId, claimId);

    const materials = await prisma.claimMaterial.findMany({
      where: { claimId },
      include: { VendorProduct: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(materials);
  } catch (e: any) {
    if (e instanceof OrgScopeError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId } = auth;

  const { claimId, productId, vendorId, spec, warranty, color, unitPrice, quantity } =
    await req.json();
  if (!claimId || !productId)
    return new NextResponse("Missing claimId or productId", { status: 400 });

  try {
    // Verify claim belongs to this org
    await getOrgClaimOrThrow(orgId, claimId);

    const created = await prisma.claimMaterial.create({
      data: {
        claimId,
        productId,
        vendorId,
        spec,
        warranty,
        color,
        unitPrice,
        quantity: quantity ?? 1,
      } as any,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e instanceof OrgScopeError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
