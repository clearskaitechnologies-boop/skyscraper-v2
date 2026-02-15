/**
 * TEST #133 — Rate limiter utilities
 *
 * Covers:
 *   • rateLimit()  — in-memory fallback path (no Redis env vars)
 *   • simpleSlidingWindowLimit() — synchronous sliding window
 *
 * Redis is NOT configured in these tests so every call exercises the
 * in-memory code paths (which is the intended dev/test behaviour).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

// Ensure Redis env vars are absent so the module initialises without Redis
beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

// We need to isolate each test because the module-level memoryStore
// persists between calls within the same import.  Use dynamic import
// + resetModules to get a fresh module per test when needed.

/* ------------------------------------------------------------------ */
/*  rateLimit() — async in-memory fallback                             */
/* ------------------------------------------------------------------ */
describe("rateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows requests under the limit", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");

    const limiter = rateLimit({ interval: 60_000 });

    const r1 = await limiter.check(3, "user-under-limit");
    const r2 = await limiter.check(3, "user-under-limit");
    const r3 = await limiter.check(3, "user-under-limit");

    expect(r1).toBe(true);
    expect(r2).toBe(true);
    expect(r3).toBe(true);
  });

  it("blocks the request that exceeds the limit", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");

    const limiter = rateLimit({ interval: 60_000 });

    await limiter.check(2, "user-over");
    await limiter.check(2, "user-over");
    const blocked = await limiter.check(2, "user-over");

    expect(blocked).toBe(false);
  });

  it("resets after the time window expires", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");

    const limiter = rateLimit({ interval: 100 }); // 100 ms window

    await limiter.check(1, "user-expiry");
    const blocked = await limiter.check(1, "user-expiry");
    expect(blocked).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 150));

    const allowed = await limiter.check(1, "user-expiry");
    expect(allowed).toBe(true);
  });

  it("tracks different tokens independently", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");

    const limiter = rateLimit({ interval: 60_000 });

    await limiter.check(1, "alice");
    const aliceBlocked = await limiter.check(1, "alice");
    const bobAllowed = await limiter.check(1, "bob");

    expect(aliceBlocked).toBe(false);
    expect(bobAllowed).toBe(true);
  });

  it("remaining() returns correct count", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");

    const limiter = rateLimit({ interval: 60_000 });

    const before = await limiter.remaining(5, "user-rem");
    expect(before).toBe(5);

    await limiter.check(5, "user-rem");
    await limiter.check(5, "user-rem");

    const after = await limiter.remaining(5, "user-rem");
    expect(after).toBe(3);
  });
});

/* ------------------------------------------------------------------ */
/*  simpleSlidingWindowLimit() — synchronous helper                    */
/* ------------------------------------------------------------------ */
describe("simpleSlidingWindowLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows requests under the limit and returns remaining count", async () => {
    const { simpleSlidingWindowLimit } = await import("@/lib/rate-limit");

    const r1 = simpleSlidingWindowLimit("sw-under", 3, 60_000);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = simpleSlidingWindowLimit("sw-under", 3, 60_000);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks when limit is exceeded", async () => {
    const { simpleSlidingWindowLimit } = await import("@/lib/rate-limit");

    simpleSlidingWindowLimit("sw-over", 2, 60_000);
    simpleSlidingWindowLimit("sw-over", 2, 60_000);
    const r3 = simpleSlidingWindowLimit("sw-over", 2, 60_000);

    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const { simpleSlidingWindowLimit } = await import("@/lib/rate-limit");

    simpleSlidingWindowLimit("sw-exp", 1, 100);
    const blocked = simpleSlidingWindowLimit("sw-exp", 1, 100);
    expect(blocked.success).toBe(false);

    await new Promise((r) => setTimeout(r, 150));

    const allowed = simpleSlidingWindowLimit("sw-exp", 1, 100);
    expect(allowed.success).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  getRateLimitIdentifier() — helper                                  */
/* ------------------------------------------------------------------ */
describe("getRateLimitIdentifier", () => {
  it("returns userId when present", async () => {
    const { getRateLimitIdentifier } = await import("@/lib/rate-limit");

    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });

    expect(getRateLimitIdentifier("user_123", req)).toBe("user_123");
  });

  it("falls back to IP when userId is null", async () => {
    const { getRateLimitIdentifier } = await import("@/lib/rate-limit");

    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "9.8.7.6, 1.1.1.1" },
    });

    expect(getRateLimitIdentifier(null, req)).toBe("9.8.7.6");
  });

  it("returns 'anonymous' when no userId and no IP header", async () => {
    const { getRateLimitIdentifier } = await import("@/lib/rate-limit");

    const req = new Request("https://example.com");

    expect(getRateLimitIdentifier(null, req)).toBe("anonymous");
  });
});
