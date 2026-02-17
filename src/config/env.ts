/**
 * Centralized Environment Configuration
 *
 * SINGLE SOURCE OF TRUTH for all environment variables.
 * Provides type-safe access with automatic fallbacks.
 *
 * Usage:
 *   import { env } from '@/config/env';
 *   const apiKey = env.OPENAI_API_KEY;
 */

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  if (process.env.NODE_ENV === "production") {
    console.warn(`[ENV] Missing required env var: ${key}`);
  }
  return "";
}

function getEnvRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[ENV] FATAL: Missing required environment variable: ${key}`);
  }
  return value;
}

function getBool(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

function getNum(key: string, defaultValue = 0): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Centralized Environment Configuration Object
 */
export const env = {
  // Node Environment
  NODE_ENV: getEnv("NODE_ENV", "development"),
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_TEST: process.env.NODE_ENV === "test",

  // App URLs
  NEXT_PUBLIC_APP_URL: getEnv(
    "NEXT_PUBLIC_APP_URL",
    getEnv("NEXT_PUBLIC_SITE_URL", `https://${getEnv("VERCEL_URL", "localhost:3000")}`)
  ),
  NEXT_PUBLIC_SITE_URL: getEnv(
    "NEXT_PUBLIC_SITE_URL",
    `https://${getEnv("VERCEL_URL", "localhost:3000")}`
  ),
  VERCEL_URL: getEnv("VERCEL_URL", "localhost:3000"),

  // Database
  DATABASE_URL: getEnvRequired("DATABASE_URL"),

  // Clerk Auth
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getEnvRequired("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: getEnvRequired("CLERK_SECRET_KEY"),

  // OpenAI
  OPENAI_API_KEY: getEnv("OPENAI_API_KEY"),
  OPENAI_VIDEO_MODEL: getEnv("OPENAI_VIDEO_MODEL", "sora-1.0"),

  // Stripe
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_ID: getEnv("STRIPE_PRICE_ID"),
  STRIPE_SOLO_MONTHLY_PRICE_ID: getEnv("STRIPE_SOLO_MONTHLY_PRICE_ID"),
  STRIPE_SOLO_ANNUAL_PRICE_ID: getEnv("STRIPE_SOLO_ANNUAL_PRICE_ID"),
  STRIPE_PRO_ANNUAL_PRICE_ID: getEnv("STRIPE_PRO_ANNUAL_PRICE_ID"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  SUPABASE_ANON_KEY: getEnv("SUPABASE_ANON_KEY"),
  SUPABASE_STORAGE_BUCKET_EXPORTS: getEnv("SUPABASE_STORAGE_BUCKET_EXPORTS", "exports"),

  // S3
  S3_BUCKET: getEnv("S3_BUCKET", "preloss"),

  // Weather APIs
  WEATHERSTACK_API_KEY: getEnv("WEATHERSTACK_API_KEY", getEnv("WEATHER_STACK_API_KEY")),
  VISUALCROSSING_API_KEY: getEnv("VISUALCROSSING_API_KEY", getEnv("VISUAL_CROSSING_API_KEY")),

  // Communication
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  EMAIL_FROM: getEnv("EMAIL_FROM", "ClearSkai <noreply@clearskai.com>"),
  TWILIO_ACCOUNT_SID: getEnv("TWILIO_ACCOUNT_SID", getEnv("TWILIO_SID")),
  TWILIO_AUTH_TOKEN: getEnv("TWILIO_AUTH_TOKEN", getEnv("TWILIO_AUTH")),
  TWILIO_PHONE_NUMBER: getEnv("TWILIO_PHONE_NUMBER", getEnv("TWILIO_NUMBER")),

  // Integrations
  QUICKBOOKS_CLIENT_ID: getEnv("QUICKBOOKS_CLIENT_ID"),
  QUICKBOOKS_CLIENT_SECRET: getEnv("QUICKBOOKS_CLIENT_SECRET"),
  QUICKBOOKS_REDIRECT_URI: getEnv("QUICKBOOKS_REDIRECT_URI"),
  QUICKBOOKS_ENVIRONMENT: getEnv("QUICKBOOKS_ENVIRONMENT", "sandbox"),
  ABC_SUPPLY_API_KEY: getEnv("ABC_SUPPLY_API_KEY"),
  ABC_SUPPLY_API_SECRET: getEnv("ABC_SUPPLY_API_SECRET"),
  ABC_SUPPLY_ENVIRONMENT: getEnv("ABC_SUPPLY_ENVIRONMENT", "sandbox"),
  SYNTHESIA_API_KEY: getEnv("SYNTHESIA_API_KEY"),

  // Redis/Upstash
  UPSTASH_REDIS_REST_URL: getEnv("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: getEnv("UPSTASH_REDIS_REST_TOKEN"),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: getEnv("NEXT_PUBLIC_SENTRY_DSN", getEnv("SENTRY_DSN")),
  SENTRY_DSN: getEnv("SENTRY_DSN"),

  // Feature Flags
  NEXT_PUBLIC_MAINTENANCE_MODE: getBool("NEXT_PUBLIC_MAINTENANCE_MODE"),
  NEXT_PUBLIC_AI_TOOLS_ENABLED: getBool("NEXT_PUBLIC_AI_TOOLS_ENABLED", true),
  NEXT_PUBLIC_UPLOADS_ENABLED: getBool("NEXT_PUBLIC_UPLOADS_ENABLED", true),
  NEXT_PUBLIC_SIGNUPS_ENABLED: getBool("NEXT_PUBLIC_SIGNUPS_ENABLED", true),
  NEXT_PUBLIC_BETA_MODE: getBool("NEXT_PUBLIC_BETA_MODE", true),
  NEXT_PUBLIC_ANALYTICS_DISABLED: getBool("NEXT_PUBLIC_ANALYTICS_DISABLED"),
  FREE_BETA: getBool("FREE_BETA"),
  EMERGENCY_MODE: getBool("EMERGENCY_MODE"),
  MAINTENANCE_MODE: getBool("MAINTENANCE_MODE"),

  // Miscellaneous
  TOKEN_ENCRYPTION_KEY: getEnv("TOKEN_ENCRYPTION_KEY"),
  TRADES_WEBHOOK_SECRET: getEnv("TRADES_WEBHOOK_SECRET"),
  EXPORT_URL_TTL_SECONDS: getNum("EXPORT_URL_TTL_SECONDS", 3600),
  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
  ENABLE_SCHEDULER: getBool("ENABLE_SCHEDULER"),
  BUILD_PHASE: getBool("BUILD_PHASE"),

  // Testing
  TEST_AUTH_BYPASS: getBool("TEST_AUTH_BYPASS"),
  TEST_AUTH_USER_ID: getEnv("TEST_AUTH_USER_ID"),
  TEST_AUTH_ORG_ID: getEnv("TEST_AUTH_ORG_ID"),

  // Vercel
  NEXT_PUBLIC_VERCEL_ENV: getEnv("NEXT_PUBLIC_VERCEL_ENV", getEnv("NODE_ENV", "development")),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: getEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"),

  // Functions
  NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: getBool("NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR"),
  NEXT_PUBLIC_MAINTENANCE_MESSAGE: getEnv(
    "NEXT_PUBLIC_MAINTENANCE_MESSAGE",
    "System maintenance in progress. We'll be back shortly."
  ),
} as const;

/**
 * Validate critical environment variables at startup
 */
export function validateEnv(): void {
  const required = ["DATABASE_URL", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(`[ENV] FATAL: Missing required environment variables: ${missing.join(", ")}`);
  }

  if (missing.length > 0) {
    console.warn(`[ENV] WARNING: Missing environment variables: ${missing.join(", ")}`);
  }
}

// Auto-validate on import in production
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  validateEnv();
}
