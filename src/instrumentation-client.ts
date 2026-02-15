/**
 * ✅ UNIFIED Next.js Instrumentation Hook (Client)
 * Consolidates: BUILD_PHASE fetch guards + Sentry client init + router tracking
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from "@sentry/nextjs";

// ═══════════════════════════════════════════════════════════════════════
// 1. BUILD_PHASE Network Fetch Guard (Client-side)
// ═══════════════════════════════════════════════════════════════════════
// During static generation we stub external fetch calls to avoid ECONNRESET noise
if (typeof window !== "undefined" && process.env.BUILD_PHASE) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const isExternal = /^https?:\/\//.test(url) && !url.includes(window.location.origin);
      if (isExternal) {
        return new Response(JSON.stringify({ ok: true, buildPhaseStub: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return originalFetch(input, init);
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, buildPhaseError: String(e) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 2. Sentry Router Navigation Tracking
// ═══════════════════════════════════════════════════════════════════════
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// ═══════════════════════════════════════════════════════════════════════
// 3. Client-Side Register Hook
// ═══════════════════════════════════════════════════════════════════════
export async function register() {
  // Only run in browser
  if (typeof window === "undefined") return;

  // Soft Node version advisory (non-blocking)
  try {
    const v = process.version;
    const major = parseInt(v.replace(/^v/, "").split(".")[0], 10);
    if (major < 22) {
      console.warn(`[runtime] Recommended Node >=22, detected Node ${v}. Non-blocking warning.`);
    }
  } catch {}

  // Only initialize Sentry in production (or when DSN is set)
  if (process.env.NODE_ENV === "production") {
    const { init, replayIntegration } = await import("@sentry/nextjs");

    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

    init({
      dsn,
      enabled: !!dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend(event) {
        // Filter out health check and asset noise
        const url = event.request?.url;
        if (url && (url.includes("/api/health") || url.includes("/_next/"))) {
          return null;
        }
        return event;
      },
    });
  }
}
