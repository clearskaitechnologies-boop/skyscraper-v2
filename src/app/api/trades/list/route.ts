import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId, orgId: authOrgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take")) || 100;
  // Note: contractors model doesn't have orgId field
  const partners = await prisma.contractors.findMany({
    take,
    orderBy: { user_id: "asc" },
  });
  return NextResponse.json({ ok: true, partners });
}
