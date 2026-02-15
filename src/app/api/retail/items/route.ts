import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { estimateId, productId, price, spec, warranty, color, quantity } = await req.json();
  if (!estimateId || !productId)
    return new NextResponse("Missing estimateId or productId", { status: 400 });

  const created = await prisma.retailEstimateItem.create({
    data: { estimateId, productId, price, spec, warranty, color, quantity: quantity ?? 1 } as any,
  });
  return NextResponse.json(created, { status: 201 });
}
