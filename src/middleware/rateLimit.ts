/**
 * Rate Limiting Middleware
 *
 * Prevents abuse by limiting requests per IP/user
 * 100 requests per minute by default
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block after limit exceeded (seconds)
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Default rate limit configs by route type
 */
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    points: 100,
    duration: 60, // 100 requests per minute
  },
  auth: {
    points: 10,
    duration: 60, // 10 auth attempts per minute
    blockDuration: 300, // Block for 5 minutes after
  },
  upload: {
    points: 20,
    duration: 60, // 20 uploads per minute
  },
  api: {
    points: 100,
    duration: 60, // 100 API calls per minute
  },
  mutation: {
    points: 50,
    duration: 60, // 50 mutations per minute
  },
};

/**
 * Get rate limit key from request
 */
function getRateLimitKey(req: NextRequest, keyType: string = "ip"): string {
  if (keyType === "ip") {
    // Get IP from various headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";
    return `ip:${ip}`;
  }

  if (keyType === "user") {
    // Get user ID from auth (implement based on your auth system)
    const userId = req.headers.get("x-user-id") || "anonymous";
    return `user:${userId}`;
  }

  return "unknown";
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  req: NextRequest,
  config?: Partial<RateLimitConfig>,
  keyType: string = "ip"
): Promise<{ allowed: boolean; remaining: number; resetAt: number; retryAfter?: number }> {
  const key = getRateLimitKey(req, keyType);
  const now = Date.now();

  // Merge config with defaults
  const finalConfig: RateLimitConfig = {
    ...RATE_LIMIT_CONFIGS.default,
    ...config,
  };

  let entry = rateLimitStore.get(key);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Initialize or reset entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + finalConfig.duration * 1000,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > finalConfig.points) {
    if (finalConfig.blockDuration) {
      entry.blockedUntil = now + finalConfig.blockDuration * 1000;
    }
    rateLimitStore.set(key, entry);

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: finalConfig.blockDuration || Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  // Update store
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: finalConfig.points - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(config?: Partial<RateLimitConfig>, keyType: string = "ip") {
  return async (req: NextRequest) => {
    const result = await checkRateLimit(req, config, keyType);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfter || 60),
            "X-RateLimit-Limit": String(config?.points || 100),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetAt),
          },
        }
      );
    }

    return null; // Allow request to proceed
  };
}

/**
 * Apply rate limit to specific route
 */
export async function applyRateLimit(
  req: NextRequest,
  routeType: keyof typeof RATE_LIMIT_CONFIGS = "default"
): Promise<NextResponse | null> {
  const config = RATE_LIMIT_CONFIGS[routeType] || RATE_LIMIT_CONFIGS.default;
  const result = await checkRateLimit(req, config);

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Rate limit exceeded",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfter || 60),
        },
      }
    );
  }

  return null;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  req: NextRequest,
  config?: Partial<RateLimitConfig>
): Record<string, string> {
  const key = getRateLimitKey(req);
  const entry = rateLimitStore.get(key);
  const finalConfig = { ...RATE_LIMIT_CONFIGS.default, ...config };

  if (!entry) {
    return {
      "X-RateLimit-Limit": String(finalConfig.points),
      "X-RateLimit-Remaining": String(finalConfig.points),
      "X-RateLimit-Reset": String(Date.now() + finalConfig.duration * 1000),
    };
  }

  return {
    "X-RateLimit-Limit": String(finalConfig.points),
    "X-RateLimit-Remaining": String(Math.max(0, finalConfig.points - entry.count)),
    "X-RateLimit-Reset": String(entry.resetAt),
  };
}
