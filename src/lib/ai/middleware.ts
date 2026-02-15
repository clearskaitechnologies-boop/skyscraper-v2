/**
 * AI Protection Middleware
 *
 * Unified middleware for all AI endpoints providing:
 * - Authentication verification
 * - Rate limiting (per org/user)
 * - Plan gating (feature checks)
 * - Usage tracking (token metering)
 *
 * Created: January 2026 - 100% Operational Push
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// BETA: Usage tracking disabled - all AI features are free during beta
// import { trackAiUsage } from "@/lib/ai/trackUsage";
import { checkRateLimit, getRateLimitError } from "@/lib/ratelimit";

export interface AIProtectionOptions {
  /** Feature name for usage tracking (e.g., 'damage-analysis', 'report-generation') */
  feature: string;
  /** Estimated tokens per request (for pre-flight checks) */
  estimatedTokens?: number;
  /** Whether this feature requires Pro plan */
  requiresPro?: boolean;
  /** Custom rate limit identifier suffix */
  rateLimitSuffix?: string;
  /** Skip rate limiting (for internal endpoints) */
  skipRateLimit?: boolean;
  /** Skip usage tracking (for read-only endpoints) */
  skipUsageTracking?: boolean;
}

export interface AIContext {
  userId: string;
  orgId: string | null;
  orgSlug: string | null;
}

export type AIHandler = (request: NextRequest, context: AIContext) => Promise<NextResponse>;

/**
 * Wrap an AI endpoint with full protection:
 * 1. Auth check
 * 2. Rate limit check
 * 3. Plan gating (optional)
 * 4. Execute handler
 * 5. Track usage on success
 */
export function withAIProtection(handler: AIHandler, options: AIProtectionOptions) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // 1. Authentication check
    const { userId, orgId, orgSlug } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - authentication required",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    // 2. Rate limit check (unless skipped)
    if (!options.skipRateLimit) {
      const identifier = orgId || userId;
      const rateLimitKey = options.rateLimitSuffix
        ? `ai:${options.feature}:${identifier}`
        : `ai:${identifier}`;

      const rateLimit = await checkRateLimit(rateLimitKey, options.rateLimitSuffix);

      if (!rateLimit.success) {
        return NextResponse.json(
          {
            success: false,
            error: getRateLimitError(rateLimit.reset),
            code: "RATE_LIMITED",
            retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
              "X-RateLimit-Limit": String(rateLimit.limit),
              "X-RateLimit-Remaining": String(rateLimit.remaining),
              "X-RateLimit-Reset": String(rateLimit.reset),
            },
          }
        );
      }
    }

    // 3. Plan gating (if required)
    if (options.requiresPro && orgId) {
      const hasPro = await checkProPlan(orgId);
      if (!hasPro) {
        return NextResponse.json(
          {
            success: false,
            error: "Pro plan required for this feature",
            code: "PLAN_REQUIRED",
            requiredPlan: "pro",
          },
          { status: 402 }
        );
      }
    }

    // 4. Execute the handler
    const context: AIContext = { userId, orgId, orgSlug };
    let response: NextResponse;

    try {
      response = await handler(request, context);
    } catch (error: any) {
      console.error(`[AI] ${options.feature} error:`, error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "AI processing failed",
          code: "AI_ERROR",
        },
        { status: 500 }
      );
    }

    // 5. Track usage on success (BETA: disabled for open testing)
    // All AI features are free during beta - no usage tracking
    // Re-enable when ready for production billing:
    // if (!options.skipUsageTracking && orgId && response.ok) {
    //   try {
    //     await trackAiUsage({
    //       orgId,
    //       feature: options.feature,
    //       tokens: options.estimatedTokens || 100,
    //       metadata: {
    //         userId,
    //         timestamp: new Date().toISOString(),
    //         endpoint: request.nextUrl.pathname,
    //       },
    //     });
    //   } catch (trackError) {
    //     console.error(`[AI] Usage tracking failed for ${options.feature}:`, trackError);
    //   }
    // }

    return response;
  };
}

/**
 * Check if an org has Pro plan access
 */
async function checkProPlan(orgId: string): Promise<boolean> {
  try {
    // Import dynamically to avoid circular dependencies
    const { hasFeature } = await import("@/lib/features");
    return await hasFeature(orgId, "ai_features");
  } catch (error) {
    console.error("[AI] Plan check failed:", error);
    // Fail open during beta - allow access
    return true;
  }
}

/**
 * Simple auth check for endpoints that just need authentication
 * without full rate limiting/billing (e.g., status endpoints)
 */
export async function requireAuth(): Promise<{
  authenticated: boolean;
  userId?: string;
  orgId?: string | null;
  error?: NextResponse;
}> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return {
      authenticated: false,
      error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { authenticated: true, userId, orgId };
}

/**
 * Rate limit check helper for manual use
 */
export async function checkAIRateLimit(
  identifier: string,
  feature?: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = feature ? `ai:${feature}:${identifier}` : `ai:${identifier}`;
  const result = await checkRateLimit(key);

  return {
    allowed: result.success,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
  };
}
