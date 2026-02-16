# MASTER TODO — SkaiScraper 10K-User Readiness

> **Updated**: 2026-02-16 · **Platform**: SkaiScraper v2.1.0  
> **Billing**: $80/seat/month · Stripe: `prod_Tylw6eipXQDDDS` / `price_1T0oOREmf7hVRjVVCdV7CRzU`  
> **Scale**: 278 Prisma models · **641 API routes** · 6,476-line schema · 722 DB indexes

---

## Platform Health Snapshot

| Metric                | Count             | Risk     | Target           |
| --------------------- | ----------------- | -------- | ---------------- |
| Prisma models         | 278               | High     | < 250            |
| **API routes**        | **641** (was 804) | Improved | < 500            |
| `as any` casts        | 746               | Critical | < 200            |
| `console.*` stmts     | 3,908             | High     | < 500            |
| `TODO/FIXME` markers  | 302               | Medium   | < 100            |
| `@deprecated` refs    | 65                | Medium   | 0                |
| OpenAI instantiations | 20+ bypass        | Critical | 1 (singleton)    |
| Rate limiter files    | 5 (all in-memory) | Critical | 1 (Redis-backed) |
| **Domain Services**   | **3** created     | New      | 6+ full coverage |
| **Action Handlers**   | **12** unified    | New      | All domains      |
| Tests passing         | 79/79             | Good     | 100+             |

---

## COMPLETED — Prior Sprints

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

<details>
<summary>Auth Hardening Sprint (72+ tests green)</summary>

- [x] Created `requireAuth`, `requirePortalAuth` guard wrappers
- [x] ESLint rule blocks direct `auth()` import
- [x] 72+ tests passing for auth flows
- [x] 661 files changed, -55,727 lines removed
- [x] Migrated all portal routes to `assertPortalAccess`
- [x] Cross-org isolation tests passing
</details>

<details>
<summary>API Rationalization Phase 1 — Claims Tree Collapse</summary>

- [x] Created unified action handlers for claims domain
- [x] Collapsed 86 → 32 claims routes (-54 routes)
- [x] All auth guards preserved
- [x] Tests passing
</details>

<details>
<summary>API Rationalization Phase 2 — Portal/Trades/Reports (commits c065b5d, 57132d6)</summary>

**Created 12 unified action handlers:**

- [x] `POST /api/portal/claims/[claimId]/actions` — claim operations (179 lines)
- [x] `POST /api/portal/jobs/[jobId]/actions` — job operations (138 lines)
- [x] `POST /api/portal/invitations/actions` — invitation management (191 lines)
- [x] `POST /api/portal/messages/actions` — message/thread operations (184 lines)
- [x] `POST /api/trades/actions` — trades network operations (324 lines)
- [x] `POST /api/trades/company/actions` — company management (258 lines)
- [x] `POST /api/trades/profile/actions` — profile management (194 lines)
- [x] `POST /api/trades/connections/actions` — connection operations (236 lines)
- [x] `POST /api/reports/actions` — report list operations (292 lines)
- [x] `POST /api/reports/[reportId]/actions` — single report operations (207 lines)
- [x] `POST /api/claims/[claimId]/ai/actions` — AI operations (480 lines)
- [x] `POST /api/claims/[claimId]/final-payout/actions` — payout operations (354 lines)

**Results:**

- Route reduction: 804 → 641 (-163 routes, 20% reduction)
- All 79 tests passing
</details>

<details>
<summary>Service Layer Extraction Phase 2.5 (commit 57132d6)</summary>

- [x] Created domain service layer at `src/lib/domain/`
- [x] `src/lib/domain/reports/index.ts` — report workflow services (~260 lines)
- [x] `src/lib/domain/trades/index.ts` — trades network services (~175 lines)
- [x] `src/lib/domain/portal/index.ts` — portal/client services (~280 lines)
- [x] Refactored reports `[reportId]/actions` to thin dispatcher pattern
</details>

---

## IMMEDIATE PRIORITY — Service Layer Completion

**Architecture Pattern**: `Route (validate + auth + dispatch) → Service (pure business logic)`

### Current Action Handler Status

