# 🏗️ MASTER TODO — SkaiScraper 10K-User Readiness & CRM Migration Sprint

> **Updated**: 2026-02-16 · **Platform**: SkaiScraper v2.1.0
> **Billing**: $80/seat/month · Stripe: `prod_Tylw6eipXQDDDS` / `price_1T0oOREmf7hVRjVVCdV7CRzU`
> **Scale**: 278 Prisma models · 750 API routes · 6,476-line schema · 722 DB indexes

---

## 📊 Platform Health Snapshot

| Metric                | Count                | Risk        | Target                           |
| --------------------- | -------------------- | ----------- | -------------------------------- |
| Prisma models         | 278                  | ⚠️ High     | Audit → < 250                    |
| API routes            | 750                  | ⚠️ High     | Categorize + deprecation headers |
| `as any` casts        | 746                  | 🔴 Critical | < 200                            |
| `console.*` stmts     | 3,908                | ⚠️ High     | < 500                            |
| `TODO/FIXME` markers  | 302                  | 🟡 Medium   | < 100                            |
| `@deprecated` refs    | 65                   | 🟡 Medium   | 0                                |
| OpenAI instantiations | 20+ bypass singleton | 🔴 Critical | 1 (singleton)                    |
| Rate limiter files    | 5 (all in-memory)    | 🔴 Critical | 1 (Redis-backed)                 |
| Health routes         | 5                    | 🟡 Medium   | 1 canonical                      |
| Cron routes           | 7                    | 🟢 OK       | —                                |

---

## ✅ COMPLETED — Prior Sprints

<details>
<summary>Token/Credit Purge (14/14 done)</summary>

- [x] All three token systems removed (TokenWallet, usage_tokens, tokens_ledger)
- [x] Prisma schema: token models deleted
- [x] All API routes: token guards stripped (~25 routes)
- [x] All components: token UI removed (~15 components)
- [x] Webhook: duplicate cases merged, zero token branches
- [x] Marketing Pricing: rewritten to single $80/seat card
- [x] `requireActiveSubscription.ts` guard created
- [x] `env.d.ts`: legacy tier price IDs removed
- [x] Referrals: simplified to 30-day extension only
- [x] "Flat pricing" → "Transparent pricing"
- [x] "Dominus AI" → "SkaiScraper AI" in marketing
- [x] Old billing page deleted, crm-tokens deleted, TokensBadge deleted
- [x] Build passes clean (673 static pages, exit 0)
</details>

<details>
<summary>23-Item Hardening Sprint (22/23 done — commit 610c40e)</summary>

- [x] Pipeline move fix, dashboard stats, leaderboard, SITE_URL
- [x] Claim invite links, client attach, message flow, share button
- [x] Templates flash, weather SelectItem, button styles, depreciation
- [x] Measurements, avatar upload, uploaders audit, DamageSection wiring
- [x] Trades dropdown, Weather Hub deletion, weather analytics auth
- [x] Console.log cleanup: -154 lines across 7 top API routes
- [x] `as any` audit — remaining casts are pragmatic (Prisma JSON / catch blocks)
</details>

---

## � PHASE 1 — CRITICAL INFRASTRUCTURE (Week 1-2)

_Blocks 10K-user readiness. Do first._

### 1.1 — Fix OpenAI Lazy Initialization (Singleton Enforcement)

**Status**: `src/lib/ai/client.ts` has a proper `getClient()` singleton BUT also a contradictory
`export const openai = new OpenAI(...)` that eagerly instantiates at module load.
20+ API routes still create their own `new OpenAI()` — cold-start penalty, memory waste, leaked keys.

