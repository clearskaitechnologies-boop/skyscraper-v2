import { NextResponse } from 'next/server';

import prisma from "@/lib/prisma";

// Lightweight database health endpoint used for readiness & latency probes.
// Does a trivial SELECT 1 and returns structured status JSON.
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({
      status: 'error',
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
      // Intentionally omit detailed error for security.
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';