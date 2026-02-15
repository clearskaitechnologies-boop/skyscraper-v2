# Contributing Guide: Redis Usage

## Why This Exists

Redis is **optional infrastructure**. The application must function and build without it. Contributors follow this guide to preserve resilience and prevent regressions that reintroduce build‑time failures.

## Golden Rules

1. Use helpers only: `getRedisSafely()`, `requireRedisOrJson()`, `maybeCache()`, `maybeRateLimit()`, `safeFetchWithCache()`.
2. Guard every call: `const redis = getRedisSafely(); if (redis) { await redis.get(key); }`.
3. Never throw because Redis is missing.
4. Strict mode endpoints return JSON error—not an exception.
5. Do not instantiate `new Redis()` directly.
6. No top-level awaits or side effects relying on Redis.

## Helper Reference

| Helper                               | Purpose                      | Behavior When Redis Missing              |
| ------------------------------------ | ---------------------------- | ---------------------------------------- |
| `getRedisSafely()`                   | Acquire singleton or `null`  | Returns `null` (no throw)                |
| `requireRedisOrJson()`               | Enforce strict mode endpoint | Returns `{ errorResponse }` (status 500) |
| `maybeCache(key, fn, ttl)`           | Cached compute               | Runs `fn`; no persistence                |
| `maybeRateLimit(id, cfg)`            | Rate limiting                | Always allow                             |
| `safeFetchWithCache(url, opts, ttl)` | Cached fetch                 | Performs raw fetch                       |

## Optional vs Strict Endpoints

**Optional examples (must work without Redis):**

- Geometry detection, vision analysis
- Proposal & claim writers, appeals / rebuttals
- Weather, depreciation, enrichment

**Strict examples (only if truly dependent):**

- Future: queued video rendering with Redis-backed progress
- Future: multi-step agent sessions or collaborative locks

If you turn an optional feature strict, update BOTH `REDIS_SAFETY_CONTRACT.md` and this file.

## Patterns

### Optional Cache

```ts
import { maybeCache } from "@/lib/redis";
const data = await maybeCache(`claim:${claimId}:summary`, () => buildSummary(), 600);
return NextResponse.json({ data });
```

### Strict Endpoint

```ts
import { requireRedisOrJson } from "@/lib/redis";
export async function POST() {
  const { errorResponse, redis } = requireRedisOrJson();
  if (errorResponse) return errorResponse;
  await redis.set(`lock:video:${jobId}`, Date.now().toString(), "EX", 300);
  return NextResponse.json({ ok: true });
}
```

### Rate Limit

```ts
const rl = await maybeRateLimit(`user:${userId}`, { limit: 60, window: "1m" });
if (!rl.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
```

### Safe Fetch w/ Cache

```ts
const json = await safeFetchWithCache(`https://api.weather.com/point/${lat},${lon}`, {}, 900);
```

## Forbidden

- `throw new Error("Missing Upstash")`
- Direct `new Redis(...)` in a route/module
- Assuming Redis exists for core logic or auth
- Failing a build because env vars are absent
- Writing ratelimiter logic outside `maybeRateLimit`

## Testing Locally

### Without Redis

Unset vars:

```bash
unset UPSTASH_REDIS_REST_URL
unset UPSTASH_REDIS_REST_TOKEN
pnpm build && pnpm dev
```

Hit endpoints; they must respond (maybe slower).

### With Redis

Set vars then re-run:

```bash
export UPSTASH_REDIS_REST_URL=...
export UPSTASH_REDIS_REST_TOKEN=...
pnpm build && pnpm dev
```

### Strict Mode

Confirm strict endpoint returns:

```json
{ "error": "Redis is required for this endpoint." }
```

With HTTP 500 when Redis disabled.

## Adding New Redis Features

1. Decide optional vs strict.
2. Optional: wrap operations with `if (redis)` / `maybeCache`.
3. Strict: start handler with `requireRedisOrJson()`.
4. Update docs classification.
5. Provide degraded experience description in PR.

## PR Checklist

- [ ] No forbidden patterns
- [ ] Helper usage only
- [ ] Optional endpoints degrade
- [ ] Strict endpoints use helper
- [ ] Tests run with and without Redis
- [ ] Docs classification updated if needed

## Troubleshooting

| Symptom                            | Likely Cause                    | Fix                      |
| ---------------------------------- | ------------------------------- | ------------------------ |
| Build fails on missing env         | Direct Redis instantiation      | Refactor to helper       |
| 500 error instead of graceful skip | Strict helper on optional route | Switch pattern           |
| Rate limiter crashing              | Direct `Ratelimit` usage        | Use `maybeRateLimit`     |
| Cache never hits                   | TTL too low or key mismatch     | Inspect key construction |

## Future Extensions

- Metrics: count skipped cache ops when Redis absent.
- Feature flags for progressive strict mode adoption.
- Distributed locks built atop same safety helpers.

Maintain resilience first—performance enhancements subordinate to build stability.