- [ ] **1.1.1** Remove legacy eager `export const openai` from `src/lib/ai/client.ts`
- [ ] **1.1.2** Export clean `getOpenAI()` as the ONLY way to get an OpenAI client
- [ ] **1.1.3** Migrate all 20+ files to `import { getOpenAI } from "@/lib/ai/client"`:
  - `api/assistant/query/route.ts`
  - `api/mockups/generate/route.ts`
  - `api/ai/assistant/route.ts`
  - `api/ai/inspect/route.ts`
  - `api/ai/chat/route.ts`
  - `api/ai/retail-assistant/route.ts`
  - `api/ai/claim-assistant/route.ts`
  - `api/ai/vision/selftest/route.ts`
  - `api/ai/supplement/[claimId]/route.ts`
  - `api/ai/supplement/analyze/route.ts`
  - `api/ai/estimate/[claimId]/route.ts`
  - `api/mockup/generate/route.ts`
  - `api/ask-dominus/route.ts`
  - `api/reports/compose/route.ts`
  - `api/claims/[claimId]/ai/route.ts` (×2 instances)
  - `api/claims/[claimId]/ai/actions/route.ts`
  - `api/claims/parse-scope/route.ts`
  - `lib/denial/appealEngine.ts`
  - `lib/ai/video/createVideoFromScript.ts`
- [ ] **1.1.4** Add ESLint `no-restricted-syntax` rule: ban `new OpenAI(` outside `client.ts`

### 1.2 — Consolidate Rate Limiters → Single Redis-Backed File

**Status**: 5 separate rate limiter files, all in-memory `Map`-based.
**Problem**: At 10K users across Vercel serverless instances, in-memory state is **per-isolate** — rate limits don't share across function invocations. Abuse goes undetected.

| File                              | Status                       |
| --------------------------------- | ---------------------------- |
| `src/lib/rate-limit.ts`           | Primary (AI routes use this) |
| `src/lib/ratelimit.ts`            | Duplicate                    |
| `src/lib/rateLimiter.ts`          | Another variant              |
| `src/lib/middleware/rateLimit.ts` | Middleware-specific          |
| `src/lib/security/ratelimit.ts`   | Security-focused             |

- [ ] **1.2.1** Audit all 5 files — identify canonical interface
- [ ] **1.2.2** Consolidate to single `src/lib/rate-limit.ts` with presets: `AI`, `API`, `WEBHOOK`, `AUTH`, `MIGRATION`
- [ ] **1.2.3** Add **Upstash Redis** adapter (falls back to in-memory for dev)
- [ ] **1.2.4** Add rate-limit response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- [ ] **1.2.5** Delete 4 redundant files, update all imports
- [ ] **1.2.6** Add rate-limit preset for migration API (prevent runaway imports)

### 1.3 — Migration Tracking Prisma Models

**Status**: `migration-engine.ts` uses raw SQL `app.migration_logs` — NOT in Prisma schema.
**Problem**: No per-record tracking, no rollback, no resume, no field-level audit.

- [ ] **1.3.1** Add `MigrationJob` model to `prisma/schema.prisma`:
  - Fields: `id`, `orgId`, `userId`, `source` (acculynx/jobnimbus/csv), `status`, `totalRecords`, `importedRecords`, `skippedRecords`, `errorRecords`, `stats` (Json), `errors` (Json), `config` (Json, encrypted), `startedAt`, `completedAt`, `createdAt`, `updatedAt`
  - Relations: `org → Org`, `items → MigrationItem[]`
  - Indexes: `[orgId, source]`, `[status]`
- [ ] **1.3.2** Add `MigrationItem` model:
  - Fields: `id`, `migrationId`, `entityType`, `externalId`, `internalId`, `status`, `errorMessage`, `rawData` (Json), `createdAt`
  - Unique: `[migrationId, entityType, externalId]`
  - Indexes: `[migrationId, entityType]`, `[externalId]`
