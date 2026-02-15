/**
 * Rate Limiting Utilities
 *
 * Simple in-memory rate limiter for edge functions.
 * For production scale, consider using:
 * - Upstash Redis
 * - Cloudflare KV
 * - Supabase table with cleanup
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

// In-memory store (per edge function instance)
const buckets = new Map<string, RateLimitBucket>();

// Cleanup old buckets every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (now > bucket.resetAt) {
        buckets.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Check rate limit for a given key
 *
 * @param key - Unique identifier (e.g., "je-sync:user123:192.168.1.1")
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);

  // Create new bucket if doesn't exist or expired
  if (!bucket || now > bucket.resetAt) {
    bucket = {
      count: 0,
      resetAt: now + windowMs,
    };
    buckets.set(key, bucket);
  }

  // Increment count
  bucket.count++;

  const allowed = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);

  return {
    allowed,
    remaining,
    resetAt: bucket.resetAt,
    limit,
  };
}

/**
 * Create a rate limit key from user ID and IP
 */
export function createRateLimitKey(functionName: string, userId: string, ip: string): string {
  return `${functionName}:${userId}:${ip}`;
}
