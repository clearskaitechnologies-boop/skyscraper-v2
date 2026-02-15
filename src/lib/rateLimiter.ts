/**
 * Simple in-memory rate limiter
 * For production: use Upstash Redis or similar
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Check rate limit for a key (orgId, userId, etc.)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  // No entry or expired
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // Check limit
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Increment
  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Rate limit configurations
 */
export const RateLimits = {
  // PDF Generation: 10 per hour per org
  PDF_GENERATION: { maxRequests: 10, windowMs: 60 * 60 * 1000 },

  // AI Assistant: 50 per hour per user
  AI_ASSISTANT: { maxRequests: 50, windowMs: 60 * 60 * 1000 },

  // Mockups: 20 per hour per org
  MOCKUPS: { maxRequests: 20, windowMs: 60 * 60 * 1000 },

  // Supplements: 15 per hour per org
  SUPPLEMENTS: { maxRequests: 15, windowMs: 60 * 60 * 1000 },
} as const;

/**
 * Rate limit exceeded response
 */
export function rateLimitExceededResponse(resetAt: number) {
  const resetInSeconds = Math.ceil((resetAt - Date.now()) / 1000);
  return {
    ok: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
    retryAfter: resetInSeconds,
    resetAt: new Date(resetAt).toISOString(),
  };
}