- [ ] **1.3.3** Run `prisma migrate dev --name add_migration_tracking`
- [ ] **1.3.4** Refactor `migration-engine.ts` to use Prisma models (delete raw SQL)
- [ ] **1.3.5** Add `externalId` + `externalSource` to `claims` model (contacts/properties/leads/jobs have them; claims don't)

### 1.4 — Database Connection Pooling

**Status**: Default Prisma connection. At 10K users = 100s concurrent connections.
**Problem**: Supabase PostgreSQL connection limit exhaustion.

- [ ] **1.4.1** Enable Prisma Accelerate or PgBouncer
- [ ] **1.4.2** Add `connectionLimit` to Prisma datasource
- [ ] **1.4.3** Audit long-running queries in migration engine — add `take` limits + cursor pagination
- [ ] **1.4.4** Add `statement_timeout` to `$queryRawUnsafe` calls

---

## 🟠 PHASE 2 — CRM MIGRATION ENGINES (Week 2-3)

_AccuLynx engine exists (80% done). JobNimbus needs building from scratch._

### 2.1 — Harden AccuLynx Migration Engine

**Existing infrastructure**:

- `src/lib/migrations/acculynx-client.ts` — API client with retry + pagination
- `src/lib/migrations/acculynx-mapper.ts` — Field mapping (contacts, jobs, properties, leads)
- `src/lib/migrations/migration-engine.ts` — Orchestrator with dedup
- `src/app/api/migrations/acculynx/route.ts` — POST trigger
- `src/components/integrations/AccuLynxMigration.tsx` — UI

**Gaps to close**:

- [ ] **2.1.1** Add claims import (AccuLynx "jobs" with insurance data → SkaiScraper `claims`)
- [ ] **2.1.2** Add document/photo import (AccuLynx attachments → Supabase Storage)
- [ ] **2.1.3** Add notes/activity import → `claim_timeline_events`
- [ ] **2.1.4** Add SSE/WebSocket progress streaming (replace polling)
- [ ] **2.1.5** Encrypt API keys at rest (never store plaintext in logs/DB)
- [ ] **2.1.6** Add rollback: delete all records where `externalSource = "acculynx"` for an org
- [ ] **2.1.7** Add field mapping customization UI
- [ ] **2.1.8** Respect AccuLynx API rate limits (~60 req/min) — add backpressure
- [ ] **2.1.9** Move to background job (queue/worker) instead of blocking HTTP request
- [ ] **2.1.10** Strip `console.log` debug statements from migration engine

### 2.2 — Build JobNimbus Migration Engine

**Status**: No code exists. Zero files.
**JobNimbus API**: REST + API key auth, endpoints for contacts/jobs/tasks/files/activities.

- [ ] **2.2.1** Create `src/lib/migrations/jobnimbus-client.ts`
  - Auth: `Authorization: Bearer <api_key>` header
  - Endpoints: `/contacts`, `/jobs`, `/tasks`, `/files`, `/activities`
  - Pagination: cursor-based (`?offset=&limit=`)
  - Retry logic: 3 attempts, exponential backoff
- [ ] **2.2.2** Create `src/lib/migrations/jobnimbus-mapper.ts`
  - JN contacts → SkaiScraper contacts
  - JN jobs → properties + leads + jobs
  - JN tasks → `claim_tasks`
  - JN statuses → SkaiScraper pipeline stages
  - JN custom fields → metadata JSON
- [ ] **2.2.3** Add `runJobNimbusMigration()` to migration engine (or create new orchestrator)
- [ ] **2.2.4** Create `src/app/api/migrations/jobnimbus/route.ts`
- [ ] **2.2.5** Create `src/components/integrations/JobNimbusMigration.tsx`
- [ ] **2.2.6** Add JobNimbus card to `src/app/(app)/integrations/page.tsx`
- [ ] **2.2.7** Test with sandbox API keys
- [ ] **2.2.8** Export `jobnimbus-client` and `jobnimbus-mapper` from `src/lib/migrations/index.ts`

### 2.3 — Generic Migration Framework

_Abstract the pattern after both engines work._

- [ ] **2.3.1** Create `src/lib/migrations/base-client.ts` (abstract class: `fetchContacts()`, `fetchJobs()`, etc.)
- [ ] **2.3.2** Create `src/lib/migrations/base-mapper.ts` (generic field-mapping interface)
- [ ] **2.3.3** CSV import support (for companies not on AccuLynx/JN)
- [ ] **2.3.4** Migration wizard UI at `/settings/integrations/migrate`:
  - Step 1: Select source (AccuLynx / JobNimbus / CSV)
  - Step 2: Enter API credentials
  - Step 3: Test connection
  - Step 4: Preview data (first 10 records)
  - Step 5: Map fields
  - Step 6: Run import (with real-time progress)
  - Step 7: Summary + rollback option

---

## 🟡 PHASE 3 — PLATFORM GOVERNANCE (Week 3-4)

### 3.1 — API Route Governance

**Status**: 750 routes with no categorization or versioning.

- [ ] **3.1.1** Categorize all routes by domain (claims, ai, trades, portal, admin, integrations, internal)
- [ ] **3.1.2** Add API versioning prefix for public-facing routes (`/api/v1/`)
- [ ] **3.1.3** Add deprecation headers for routes being phased out
- [ ] **3.1.4** Generate OpenAPI spec from route handlers
- [ ] **3.1.5** Audit and delete dead routes (compare `artifacts/routes.json` vs actual usage)

### 3.2 — Auth Consistency

**Status**: ESLint rule blocks direct `auth()` import, but files use `eslint-disable`.

- [ ] **3.2.1** Fix remaining `auth()` / `currentUser()` direct imports across API routes
- [ ] **3.2.2** Enforce that `eslint-disable` comments require a tracking reference

### 3.3 — Observability for 10K Users

**Status**: `console.log`-based logging. No structured observability.

- [ ] **3.3.1** Enforce structured logger (`src/lib/log.ts`) — replace remaining `console.log`
- [ ] **3.3.2** Add request correlation IDs (trace header in all API responses)
- [ ] **3.3.3** Sentry error boundaries on all critical paths
- [ ] **3.3.4** PostHog event tracking for migration flows
- [ ] **3.3.5** Health dashboard at `/admin/health`:
  - DB connection pool usage
  - API response times (p50/p95/p99)
  - Active migrations
  - OpenAI token usage
  - Rate limit hit rate

### 3.4 — Schema Optimization

- [ ] **3.4.1** Audit 278 models for unused tables (cross-reference `prisma.<model>` usage)
- [ ] **3.4.2** Add missing indexes on high-query columns
- [ ] **3.4.3** Add `@@map` annotations for inconsistent naming
- [ ] **3.4.4** Plan table partitioning for > 1M row tables (claims, leads, jobs, weather_reports)

---

## 🟢 PHASE 4 — INTEGRATION READINESS (Week 4-5)

### 4.1 — QuickBooks Online Integration

**Status**: UI exists at `/settings/integrations` with connect/disconnect. Backend routes partially built.

- [ ] **4.1.1** Complete OAuth2 flow (`/api/integrations/quickbooks/callback`)
- [ ] **4.1.2** Token refresh middleware (QBO tokens expire every 60 min)
- [ ] **4.1.3** Invoice sync: SkaiScraper claims → QBO invoices
- [ ] **4.1.4** Customer sync: SkaiScraper contacts → QBO customers
- [ ] **4.1.5** Payment webhook receiver (QBO → SkaiScraper payment status)
- [ ] **4.1.6** Add `QuickBooksToken` Prisma model for encrypted OAuth storage

### 4.2 — ABC Supply Order Routing

**Status**: UI references only. No API integration.

- [ ] **4.2.1** Research ABC Supply API access (EDI or REST)
- [ ] **4.2.2** Create `src/lib/integrations/abc-supply.ts` client
- [ ] **4.2.3** Wire material orders → ABC Supply order placement
- [ ] **4.2.4** Order status webhook receiver
- [ ] **4.2.5** Delivery tracking integration

### 4.3 — Webhook Infrastructure (Outbound)

**Status**: Stripe inbound webhook works. No outbound webhook system for customer integrations.

- [ ] **4.3.1** Create `src/lib/webhooks/outbound.ts`
- [ ] **4.3.2** Event types: `claim.created`, `claim.updated`, `migration.completed`, `report.generated`
- [ ] **4.3.3** Retry with exponential backoff (3 attempts, HMAC signature)
- [ ] **4.3.4** Webhook delivery log for debugging
- [ ] **4.3.5** Webhook management UI at `/settings/webhooks`

---

## 🔵 PHASE 5 — CODE QUALITY REDUCTION (Ongoing)

### 5.1 — `as any` Reduction (746 → < 200)

- [ ] **5.1.1** Zod schemas for Prisma JSON fields (`config`, `metadata`, `payload`)
- [ ] **5.1.2** Fix `catch (error: any)` → `catch (error: unknown)` + type guard
- [ ] **5.1.3** Add proper types for API response handlers
- [ ] **5.1.4** ESLint `@typescript-eslint/no-explicit-any` as warning → error

### 5.2 — Console Reduction (3,908 → < 500)

- [ ] **5.2.1** Batch-strip `console.log` from all API routes (keep `console.error` in catch blocks)
- [ ] **5.2.2** Replace `console.error` with `logError()` from `src/lib/log.ts`
- [ ] **5.2.3** ESLint `no-console` rule as warning for `src/app/api/`

### 5.3 — Dead Code Purge

- [ ] **5.3.1** Delete files flagged in `artifacts/dead-ui.json`
- [ ] **5.3.2** Remove 65 `@deprecated` references
- [ ] **5.3.3** Archive `legacy/` folders to separate branch
- [ ] **5.3.4** Run `ts-prune` to find unused exports

### 5.4 — Test Coverage

- [ ] **5.4.1** Unit tests: migration engine (mapper + dedup logic)
- [ ] **5.4.2** Unit tests: rate limiter
- [ ] **5.4.3** Integration tests: claim creation flow
- [ ] **5.4.4** E2E test: AccuLynx migration (mock API)
- [ ] **5.4.5** E2E test: JobNimbus migration (mock API)
- [ ] **5.4.6** Load test: 500 concurrent API requests

---

## 📋 CARRIED FORWARD — Prior Priorities (Still Open)

### Dashboard & Leaderboard

- [ ] Add "Retail" tab to CompanyLeaderboard
- [ ] Upgrade dashboard stat cards (sparklines, trends, animated counters)

### Broken Pages

- [ ] Mortgage Checks page — investigate app error
- [ ] Permits page — investigate app error
- [ ] Claim Financial page — `params.id` → `params.claimId` route param bug

### UI Consistency

- [ ] Replace 7 inline gradient headers with standard `PageHero` component
- [ ] Remove black outlines on card borders

### Real Data

- [ ] Financial Overview page — 100% hardcoded values → wire to real data

### Subscription Enforcement

- [ ] Wire `requireActiveSubscription` guard to AI/claims/export API routes
- [ ] Set `STRIPE_PRICE_ID` in Vercel env vars

### Code Quality

- [ ] Remove `monthlyTokens`, `aiIncluded` from Plan Prisma model
- [ ] Move template marketplace to `(public)` route group

---

## 📋 EXECUTION ORDER (Priority Stack)

```
Week 1:
  ✅ 1.1 — OpenAI singleton fix              (1 day)
  ✅ 1.2 — Rate limiter consolidation         (1 day)
  ✅ 1.3 — Migration DB schema                (1 day)
  ✅ 1.4 — DB connection pooling              (0.5 day)

Week 2:
  🔨 2.1 — Harden AccuLynx engine            (2 days)
  🔨 2.2 — Build JobNimbus engine             (3 days)

Week 3:
  🔨 2.3 — Generic migration wizard          (2 days)
  🔨 3.1 — API route governance              (1 day)
  🔨 3.2 — Auth consistency                  (1 day)

Week 4:
  🔨 3.3 — Observability                     (2 days)
  🔨 4.1 — QuickBooks integration            (3 days)

Week 5:
  🔨 4.2 — ABC Supply routing                (2 days)
  🔨 4.3 — Webhook infrastructure            (1 day)
  🔨 5.x — Code quality (ongoing)
```

---

## 🎯 Success Criteria: "10K-User Ready"

- [ ] All API routes rate-limited with Redis-backed limiter
- [ ] OpenAI uses single shared client (cold-start < 200ms)
- [ ] AccuLynx migration works end-to-end with progress UI
- [ ] JobNimbus migration works end-to-end with progress UI
- [ ] Migration items tracked per-record with rollback
- [ ] DB connection pooling active
- [ ] QuickBooks OAuth flow complete
- [ ] `as any` < 200 (down from 746)
- [ ] `console.*` < 500 (down from 3,908)
- [ ] All auth via canonical guards (zero direct `auth()` imports)
- [ ] Health dashboard showing real-time system metrics
- [ ] Load test passing at 500 concurrent users

---

## 🚀 DEPLOYMENT CHECKLIST

Before each deploy:

1. [ ] `npx prisma generate`
2. [ ] `pnpm build` — verify 0 errors
3. [ ] Check `env.d.ts` — no stale env vars
4. [ ] Set `STRIPE_PRICE_ID=price_1T0oOREmf7hVRjVVCdV7CRzU` in Vercel env
5. [ ] `git add . && git commit && vercel --prod`

---

_Last updated: 2026-02-16 | Next review: Week 1 completion_
