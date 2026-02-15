import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Comprehensive health check for all features, plugins, and AI tools
 * GET /api/health/comprehensive
 */
export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    status: "checking",
    checks: {} as Record<string, any>,
  };

  // 1. Database Connectivity
  try {
    const { pgPool } = await import("@/lib/db");
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();
    results.checks.database = {
      status: "✅ OPERATIONAL",
      type: "PostgreSQL",
      ssl: "enabled",
    };
  } catch (error: any) {
    results.checks.database = {
      status: "❌ ERROR",
      error: error.message,
    };
  }

  // 2. Clerk Authentication
  try {
    const { userId } = await auth();
    results.checks.clerk = {
      status: "✅ OPERATIONAL",
      authenticated: !!userId,
      publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: !!process.env.CLERK_SECRET_KEY,
    };
  } catch (error: any) {
    results.checks.clerk = {
      status: "❌ ERROR",
      error: error.message,
    };
  }

  // 3. OpenAI Integration
  results.checks.openai = {
    status: process.env.OPENAI_API_KEY ? "✅ CONFIGURED" : "❌ MISSING",
    keyPresent: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
  };

  // 4. Stripe Payment Processing
  results.checks.stripe = {
    status:
      process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? "✅ CONFIGURED"
        : "❌ MISSING",
    secretKey: !!process.env.STRIPE_SECRET_KEY,
    publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    priceIds: {
      solo: !!process.env.STRIPE_PRICE_SOLO,
      business: !!process.env.STRIPE_PRICE_BUSINESS,
      enterprise: !!process.env.STRIPE_PRICE_ENTERPRISE,
    },
  };

  // 5. Firebase Storage
  results.checks.firebase = {
    status:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        ? "✅ CONFIGURED"
        : "⚠️ PARTIAL",
    client: {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    admin: {
      projectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    },
  };

  // 6. Supabase Storage
  results.checks.supabase = {
    status:
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "✅ CONFIGURED"
        : "❌ MISSING",
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  // 7. Mapbox Integration
  results.checks.mapbox = {
    status:
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN && process.env.MAPBOX_ACCESS_TOKEN
        ? "✅ CONFIGURED"
        : "❌ MISSING",
    publicToken: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    serverToken: !!process.env.MAPBOX_ACCESS_TOKEN,
    tokenPrefix: process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.substring(0, 10),
  };

  // 8. Weather APIs
  results.checks.weather = {
    weatherStack:
      process.env.WEATHER_STACK_API_KEY || process.env.WEATHERSTACK_API_KEY
        ? "✅ CONFIGURED"
        : "❌ MISSING",
    visualCrossing:
      process.env.VISUAL_CROSSING_API_KEY || process.env.VISUALCROSSING_API_KEY
        ? "✅ CONFIGURED"
        : "❌ MISSING",
  };

  // 9. Email Service (Resend)
  results.checks.email = {
    status: process.env.RESEND_API_KEY ? "✅ CONFIGURED" : "❌ MISSING",
    apiKey: !!process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM || "not set",
  };

  // 10. Replicate (AI Image Generation)
  results.checks.replicate = {
    status: process.env.REPLICATE_API_TOKEN ? "✅ CONFIGURED" : "❌ MISSING",
    apiToken: !!process.env.REPLICATE_API_TOKEN,
  };

  // 11. Redis/Upstash Queue
  results.checks.redis = {
    status: process.env.REDIS_URL ? "✅ CONFIGURED" : "⚠️ OPTIONAL",
    url: !!process.env.REDIS_URL,
  };

  // 12. Analytics
  results.checks.analytics = {
    facebookPixel: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ? "✅ CONFIGURED" : "⚠️ OPTIONAL",
    sentry: process.env.NEXT_PUBLIC_SENTRY_DSN ? "✅ CONFIGURED" : "⚠️ OPTIONAL",
  };

  // 13. Feature Flags
  results.checks.features = {
    freeBeta: process.env.FREE_BETA === "true" ? "✅ ENABLED" : "❌ DISABLED",
    storageEnabled: process.env.STORAGE_ENABLED !== "false" ? "✅ ENABLED" : "❌ DISABLED",
    aiEnabled: !!process.env.OPENAI_API_KEY,
  };

  // 14. Application URLs
  results.checks.urls = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "not set",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "not set",
    environment: process.env.NODE_ENV || "not set",
  };

  // Calculate overall status
  const criticalChecks = ["database", "clerk", "openai", "stripe", "firebase"];
  const allCriticalOk = criticalChecks.every((check) => {
    const status = results.checks[check]?.status;
    return status?.includes("✅") || status?.includes("CONFIGURED");
  });

  results.status = allCriticalOk ? "✅ ALL SYSTEMS OPERATIONAL" : "⚠️ SOME ISSUES DETECTED";

  // Summary counts
  const checkValues = Object.values(results.checks);
  const operational = checkValues.filter((c: any) => c.status?.includes("✅")).length;
  const issues = checkValues.filter((c: any) => c.status?.includes("❌")).length;
  const warnings = checkValues.filter((c: any) => c.status?.includes("⚠️")).length;

  return NextResponse.json({
    ...results,
    summary: {
      operational,
      issues,
      warnings,
      total: checkValues.length,
    },
  });
}
