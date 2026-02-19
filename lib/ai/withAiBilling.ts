/**
 * AI Billing Guard Middleware
 *
 * Wraps AI endpoints with billing enforcement, rate limits, and usage tracking.
 *
 * 🚧 BETA MODE ACTIVE 🚧
 * Currently in permissive mode for testing - logs usage but does NOT block.
 * Set BETA_MODE = false to activate full enforcement.
 */

import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import { checkRateLimit as checkUpstashRateLimit } from "@/lib/rate-limit";

// 🚧 BETA MODE FLAG 🚧
// true = Log everything, block nothing (testing phase)
// false = Full enforcement (production)
const BETA_MODE = true;

export interface AiBillingConfig {
  feature: string;
  costPerRequest?: number; // Token cost
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  planRequired?: "free" | "pro" | "enterprise";
}

export interface AiBillingContext {
  userId: string;
  orgId: string | null;
  feature: string;
  planType: string;
  betaMode: boolean;
}

/**
 * withAiBilling - Wraps AI route handlers with billing + limits
 *
 * @example
 * export const POST = withAiBilling(
 *   { feature: "damage_builder", costPerRequest: 10 },
 *   async (req, ctx) => {
 *     // Your AI logic here
 *     return NextResponse.json({ result: "..." });
 *   }
 * );
 */
export function withAiBilling<T = any>(
  config: AiBillingConfig,
  handler: (req: NextRequest, ctx: AiBillingContext) => Promise<NextResponse<T> | NextResponse<any>>
) {
  return async (req: NextRequest, routeParams?: any) => {
    const startTime = Date.now();

    try {
      // 1. Authenticate user
      const authResult = await requireApiAuth();
      if (authResult instanceof NextResponse) return authResult;

      const { userId, orgId } = authResult;

      // 2. Enforce Upstash Redis rate limit (always active, survives cold starts)
      const rl = await checkUpstashRateLimit(userId, "AI");
      if (!rl.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded", feature: config.feature, retryAfter: 60 },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }

      // 3. Get org plan (future: query actual subscription)
      const planType = "beta"; // For now, everyone is in beta

      // 4. Log usage (always, even in beta mode)
      console.log(`[AI-BILLING] ${config.feature}`, {
        userId,
        orgId,
        betaMode: BETA_MODE,
        timestamp: new Date().toISOString(),
      });

      // 4. Check plan limits (BETA: log warning, don't block)
      if (config.planRequired && planType !== "beta") {
        const hasAccess = checkPlanAccess(planType, config.planRequired);

        if (!hasAccess) {
          if (BETA_MODE) {
            console.warn(
              `[AI-BILLING] ⚠️  Would block: ${config.feature} requires ${config.planRequired}, user has ${planType}`
            );
            // Continue anyway in beta mode
          } else {
            return NextResponse.json(
              {
                error: "Plan upgrade required",
                feature: config.feature,
                required: config.planRequired,
                current: planType,
              },
              { status: 403 }
            );
          }
        }
      }

      // 5. Check rate limits (BETA: log warning, don't block)
      if (config.rateLimit) {
        const isRateLimited = await checkRateLimit(userId, config.feature, config.rateLimit);

        if (isRateLimited) {
          if (BETA_MODE) {
            console.warn(`[AI-BILLING] ⚠️  Would rate limit: ${config.feature} for user ${userId}`);
            // Continue anyway in beta mode
          } else {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                feature: config.feature,
                retryAfter: config.rateLimit.windowMs / 1000,
              },
              { status: 429 }
            );
          }
        }
      }

      // 6. Build context for handler
      const context: AiBillingContext = {
        userId,
        orgId,
        feature: config.feature,
        planType,
        betaMode: BETA_MODE,
      };

      // 7. Execute handler
      const response = await handler(req, context);

      // 8. Track usage (BETA: log only, future: deduct tokens)
      const durationMs = Date.now() - startTime;

      if (config.costPerRequest) {
        if (BETA_MODE) {
          console.log(`[AI-BILLING] 📊 Usage tracked (not charged): ${config.feature}`, {
            userId,
            orgId,
            cost: config.costPerRequest,
            durationMs,
          });
        } else {
          // Future: Actual token deduction
          await trackUsage({
            userId,
            orgId,
            feature: config.feature,
            cost: config.costPerRequest,
            timestamp: new Date(),
          });
        }
      }

      // 9. Add billing headers to response
      const headers = new Headers(response.headers);
      headers.set("X-AI-Feature", config.feature);
      headers.set("X-AI-Beta-Mode", BETA_MODE.toString());
      if (config.costPerRequest) {
        headers.set("X-AI-Cost", config.costPerRequest.toString());
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error: any) {
      console.error(`[AI-BILLING] Error in ${config.feature}:`, error);
      return NextResponse.json(
        { error: "Internal server error", feature: config.feature },
        { status: 500 }
      );
    }
  };
}

/**
 * Check if user's plan allows access to feature
 */
function checkPlanAccess(userPlan: string, requiredPlan: string): boolean {
  const planHierarchy = ["free", "pro", "enterprise"];
  const userLevel = planHierarchy.indexOf(userPlan);
  const requiredLevel = planHierarchy.indexOf(requiredPlan);

  return userLevel >= requiredLevel;
}

/**
 * Check rate limit for user+feature
 * (Simplified in-memory implementation - use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(
  userId: string,
  feature: string,
  limit: { maxRequests: number; windowMs: number }
): Promise<boolean> {
  const key = `${userId}:${feature}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + limit.windowMs,
    });
    return false;
  }

  if (entry.count >= limit.maxRequests) {
    return true; // Rate limited
  }

  entry.count++;
  return false;
}

/**
 * Track usage in database (future implementation)
 */
async function trackUsage(data: {
  userId: string;
  orgId: string | null;
  feature: string;
  cost: number;
  timestamp: Date;
}): Promise<void> {
  // Future: Insert into tokens_ledger or usage tracking table
  console.log("[AI-BILLING] 💰 Would deduct tokens:", data);
}

/**
 * Helper: Create simple billing config
 */
export const createAiConfig = (
  feature: string,
  options?: Partial<AiBillingConfig>
): AiBillingConfig => ({
  feature,
  costPerRequest: 10, // Default 10 tokens
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 100 requests per minute
  },
  ...options,
});
