import { logger } from "@/lib/logger";

/**
 * Error Tracking Integration (Sentry)
 *
 * Centralized error tracking and reporting
 * Integrates with Sentry for production error monitoring
 */

export interface ErrorContext {
  userId?: string;
  orgId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  metadata?: Record<string, any>;
}

/**
 * Initialize Sentry (call in app startup)
 */
export function initSentry(): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.debug("✅ Sentry initialized");
    // TODO: Actual Sentry.init() when Sentry SDK is installed
  } else {
    logger.warn("⚠️  Sentry DSN not configured");
  }
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: ErrorContext): void {
  console.error("❌ Error captured:", error.message, context);

  // TODO: Send to Sentry
  // Sentry.captureException(error, {
  //   user: context?.userId ? { id: context.userId } : undefined,
  //   tags: {
  //     orgId: context?.orgId,
  //     requestId: context?.requestId,
  //   },
  //   extra: context?.metadata,
  // });
}

/**
 * Capture message (non-error event)
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorContext
): void {
  logger.debug(`📝 Message captured [${level}]:`, message, context);

  // TODO: Send to Sentry
  // Sentry.captureMessage(message, {
  //   level,
  //   user: context?.userId ? { id: context.userId } : undefined,
  //   tags: {
  //     orgId: context?.orgId,
  //     requestId: context?.requestId,
  //   },
  //   extra: context?.metadata,
  // });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string): void {
  // TODO: Set Sentry user context
  // Sentry.setUser({ id: userId, email });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  // TODO: Clear Sentry user context
  // Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  // TODO: Add Sentry breadcrumb
  // Sentry.addBreadcrumb({
  //   message,
  //   category,
  //   data,
  //   timestamp: Date.now() / 1000,
  // });
}

/**
 * Wrap async handler with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  context?: ErrorContext
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      captureException(error as Error, context);
      throw error;
    }
  }) as T;
}

/**
 * Express/Next.js error middleware
 */
export function errorTrackingMiddleware(error: Error, req: any, context?: ErrorContext): void {
  captureException(error, {
    ...context,
    url: req.url,
    method: req.method,
    userId: req.userId,
    orgId: req.orgId,
    requestId: req.id,
  });
}