| Handler                                 | Lines | Status   | Service Location                       |
| --------------------------------------- | ----- | -------- | -------------------------------------- |
| `claims/[claimId]/ai/actions`           | 480   | MONOLITH | needs `src/lib/domain/ai/index.ts`     |
| `claims/[claimId]/final-payout/actions` | 354   | MONOLITH | needs `src/lib/domain/claims/index.ts` |
| `trades/actions`                        | 324   | MONOLITH | → `src/lib/domain/trades/index.ts`     |
| `reports/actions`                       | 292   | MONOLITH | → `src/lib/domain/reports/index.ts`    |
| `trades/company/actions`                | 258   | MONOLITH | → `src/lib/domain/trades/index.ts`     |
| `trades/connections/actions`            | 236   | MONOLITH | → `src/lib/domain/trades/index.ts`     |
| `reports/[reportId]/actions`            | 207   | **DONE** | uses service layer                     |
| `trades/profile/actions`                | 194   | MONOLITH | → `src/lib/domain/trades/index.ts`     |
| `portal/invitations/actions`            | 191   | MONOLITH | → `src/lib/domain/portal/index.ts`     |
| `portal/messages/actions`               | 184   | MONOLITH | → `src/lib/domain/portal/index.ts`     |
| `portal/claims/[claimId]/actions`       | 179   | MONOLITH | → `src/lib/domain/portal/index.ts`     |
| `portal/jobs/[jobId]/actions`           | 138   | MONOLITH | → `src/lib/domain/portal/index.ts`     |

### Extraction Tasks (Priority Order)

- [ ] **IM.1** Extract `trades/actions` logic to `trades/index.ts` (324 lines)
- [ ] **IM.2** Extract `reports/actions` batch logic to `reports/index.ts` (292 lines)
- [ ] **IM.3** Extract `trades/company/actions` to `trades/index.ts` (258 lines)
- [ ] **IM.4** Extract `trades/connections/actions` to `trades/index.ts` (236 lines)
- [ ] **IM.5** Extract `trades/profile/actions` to `trades/index.ts` (194 lines)
- [ ] **IM.6** Extract `portal/invitations/actions` to `portal/index.ts` (191 lines)
- [ ] **IM.7** Extract `portal/messages/actions` to `portal/index.ts` (184 lines)
- [ ] **IM.8** Extract `portal/claims/actions` to `portal/index.ts` (179 lines)
- [ ] **IM.9** Extract `portal/jobs/actions` to `portal/index.ts` (138 lines)
- [ ] **IM.10** Create `src/lib/domain/ai/index.ts` for AI operations
- [ ] **IM.11** Create `src/lib/domain/claims/index.ts` for claims operations
- [ ] **IM.12** Extract `claims/ai/actions` to AI service (480 lines)
- [ ] **IM.13** Extract `claims/final-payout/actions` to claims service (354 lines)

---

## MANUAL TESTING CHECKLIST

**Critical flows that MUST work after refactor:**

### Portal Domain

- [ ] **MT.1** Accept invitation from email link
- [ ] **MT.2** Decline invitation from email link
- [ ] **MT.3** Send new invitation to homeowner
- [ ] **MT.4** Create message thread
- [ ] **MT.5** Send message in thread
- [ ] **MT.6** Mark thread as read
- [ ] **MT.7** Archive thread
- [ ] **MT.8** Request claim access
- [ ] **MT.9** Accept claim access request

### Reports Domain

- [ ] **MT.10** Generate report (PDF creation)
- [ ] **MT.11** Send report via email
- [ ] **MT.12** Approve report
- [ ] **MT.13** Reject report with notes
- [ ] **MT.14** Download report as PDF
- [ ] **MT.15** Export report bundle

### Trades Domain

- [ ] **MT.16** Send connection request
- [ ] **MT.17** Accept connection
- [ ] **MT.18** Decline connection
- [ ] **MT.19** Apply to job
- [ ] **MT.20** Match trades (search)
- [ ] **MT.21** Update company profile
- [ ] **MT.22** Update trade profile

### Claims Domain

- [ ] **MT.23** Create claim
- [ ] **MT.24** Update claim status
- [ ] **MT.25** Upload asset to claim
- [ ] **MT.26** AI scope generation
- [ ] **MT.27** Final payout calculation

---

## PHASE 1 — Critical Infrastructure (Week 1-2)

_Blocks 10K-user readiness. Do first._

### 1.1 — Fix OpenAI Singleton (20+ files)

