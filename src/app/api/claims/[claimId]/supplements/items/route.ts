import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: { claimId: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await getDelegate("supplementItem").findMany({
    where: { claimId: params.claimId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request, { params }: { params: { claimId: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const item = await getDelegate("supplementItem").create({
    data: { claimId: params.claimId, ...data },
  });

  return NextResponse.json(item);
}
