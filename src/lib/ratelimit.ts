/**
 * Rate Limiting Configuration
 * 
 * Uses Upstash Redis for distributed rate limiting across serverless functions.
 * Limits: 10 requests per minute per user for AI endpoints
 */

import { Ratelimit } from "@upstash/ratelimit";

import { upstash } from "@/lib/upstash";

// Only create rate limiter if Redis credentials are available
let redis: any | null = null;
let ratelimiter: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = upstash;

  ratelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
}

/**
 * Check if a user has exceeded their rate limit
 * 
 * @param userId - The user ID to check rate limits for
 * @param identifier - Optional additional identifier (e.g., 'claim-writer', 'estimate-export')
 * @returns Object with success boolean and limit info
 */
export async function checkRateLimit(
  userId: string,
  identifier?: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If rate limiter not configured (dev environment), allow all requests
  if (!ratelimiter) {
    return {
      success: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 60000,
    };
  }

  const key = identifier ? `${userId}:${identifier}` : userId;
  const { success, limit, remaining, reset } = await ratelimiter.limit(key);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Format rate limit error message
 */
export function getRateLimitError(reset: number): string {
  const resetDate = new Date(reset);
  const now = new Date();
  const secondsUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / 1000);
  
  return `Rate limit exceeded. Please try again in ${secondsUntilReset} seconds.`;
}
