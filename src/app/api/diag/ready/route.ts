// src/app/api/diag/ready/route.ts
// Application readiness check - verifies all critical environment variables
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checks = {
    // Database
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,

    // Authentication
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

    // AI Services
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,

    // Weather APIs
    WEATHERSTACK_API_KEY: !!(process.env.WEATHERSTACK_API_KEY || process.env.WEATHER_STACK_API_KEY),
    VISUALCROSSING_API_KEY: !!(
      process.env.VISUALCROSSING_API_KEY || process.env.VISUAL_CROSSING_API_KEY
    ),

    // Maps
    MAPBOX_ACCESS_TOKEN: !!process.env.MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_MAPBOX_TOKEN: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,

    // Payment
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,

    // Email
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,

    // Storage
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    FIREBASE_STORAGE_BUCKET: !!process.env.FIREBASE_STORAGE_BUCKET,

    // Queue/Worker
    REDIS_URL: !!process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
  };

  const criticalKeys = [
    "DATABASE_URL",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "OPENAI_API_KEY",
  ];

  const missingCritical = criticalKeys.filter((key) => !checks[key as keyof typeof checks]);
  const allPresent = Object.values(checks).every((v) => v === true);
  const ok = missingCritical.length === 0;

  // OPTIONAL FEATURE DETECTION
  let emailQueueExists = false;
  let trialsFieldsExist = true;
  try {
    // attempt a lightweight probe for email_queue
    // using a raw query - errors indicate table missing
    // (do not rethrow)
    const prismaModule = await import("@/lib/prisma");
    const prisma = prismaModule.default;
    try {
      // NOTE: use $queryRaw on Prisma client instance
      // We don't depend on the result, just whether it errors
      // @ts-ignore
      await (prisma as any).$queryRaw`SELECT 1 FROM email_queue LIMIT 1`;
      emailQueueExists = true;
    } catch (e) {
      console.debug("[diag/ready] email_queue probe failed:", (e as Error).message ?? e);
      emailQueueExists = false;
    }

    // probe for trials fields on org (sentTrialT24/sentTrialT1)
    try {
      // fetch 0 rows but validate selection
      // @ts-ignore
      await (prisma as any).org.findFirst({
        select: { id: true, sentTrialT24: true, sentTrialT1: true },
      });
      trialsFieldsExist = true;
    } catch (e) {
      console.debug("[diag/ready] trials fields probe failed:", (e as Error).message ?? e);
      trialsFieldsExist = false;
    }
  } catch (importErr) {
    // If prisma import fails, assume optional features missing
    emailQueueExists = false;
    trialsFieldsExist = false;
  }

  return NextResponse.json({
    ok,
    ready: ok,
    checks,
    optionalFeatures: {
      emailQueue: emailQueueExists,
      trials: trialsFieldsExist,
    },
    critical: {
      ok: missingCritical.length === 0,
      missing: missingCritical,
    },
    optional: {
      total: Object.keys(checks).length - criticalKeys.length,
      present: Object.entries(checks).filter(([k, v]) => !criticalKeys.includes(k) && v).length,
    },
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  });
}
