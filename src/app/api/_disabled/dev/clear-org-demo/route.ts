import { NextResponse } from "next/server";

import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function POST() {
  const { userId, orgId, role } = await getCurrentUserPermissions();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.leads.deleteMany({ where: { orgId, isDemo: true } });
    await tx.claims.deleteMany({ where: { orgId, isDemo: true } });
    await tx.properties.deleteMany({ where: { orgId, isDemo: true } });
    await tx.contacts.deleteMany({ where: { orgId, isDemo: true } });

    await tx.org.update({
      where: { id: orgId },
      data: { demoMode: false, demoSeededAt: null },
    });
  });

  return NextResponse.json({
    ok: true,
    demoMode: false,
    demoSeededAt: null,
  });
}
