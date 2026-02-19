import { NextResponse } from "next/server";

import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId } = auth;

  try {
    const body = await req.json();
    // Only allow creating referrals scoped to user's org
    const referral = await prisma.referrals.create({
      data: {
        ...body,
        org_id: orgId,
      },
    });
    return NextResponse.json(referral, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
