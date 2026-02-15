/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter for API routes.
 * For production, consider using Redis or a dedicated service like Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Custom key generator (defaults to userId)
   */
  keyGenerator?: (userId: string, orgId?: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
  userId: string,
  orgId: string | undefined,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyGenerator ? config.keyGenerator(userId, orgId) : `user:${userId}`;

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment count
  entry.count++;

  // Check if over limit
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // AI routes: 10 requests per minute per user
  AI: {
    maxRequests: 10,
    windowSeconds: 60,
  },

  // API routes: 100 requests per minute per user
  API: {
    maxRequests: 100,
    windowSeconds: 60,
  },

  // Strict: 5 requests per minute per user (for expensive operations)
  STRICT: {
    maxRequests: 5,
    windowSeconds: 60,
  },

  // Generous: 1000 requests per hour per user
  GENEROUS: {
    maxRequests: 1000,
    windowSeconds: 3600,
  },
} as const;

/**
 * Reset rate limit for a specific key (useful for testing)
 */
export function resetRateLimit(userId: string, config: RateLimitConfig) {
  const key = config.keyGenerator ? config.keyGenerator(userId, undefined) : `user:${userId}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  userId: string,
  orgId: string | undefined,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyGenerator ? config.keyGenerator(userId, orgId) : `user:${userId}`;

  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || entry.resetAt < now) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  return {
    allowed: entry.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}
