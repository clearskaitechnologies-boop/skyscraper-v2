import { NextResponse } from 'next/server';

import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
    const claimsCount = await prisma.claims.count({});
    return NextResponse.json({ ok: true, now: result[0]?.now, claimsCount, ms: Date.now() - started });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, ms: Date.now() - started }, { status: 500 });
  }
}
