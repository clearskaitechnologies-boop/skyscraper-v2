import { NextResponse } from "next/server";

/**
 * Startup Health Check Endpoint
 *
 * Validates all critical environment variables and returns actionable errors.
 * Use this during deployment or startup to catch configuration issues early.
 *
 * Returns:
 * - 200: All critical env vars present
 * - 500: Missing critical env vars with details
 */

interface EnvCheck {
  name: string;
  present: boolean;
  required: boolean;
  category: string;
}

export async function GET() {
  const checks: EnvCheck[] = [
    // Database - CRITICAL
    {
      name: "DATABASE_URL",
      present: !!process.env.DATABASE_URL,
      required: true,
      category: "Database",
    },
    { name: "DIRECT_URL", present: !!process.env.DIRECT_URL, required: true, category: "Database" },

    // Authentication - CRITICAL
    {
      name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      present: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      required: true,
      category: "Auth",
    },
    {
      name: "CLERK_SECRET_KEY",
      present: !!process.env.CLERK_SECRET_KEY,
      required: true,
      category: "Auth",
    },

    // AI Services - CRITICAL for AI features
    {
      name: "OPENAI_API_KEY",
      present: !!process.env.OPENAI_API_KEY,
      required: true,
      category: "AI",
    },

    // Payments - CRITICAL for billing
    {
      name: "STRIPE_SECRET_KEY",
      present: !!process.env.STRIPE_SECRET_KEY,
      required: true,
      category: "Payments",
    },
    {
      name: "STRIPE_WEBHOOK_SECRET",
      present: !!process.env.STRIPE_WEBHOOK_SECRET,
      required: true,
      category: "Payments",
    },
    {
      name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      present: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      required: true,
      category: "Payments",
    },

    // Maps - CRITICAL for location features
    {
      name: "NEXT_PUBLIC_MAPBOX_TOKEN",
      present: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      required: true,
      category: "Maps",
    },

    // Storage - CRITICAL for file uploads
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
      category: "Storage",
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
      category: "Storage",
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      required: true,
      category: "Storage",
    },

    // Email - CRITICAL for notifications
    {
      name: "RESEND_API_KEY",
      present: !!process.env.RESEND_API_KEY,
      required: true,
      category: "Email",
    },

    // Weather APIs - IMPORTANT but not blocking
    {
      name: "VISUALCROSSING_API_KEY",
      present: !!process.env.VISUALCROSSING_API_KEY || !!process.env.VISUAL_CROSSING_API_KEY,
      required: false,
      category: "Weather",
    },
    {
      name: "WEATHERSTACK_API_KEY",
      present: !!process.env.WEATHERSTACK_API_KEY || !!process.env.WEATHER_STACK_API_KEY,
      required: false,
      category: "Weather",
    },

    // AI Image Generation - OPTIONAL
    {
      name: "REPLICATE_API_TOKEN",
      present: !!process.env.REPLICATE_API_TOKEN,
      required: false,
      category: "AI Image",
    },

    // Redis/Queue - OPTIONAL (for background jobs)
    { name: "REDIS_URL", present: !!process.env.REDIS_URL, required: false, category: "Queue" },
    {
      name: "UPSTASH_REDIS_REST_URL",
      present: !!process.env.UPSTASH_REDIS_REST_URL,
      required: false,
      category: "Queue",
    },
  ];

  const missing = checks.filter((check) => check.required && !check.present);
  const missingOptional = checks.filter((check) => !check.required && !check.present);

  const categorized = checks.reduce(
    (acc, check) => {
      if (!acc[check.category]) acc[check.category] = [];
      acc[check.category].push({
        name: check.name,
        status: check.present ? "✅" : check.required ? "❌" : "⚠️",
        required: check.required,
      });
      return acc;
    },
    {} as Record<string, Array<{ name: string; status: string; required: boolean }>>
  );

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        status: "CRITICAL_ENV_VARS_MISSING",
        message: `${missing.length} critical environment variable(s) missing`,
        missing: missing.map((c) => ({
          name: c.name,
          category: c.category,
          hint: getEnvHint(c.name),
        })),
        missingOptional: missingOptional.map((c) => c.name),
        breakdown: categorized,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: "ALL_CRITICAL_ENV_VARS_PRESENT",
    message: "All critical environment variables are configured",
    totalChecks: checks.length,
    criticalPresent: checks.filter((c) => c.required && c.present).length,
    criticalTotal: checks.filter((c) => c.required).length,
    optionalPresent: checks.filter((c) => !c.required && c.present).length,
    optionalTotal: checks.filter((c) => !c.required).length,
    missingOptional: missingOptional.map((c) => c.name),
    breakdown: categorized,
    timestamp: new Date().toISOString(),
  });
}

function getEnvHint(name: string): string {
  const hints: Record<string, string> = {
    DATABASE_URL:
      "Get from Supabase → Project Settings → Database → Connection String (Pooled, port 6543)",
    DIRECT_URL:
      "Get from Supabase → Project Settings → Database → Connection String (Direct, port 5432)",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      "Get from Clerk Dashboard → API Keys (use pk_test_ for dev, pk_live_ for prod)",
    CLERK_SECRET_KEY:
      "Get from Clerk Dashboard → API Keys (use sk_test_ for dev, sk_live_ for prod)",
    OPENAI_API_KEY: "Get from OpenAI Platform → API Keys (https://platform.openai.com/api-keys)",
    STRIPE_SECRET_KEY:
      "Get from Stripe Dashboard → Developers → API Keys (use sk_test_ for dev, sk_live_ for prod)",
    STRIPE_WEBHOOK_SECRET: "Get from Stripe Dashboard → Developers → Webhooks → Add endpoint",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      "Get from Stripe Dashboard → Developers → API Keys (use pk_test_ for dev, pk_live_ for prod)",
    NEXT_PUBLIC_MAPBOX_TOKEN:
      "Get from Mapbox Account → Access Tokens (https://account.mapbox.com/access-tokens)",
    NEXT_PUBLIC_SUPABASE_URL: "Get from Supabase → Project Settings → API → Project URL",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "Get from Supabase → Project Settings → API → Project API keys → anon public",
    SUPABASE_SERVICE_ROLE_KEY:
      "Get from Supabase → Project Settings → API → Project API keys → service_role (SECRET)",
    RESEND_API_KEY: "Get from Resend Dashboard → API Keys (https://resend.com/api-keys)",
    VISUALCROSSING_API_KEY:
      "Get from Visual Crossing Weather API (https://www.visualcrossing.com/weather-api)",
    WEATHERSTACK_API_KEY: "Get from WeatherStack (https://weatherstack.com/)",
    REPLICATE_API_TOKEN:
      "Get from Replicate → Account → API Tokens (https://replicate.com/account/api-tokens)",
    REDIS_URL: "Get from Upstash → Database → Details (redis://...)",
    UPSTASH_REDIS_REST_URL: "Get from Upstash → Database → REST API → URL",
  };

  return hints[name] || "Check documentation for setup instructions";
}
