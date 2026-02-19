import { NextRequest, NextResponse } from "next/server";

import { getOrgClaimOrThrow, OrgScopeError } from "@/lib/auth/orgScope";
import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/prisma";

export const GET = withAuth(async (req: NextRequest, { orgId }) => {
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
  } catch (e) {
    if (e instanceof OrgScopeError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, { orgId }) => {
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
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof OrgScopeError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
});
