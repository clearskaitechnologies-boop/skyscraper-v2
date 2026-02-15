import { NextResponse } from "next/server";

import { collectRoutes } from "@/lib/diagnostics/routes";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function envStatus(key: string) {
  return process.env[key] ? "configured" : "missing";
}

export async function GET(req: Request) {
  // Security: Only allow internal access or authenticated admin users
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // If no valid admin token, return minimal health check only
  if (token !== process.env.ADMIN_HEALTH_TOKEN) {
    return NextResponse.json(
      {
        ok: true,
        timestamp: new Date().toISOString(),
        message: "Health check passed. Full diagnostics require authentication.",
      },
      { status: 200 }
    );
  }

  // Full diagnostics for authenticated admin access only
  const base = {
    ok: true,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    env: {
      nodeEnv: process.env.NODE_ENV ?? null,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasClerkKeys:
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY,
    },
    db: {
      connected: false,
      agentRunsTableExists: false,
      claimTimelineTableExists: false,
      claimsClientIdColumnExists: false,
    },
  } as any;

  try {
    // Connectivity check
    await prisma.$queryRaw`SELECT 1`;
    base.db.connected = true;

    // agent_runs table existence
    const agentRuns = await prisma.$queryRaw<
      { exists: boolean }[]
    >`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='agent_runs') AS "exists"`;
    base.db.agentRunsTableExists = agentRuns[0]?.exists ?? false;

    // claim timeline table existence (handles snake & camel variants)
    const timeline = await prisma.$queryRaw<
      { exists: boolean }[]
    >`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE lower(table_name) IN ('claimtimelineevent','claim_timelineevent','claim_timeline_events')) AS "exists"`;
    base.db.claimTimelineTableExists = timeline[0]?.exists ?? false;

    // claims.clientId column existence (claims or claim table depending on naming)
    const clientIdColumn = await prisma.$queryRaw<
      { exists: boolean }[]
    >`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE lower(table_name) IN ('claim','claims') AND lower(column_name)='clientid') AS "exists"`;
    base.db.claimsClientIdColumnExists = clientIdColumn[0]?.exists ?? false;
  } catch (err: any) {
    base.ok = false;
    base.error = { message: err?.message ?? "Unknown error" };
  }

  // Existing route + env summary retained for backward compatibility
  const routes = collectRoutes();
  const criticalEnv = [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "STRIPE_SECRET_KEY",
  ];
  const optionalEnv = [
    "RESEND_API_KEY",
    "REDIS_URL",
    "REPLICATE_API_TOKEN",
    "WEATHERSTACK_API_KEY",
  ];
  const envDetail = {
    critical: criticalEnv.map((k) => ({ key: k, status: envStatus(k) })),
    optional: optionalEnv.map((k) => ({ key: k, status: envStatus(k) })),
  };
  const summary = {
    routes: { pages: routes.totalPages, api: routes.totalApi },
    criticalOk: envDetail.critical.every((e) => e.status === "configured"),
  };

  return NextResponse.json(
    { ...base, summary, envDetail, routes },
    { status: base.ok ? 200 : 500 }
  );
}
