import { Ratelimit } from "@upstash/ratelimit";

import { upstash } from "@/lib/upstash";

// Initialize Redis client
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? upstash : null;

// Create rate limiters for different scenarios
export const rateLimiters = {
  // Strict rate limit for public lead forms (5 requests per minute)
  publicLeads: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit:public-leads",
      })
    : null,

  // AI endpoints rate limit (10 requests per minute per user)
  ai: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit:ai",
      })
    : null,

  // Moderate rate limit for API key generation (10 requests per hour)
  apiKeys: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "@upstash/ratelimit:api-keys",
      })
    : null,

  // General API rate limit (100 requests per minute)
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit:api",
      })
    : null,

  // Webhook endpoints (50 requests per minute)
  webhooks: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(50, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit:webhooks",
      })
    : null,
};

/**
 * Apply rate limiting to a request
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limiter - Which rate limiter to use
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(identifier: string, limiter: keyof typeof rateLimiters) {
  const ratelimit = rateLimiters[limiter];

  // If Redis is not configured, allow all requests
  if (!ratelimit) {
    console.warn(`Rate limiting not configured for ${limiter}`);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const result = await ratelimit.limit(identifier);
    return result;
  } catch (error) {
    console.error(`Rate limit check failed for ${limiter}:`, error);
    // Fail open - allow request if rate limiting fails
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return userId;

  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwarded?.split(",")[0] || realIp || "anonymous";
}
