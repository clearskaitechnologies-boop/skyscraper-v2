/**
 * src/lib/scale/config.ts
 *
 * 10,000-User Scale Configuration
 *
 * Centralized constants for connection pools, rate limits, cache TTLs,
 * and queue concurrency. Import from here instead of hard-coding values.
 */

/* ------------------------------------------------------------------ */
/*  Database                                                           */
/* ------------------------------------------------------------------ */

export const DB_SCALE = {
  /** Max concurrent connections per serverless function (set in DATABASE_URL) */
  CONNECTION_LIMIT: 10,
  /** Seconds to wait for a pool slot before throwing */
  POOL_TIMEOUT: 20,
  /** Max transaction wait time (ms) */
  TRANSACTION_MAX_WAIT: 10_000,
  /** Max transaction execution time (ms) */
  TRANSACTION_TIMEOUT: 30_000,
  /** Max rows to return in paginated list endpoints */
  DEFAULT_PAGE_SIZE: 50,
  /** Hard ceiling on any single query's `take` */
  MAX_PAGE_SIZE: 200,
} as const;

/* ------------------------------------------------------------------ */
/*  Cache                                                              */
/* ------------------------------------------------------------------ */

export const CACHE_TTL = {
  /** Hot data: org settings, nav config, user roles (seconds) */
  HOT: 60,
  /** Warm data: dashboard KPIs, team lists (seconds) */
  WARM: 300,
  /** Cold data: report history, templates (seconds) */
  COLD: 3_600,
  /** Frozen data: static reference tables, trade lists (seconds) */
  FROZEN: 86_400,
  /** AI inference cache (seconds) — 7 days */
  AI: 604_800,
} as const;

/* ------------------------------------------------------------------ */
/*  Rate Limits (requests per window)                                  */
/* ------------------------------------------------------------------ */

export const RATE_LIMITS = {
  /** API global rate limit per user */
  API_GLOBAL: { requests: 200, window: "60s" as const },
  /** AI endpoints */
  AI: { requests: 50, window: "3600s" as const },
  /** PDF generation */
  PDF: { requests: 10, window: "3600s" as const },
  /** Auth endpoints (login, signup) */
  AUTH: { requests: 10, window: "60s" as const },
  /** Webhook ingress */
  WEBHOOK: { requests: 100, window: "60s" as const },
  /** Measurements order */
  MEASUREMENTS: { requests: 20, window: "3600s" as const },
  /** E-sign sending */
  ESIGN: { requests: 30, window: "3600s" as const },
} as const;

/* ------------------------------------------------------------------ */
/*  Queue / Workers                                                    */
/* ------------------------------------------------------------------ */

export const QUEUE = {
  /** Default BullMQ concurrency per worker */
  CONCURRENCY: 5,
  /** Max retries for failed jobs */
  MAX_RETRIES: 3,
  /** Backoff type */
  BACKOFF_TYPE: "exponential" as const,
  /** Initial backoff delay (ms) */
  BACKOFF_DELAY: 2_000,
  /** Job timeout (ms) — kill after 5 minutes */
  JOB_TIMEOUT: 300_000,
  /** Stale job check interval (ms) */
  STALE_CHECK_INTERVAL: 60_000,
} as const;

/* ------------------------------------------------------------------ */
/*  Scale thresholds                                                   */
/* ------------------------------------------------------------------ */

export const SCALE = {
  /** Vercel max concurrent serverless functions (Pro plan) */
  MAX_CONCURRENT_FUNCTIONS: 100,
  /** Target total DB connections = MAX_CONCURRENT_FUNCTIONS × CONNECTION_LIMIT */
  TARGET_TOTAL_CONNECTIONS: 1_000,
  /** Supabase Pro plan max connections */
  SUPABASE_MAX_CONNECTIONS: 1_500,
  /** Alert if headroom falls below this % */
  CONNECTION_HEADROOM_ALERT: 0.2,
  /** Max payload size for API routes (bytes) — 4.5 MB for Vercel */
  MAX_PAYLOAD: 4_500_000,
  /** Max file upload size (bytes) — 50 MB */
  MAX_UPLOAD: 50_000_000,
} as const;