**Status**: `src/lib/ai/client.ts` has proper `getClient()` singleton BUT 20+ API routes still create their own `new OpenAI()` — cold-start penalty, memory waste.

**Files to migrate:**

```
src/app/api/ai/*/route.ts (multiple)
src/app/api/claims/[claimId]/ai/*/route.ts (multiple)
src/app/api/reports/[reportId]/generate/route.ts
src/app/api/weather/*/route.ts (multiple)
```

- [ ] **1.1.1** Remove legacy eager `export const openai` from `src/lib/ai/client.ts`
- [ ] **1.1.2** Ensure `getClient()` returns singleton (lazy init)
- [ ] **1.1.3** Migrate all 20+ routes to `import { getClient } from '@/lib/ai/client'`
- [ ] **1.1.4** Add ESLint rule: `no-restricted-imports` for `new OpenAI`
- [ ] **1.1.5** Verify cold-start improvement (measure before/after)

### 1.2 — Rate Limiter Consolidation (5 files)

**Current state**: 5 separate in-memory rate limiters, no Redis backing.

| File                              | Usage               |
| --------------------------------- | ------------------- |
| `src/lib/rate-limit.ts`           | Primary (AI routes) |
| `src/lib/ratelimit.ts`            | Duplicate           |
| `src/lib/rateLimiter.ts`          | Another variant     |
| `src/lib/middleware/rateLimit.ts` | Middleware-specific |
| `src/lib/security/ratelimit.ts`   | Security-focused    |

- [ ] **1.2.1** Audit all 5 files — identify canonical interface
- [ ] **1.2.2** Consolidate to single `src/lib/rate-limit.ts` with presets: `AI`, `API`, `WEBHOOK`, `AUTH`
- [ ] **1.2.3** Add Upstash Redis adapter (falls back to in-memory for dev)
- [ ] **1.2.4** Add rate-limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)
- [ ] **1.2.5** Delete 4 redundant files, update all imports
- [ ] **1.2.6** Add rate-limit preset for migration API

### 1.3 — Migration Tracking Models

**Status**: `migration-engine.ts` uses raw SQL — NOT in Prisma schema.

- [ ] **1.3.1** Add `MigrationJob` model to Prisma schema
- [ ] **1.3.2** Add `MigrationItem` model for per-record tracking
- [ ] **1.3.3** Run `prisma migrate dev --name add_migration_tracking`
- [ ] **1.3.4** Refactor `migration-engine.ts` to use Prisma models

### 1.4 — Database Connection Pooling

- [ ] **1.4.1** Enable Prisma Accelerate or PgBouncer
- [ ] **1.4.2** Add `connectionLimit` to Prisma datasource
- [ ] **1.4.3** Audit long-running queries — add limits + pagination
- [ ] **1.4.4** Add `statement_timeout` to `$queryRawUnsafe` calls

---

## PHASE 2 — CRM Migration Engines (Week 2-3)

### 2.1 — Harden AccuLynx Engine

**Existing infrastructure:**

- `src/lib/migrations/acculynx-client.ts` — API client
- `src/lib/migrations/acculynx-mapper.ts` — Field mapping
- `src/lib/migrations/migration-engine.ts` — Orchestrator
- `src/app/api/migrations/acculynx/route.ts` — POST trigger

**Gaps to close:**

- [ ] **2.1.1** Add claims import (AccuLynx jobs → SkaiScraper claims)
- [ ] **2.1.2** Add document/photo import (attachments → Supabase Storage)
- [ ] **2.1.3** Add SSE progress streaming (replace polling)
- [ ] **2.1.4** Encrypt API keys at rest
- [ ] **2.1.5** Add rollback capability
- [ ] **2.1.6** Move to background job (queue/worker)

### 2.2 — Build JobNimbus Engine

**Status**: No code exists.

- [ ] **2.2.1** Create `src/lib/migrations/jobnimbus-client.ts`
- [ ] **2.2.2** Create `src/lib/migrations/jobnimbus-mapper.ts`
- [ ] **2.2.3** Add `runJobNimbusMigration()` to migration engine
- [ ] **2.2.4** Create API route and UI component
- [ ] **2.2.5** Test with sandbox API keys

### 2.3 — Generic Migration Framework

- [ ] **2.3.1** Create `base-client.ts` abstract class
- [ ] **2.3.2** CSV import support
- [ ] **2.3.3** Migration wizard UI at `/settings/integrations/migrate`

