import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const ctx = await safeOrgContext();

  if (ctx.status !== "ok" || !ctx.userId) {
    return NextResponse.json({ ok: false, ctx }, { status: 401 });
  }

  const memberships = await prisma.user_organizations.findMany({
    where: { userId: ctx.userId },
    select: { organizationId: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const org = ctx.orgId
    ? await prisma.org.findUnique({
        where: { id: ctx.orgId },
        select: { id: true, name: true, clerkOrgId: true },
      })
    : null;

  return NextResponse.json({
    ok: true,
    userId: ctx.userId,
    safeOrgContext: ctx,
    memberships,
    orgFromCtx: org,
  });
}
