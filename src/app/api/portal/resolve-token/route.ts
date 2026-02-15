import { NextResponse } from "next/server";

import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const resolved = await validatePortalToken(token);
  if (!resolved) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  const client = resolved.email
    ? await prisma.client.findFirst({ where: { email: resolved.email } })
    : null;
  return NextResponse.json({ client, claimId: resolved.claimId });
}
