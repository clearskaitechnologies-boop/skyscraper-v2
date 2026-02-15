/**
 * Rate Limiting Utility
 *
 * Uses Upstash Redis for distributed rate limiting across serverless functions.
 * Prevents abuse of expensive AI/upload endpoints.
 *
 * Usage:
 * ```typescript
 * import { rateLimit } from '@/lib/rate-limit';
 *
 * const limiter = rateLimit({
 *   interval: 60 * 1000, // 1 minute
 *   uniqueTokenPerInterval: 500,
 * });
 *
 * const success = await limiter.check(10, userId); // 10 requests per minute
 * if (!success) {
 *   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 * ```
 */

import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Fallback in-memory rate limiter for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval?: number; // Max unique tokens to track
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval = 500 } = options;

  return {
    /**
     * Check if a request is within rate limits
     * @param limit - Maximum requests allowed in the interval
     * @param token - Unique identifier (userId, IP, etc.)
     * @returns true if within limits, false if exceeded
     */
    check: async (limit: number, token: string): Promise<boolean> => {
      // If Redis is not configured, use in-memory fallback (dev only)
      if (!redis) {
        return checkMemoryLimit(limit, token, interval);
      }

      try {
        const key = `rate_limit:${token}`;
        const now = Date.now();
        const windowStart = now - interval;

        // Get current count from Redis
        const requests = await redis.zcount(key, windowStart, now);

        // Check if within limit
        if (requests >= limit) {
          return false;
        }

        // Add current request
        await redis.zadd(key, { score: now, member: `${now}-${crypto.randomUUID()}` });

        // Set expiration to clean up old keys
        await redis.expire(key, Math.ceil(interval / 1000));

        // Remove old entries outside the window
        await redis.zremrangebyscore(key, 0, windowStart);

        return true;
      } catch (error) {
        console.error("Rate limit check failed:", error);
        // On error, allow the request (fail open for availability)
        return true;
      }
    },

    /**
     * Get remaining requests for a token
     * @param limit - Maximum requests allowed
     * @param token - Unique identifier
     * @returns number of remaining requests
     */
    remaining: async (limit: number, token: string): Promise<number> => {
      if (!redis) {
        const entry = memoryStore.get(token);
        if (!entry || entry.resetAt < Date.now()) {
          return limit;
        }
        return Math.max(0, limit - entry.count);
      }

      try {
        const key = `rate_limit:${token}`;
        const now = Date.now();
        const windowStart = now - interval;
        const count = await redis.zcount(key, windowStart, now);
        return Math.max(0, limit - count);
      } catch {
        return limit;
      }
    },
  };
}

/**
 * In-memory rate limiter fallback for development
 */
function checkMemoryLimit(limit: number, token: string, interval: number): boolean {
  const now = Date.now();
  const entry = memoryStore.get(token);

  // Clean up expired entries
  if (entry && entry.resetAt < now) {
    memoryStore.delete(token);
  }

  const current = memoryStore.get(token);

  if (!current) {
    memoryStore.set(token, { count: 1, resetAt: now + interval });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  memoryStore.set(token, current);
  return true;
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // AI endpoints: 10 requests per minute
  ai: rateLimit({ interval: 60 * 1000 }),

  // Upload endpoints: 20 requests per minute
  uploads: rateLimit({ interval: 60 * 1000 }),

  // Weather endpoints: 30 requests per minute
  weather: rateLimit({ interval: 60 * 1000 }),

  // API general: 60 requests per minute
  api: rateLimit({ interval: 60 * 1000 }),
};

/**
 * Simple synchronous sliding-window rate limiter (in-memory only).
 * Useful for quick rate limiting without Redis.
 *
 * @param key      - Unique bucket key (e.g., "ip:1.2.3.4")
 * @param limit    - Max requests in the window
 * @param windowMs - Window size in milliseconds
 */
export function simpleSlidingWindowLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (entry && entry.resetAt < now) {
    memoryStore.delete(key);
  }
  const current = memoryStore.get(key);
  if (!current) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { success: false, remaining: 0 };
  }
  current.count++;
  return { success: true, remaining: limit - current.count };
}

/**
 * Helper function to extract rate limit identifier from request
 * Prefers userId, falls back to IP address
 */
export function getRateLimitIdentifier(userId: string | null, req: Request): string {
  if (userId) return userId;

  // Fallback to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "anonymous";
  return ip;
}
