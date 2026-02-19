import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const { role, orgId } = await getCurrentUserPermissions();
    if (!orgId) return NextResponse.json({ error: 'no-org' }, { status: 400 });
    if (role === 'ADMIN' || role === 'MANAGER') {
      return NextResponse.redirect(new URL('/teams', request.url));
    }
    // Update membership role
    await prisma.user_organizations.update({
      where: {
        userId_organizationId: { userId, organizationId: orgId },
      },
      data: { role: 'MANAGER' },
    });
    // Update users role if present
    await prisma.users.updateMany({
      where: { clerkUserId: userId, orgId },
      data: { role: 'MANAGER' },
    });
    return NextResponse.redirect(new URL('/teams', request.url));
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'elevation failed' }, { status: 500 });
  }
}