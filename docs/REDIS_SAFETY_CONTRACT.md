# Redis Safety Contract

## Purpose

Redis MUST NEVER cause a build failure. Upstash MUST NEVER be initialized at module load in a way that throws. The application MUST fully build and run in a degraded mode with Redis completely disabled (no env vars set). All Redis usage MUST be lazy and null-safe.

## Core Principles

1. Lazy Initialization Only: Redis client created on first access (`getRedisSafely()` / `createRedisClientSafely()`).
2. Null-Safe Everywhere: Every usage guarded: `const redis = getRedisSafely(); if (redis) { ... }`.
3. Fail-Open Default: Absence of Redis NEVER blocks optional features (caching, rate limiting, inference memoization).
4. No Top-Level Effects: No top-level `new Redis(...)`, no top-level awaits, no direct ratelimit construction, no throwing on missing envs.
5. Predictable Degradation: When Redis is absent, features skip caching & rate limiting silently (optionally lightweight log).
6. Strict Mode Is Opt-In: Endpoints that truly REQUIRE Redis use `requireRedisOrJson()` returning structured JSON error—never throw.
7. Build Parity: Build output MUST be identical (besides incidental logs) with or without Redis env vars.

## Mandatory Rules

| Rule | Description                                              | Enforcement                              |
| ---- | -------------------------------------------------------- | ---------------------------------------- |
| R1   | Never access `process.env.UPSTASH_*` outside helper file | Code Review / Lint                       |
| R2   | All Redis calls behind `if (redis)`                      | CI / Lint Patterns                       |
| R3   | No thrown errors for missing Redis                       | CI Grep ("Missing Upstash")              |
| R4   | Rate limiting must degrade gracefully                    | Wrapper `maybeRateLimit()`               |
| R5   | Caching must degrade gracefully                          | Wrapper `maybeCache()`                   |
| R6   | Job orchestration strict only if truly dependent         | Use `requireRedisOrJson()`               |
| R7   | Helpers single source of truth                           | `src/lib/redis.ts`, `src/lib/upstash.ts` |

## Optional vs Strict Classification

**Optional (MUST NOT fail without Redis):**

- Vision classification & geometry extraction
- Scope prediction / materials / lifecycle / damage segmentation
- Claim summarization & appeals / rebuttals
- AI prompt assembly & proposal generation
- Weather enrichment & depreciation calculations
- Inference caching, dedupe, perf stats

**Strict (MAY require Redis; use strict helper):**

- Long-running video generation jobs (future queue / progress)
- Distributed async agent workflows / multi-step sessions
- High-frequency collaborative editing locks (future)

If a feature migrates to strict dependency, update this contract and contributing guide.

## Strict Mode Pattern

Use only when feature cannot function meaningfully without Redis state (queue, lock, coordination):

```ts
import { requireRedisOrJson } from "@/lib/redis";

export async function POST() {
  const { errorResponse, redis } = requireRedisOrJson();
  if (errorResponse) return errorResponse; // status 500 JSON error
  // redis guaranteed non-null here
  // ... perform operations requiring redis ...
  return NextResponse.json({ ok: true });
}
```

Never throw. Never import raw `Redis` directly in a route. Optional endpoints always degrade gracefully.

## Rate Limiting

Use `maybeRateLimit(identifier, { limit, window })`. Without Redis it returns an "allow" decision. DO NOT instantiate `@upstash/ratelimit` directly in routes.

## Caching

Use `maybeCache(key, producerFn, ttlSeconds?)`. When Redis absent the producer runs and returns value without persistence.

## Safe Fetch + Cache

Use `safeFetchWithCache(url, opts, ttl)` for idempotent GETs. When Redis absent a direct fetch occurs.

## Anti-Patterns (Forbidden)

- `new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!... })` at top-level
- Throwing: `throw new Error("Missing Upstash Redis configuration")`
- Unconditional `await redis.get(...)` without null guard
- Creating a ratelimiter outside a helper
- Depending on Redis for core authorization paths

## Testing Guidelines

1. Disabled Mode: Unset `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`; run `pnpm build` & smoke test.
2. Enabled Mode: Set valid env vars; confirm caching, rate limiting operate.
3. Strict Endpoint: Without vars expect `{"error":"Redis is required for this endpoint."}` (HTTP 500) not throw.
4. Drift Scan: Grep for `new Redis(` or "Missing Upstash".

## Migration / Future-Proofing

- Feature flags gating strict mode (`REDIS_STRICT_MODE`).
- Wrap queue/lock abstractions in helpers using null-safe access.
- Telemetry counters (e.g., skipped cache ops) only when Redis exists.

## Enforcement Checklist (PR Template)

- [ ] No new direct Redis instantiation outside helpers
- [ ] All Redis calls guarded
- [ ] Optional endpoints degrade gracefully
- [ ] Strict endpoints use `requireRedisOrJson()`
- [ ] Build verified without Redis
- [ ] Docs updated if classification changed

## Quick Reference (Cheat Sheet)

```ts
// Optional cache
const result = await maybeCache(`geom:${claimId}`, () => computeGeometry(), 300);

// Rate limit
const rl = await maybeRateLimit(`user:${userId}`, { limit: 60, window: "1m" });
if (!rl.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

// Strict mode
const { errorResponse, redis } = requireRedisOrJson();
if (errorResponse) return errorResponse;
await redis.set(key, value);
```

---

Maintained by Engineering. Update whenever an optional endpoint becomes strictly dependent on Redis.
