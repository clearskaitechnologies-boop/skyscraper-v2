/**
 * Rate Limiting Middleware
 *
 * @deprecated This file is deprecated. Import from '@/lib/rate-limit' instead.
 *
 * ```typescript
 * import { checkRateLimit, RATE_LIMIT_PRESETS, createRateLimitHeaders } from '@/lib/rate-limit';
 * ```
 */

// Re-export from canonical module
export {
  RATE_LIMIT_PRESETS as RATE_LIMITS,
  RATE_LIMIT_PRESETS,
  checkRateLimit,
  checkRateLimitCustom,
  createRateLimitHeaders,
  getRateLimitIdentifier,
  type RateLimitResult,
} from "@/lib/rate-limit";
