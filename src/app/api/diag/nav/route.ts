export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * Diagnostic endpoint to verify database connectivity and environment configuration.
 * Hit /api/diag/nav on live site to test:
 * - ok: true → DB + env are wired ✅
 * - 500 → env/DB issue ❌
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Test database connection with a simple query
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;

    // Count some basic tables to verify schema
    const [orgCount, contactCount, leadCount, claimCount] = await Promise.all([
      prisma.org.count(),
      prisma.contacts.count(),
      prisma.leads.count(),
      prisma.claims.count(),
    ]);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      dbTime: result[0]?.now ?? null,
      environment: process.env.ENVIRONMENT || process.env.NODE_ENV,
      counts: {
        orgs: orgCount,
        contacts: contactCount,
        leads: leadCount,
        claims: claimCount,
      },
      database: {
        connected: true,
        url: process.env.DATABASE_URL ? "configured" : "missing",
      },
      clerk: {
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "configured" : "missing",
        secretKey: process.env.CLERK_SECRET_KEY ? "configured" : "missing",
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY ? "configured" : "missing",
      },
      mapbox: {
        token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? "configured" : "missing",
      },
    });
  } catch (error: any) {
    console.error("Diagnostic check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT || process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}
