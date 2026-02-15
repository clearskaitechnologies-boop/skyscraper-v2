import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const claimId = new URL(req.url).searchParams.get("claimId");
  if (!claimId) return new NextResponse("Missing claimId", { status: 400 });

  const materials = await prisma.claimMaterial.findMany({
    where: { claimId },
    include: { VendorProduct: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(materials);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { claimId, productId, vendorId, spec, warranty, color, unitPrice, quantity } =
    await req.json();
  if (!claimId || !productId)
    return new NextResponse("Missing claimId or productId", { status: 400 });

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
}