---

## PHASE 3 — Platform Governance (Week 3-4)

### 3.1 — API Route Governance

- [ ] **3.1.1** Categorize all routes by domain
- [ ] **3.1.2** Add API versioning prefix (`/api/v1/`)
- [ ] **3.1.3** Add deprecation headers for legacy routes
- [ ] **3.1.4** Generate OpenAPI spec

### 3.2 — Auth Consistency

- [ ] **3.2.1** Fix remaining direct `auth()` imports
- [ ] **3.2.2** Audit org guard compliance on unified handlers

### 3.3 — Observability

- [ ] **3.3.1** Enforce structured logger — replace `console.log`
- [ ] **3.3.2** Add request correlation IDs
- [ ] **3.3.3** Sentry error boundaries
- [ ] **3.3.4** Health dashboard at `/admin/health`

---

## PHASE 4 — Integration Readiness (Week 4-5)

### 4.1 — QuickBooks Online

- [ ] **4.1.1** Complete OAuth2 flow
- [ ] **4.1.2** Token refresh middleware
- [ ] **4.1.3** Invoice sync
- [ ] **4.1.4** Customer sync

### 4.2 — ABC Supply Order Routing

- [ ] **4.2.1** Research ABC Supply API
- [ ] **4.2.2** Create integration client
- [ ] **4.2.3** Wire material orders

### 4.3 — Webhook Infrastructure (Outbound)

- [ ] **4.3.1** Create `src/lib/webhooks/outbound.ts`
- [ ] **4.3.2** Event types: `claim.created`, `migration.completed`, etc.
- [ ] **4.3.3** Retry with exponential backoff

---

## PHASE 5 — Code Quality (Ongoing)

### 5.1 — `as any` Reduction (746 → < 200)

- [ ] **5.1.1** Zod schemas for Prisma JSON fields
- [ ] **5.1.2** Fix `catch (error: any)` patterns
- [ ] **5.1.3** ESLint `no-explicit-any` as error

### 5.2 — Console Reduction (3,908 → < 500)

- [ ] **5.2.1** Batch-strip `console.log` from API routes
- [ ] **5.2.2** Replace with structured logger

### 5.3 — Dead Code Purge

- [ ] **5.3.1** Delete files in `artifacts/dead-ui.json`
- [ ] **5.3.2** Remove 65 `@deprecated` references
- [ ] **5.3.3** Archive `legacy/` folders

### 5.4 — Test Coverage

- [ ] **5.4.1** Unit tests for domain services
- [ ] **5.4.2** Unit tests for rate limiter
- [ ] **5.4.3** Integration tests: claim creation flow
- [ ] **5.4.4** E2E tests: migration engines
- [ ] **5.4.5** Load test: 500 concurrent users

---

## Execution Priority

```
THIS SESSION:
  IM.1-IM.9 — Extract remaining handlers to service layer
  MT.1-MT.27 — Manual smoke testing of critical flows

WEEK 1:
  1.1 — OpenAI singleton fix (1 day)
  1.2 — Rate limiter consolidation (1 day)
  1.3 — Migration DB schema (1 day)
  1.4 — DB connection pooling (0.5 day)

WEEK 2:
  2.1 — Harden AccuLynx engine (2 days)
  2.2 — Build JobNimbus engine (3 days)

WEEK 3:
  2.3 — Generic migration wizard (2 days)
  3.1 — API route governance (1 day)
  3.2 — Auth consistency (1 day)

WEEK 4:
  3.3 — Observability (2 days)
  4.1 — QuickBooks integration (3 days)

WEEK 5:
  4.2 — ABC Supply routing (2 days)
  4.3 — Webhook infrastructure (1 day)
  5.x — Code quality (ongoing)
```

---

## Success Criteria: "10K-User Ready"

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
- [ ] Health dashboard showing real-time metrics
- [ ] Load test passing at 500 concurrent users
- [ ] All 12 action handlers using service layer pattern

---

## Deployment Checklist

Before each deploy:

1. [ ] `npx prisma generate`
2. [ ] `pnpm build` — verify 0 errors
3. [ ] `npx vitest run` — verify tests pass
4. [ ] Check `env.d.ts` — no stale env vars
5. [ ] `git add . && git commit && vercel --prod`

---

_Last updated: 2026-02-16 | Next review: After service layer extraction_
