"use client";

/**
 * Client-safe analytics module for browser-side tracking
 * Use this in Client Components that need to track events
 */
export function trackEvent(name: string, props?: Record<string, unknown>) {
  try {
    // Send to analytics API endpoint
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ name, props, ts: Date.now() }),
    }).catch(() => {
      // Silent fail - don't break user experience if analytics fails
    });
  } catch {
    // No-op in case of error
  }
}

/**
 * Track subscription completion event
 */
export function trackSubscriptionCompleted(
  planKey: string,
  amount: number,
  sessionId: string
) {
  trackEvent("subscription_completed", {
    planKey,
    amount,
    sessionId,
  });
}
