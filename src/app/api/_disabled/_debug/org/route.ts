import { NextResponse } from "next/server";

import { getOrgContext } from "@/lib/org/getOrgContext";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const ctx = await safeOrgContext();

  if (ctx.status !== "ok" || !ctx.userId) {
    return NextResponse.json(
      {
        ok: false,
        reason: ctx.status,
        safeOrgContext: ctx,
      },
      { status: 401 }
    );
  }

  const memberships = await prisma.user_organizations.findMany({
    where: { userId: ctx.userId },
    select: { organizationId: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  let resolvedOrg: any = null;
  let resolvedError: string | null = null;

  try {
    const canonical = await getOrgContext();
    resolvedOrg = {
      orgId: canonical.orgId,
      userId: canonical.userId,
      isDemo: canonical.isDemo,
    };
  } catch (error: any) {
    resolvedError = error?.message || String(error);
  }

  const orgFromMembership = ctx.orgId
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
    orgFromSafeContext: orgFromMembership,
    canonicalResolver: {
      ok: !!resolvedOrg && !resolvedError,
      resolvedOrg,
      error: resolvedError,
    },
  });
}
