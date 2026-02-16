# 🎯 MASTER GAMEPLAN — Post-Auth-Hardening Completion Checklist

> **Generated:** February 16, 2026
> **Last Updated:** February 16, 2026 (Phases 1-6 COMPLETE)
> **Context:** 42-item auth hardening sprint + cleanup sprint complete. 79 tests green.
> **Mode:** Operational discipline — deploy, observe, stabilize.
> **Status:** ✅ READY FOR PRODUCTION DEPLOY

---

## 📊 FINAL CODEBASE METRICS (Feb 16 — All Cleanup Complete)

| Metric                     | Before | After   | Delta       | Status |
| -------------------------- | ------ | ------- | ----------- | ------ |
| Source files               | 3,714  | 3,268   | −446        | ✅     |
| Pages                      | 449    | 450     | +1          | ✅     |
| API routes                 | 883    | **804** | −79         | ✅     |
| Health routes              | 31     | **6**   | −25         | ✅     |
| Error boundaries           | 371    | **3**   | −368        | ✅     |
| Test files                 | 9      | **12**  | +3          | ✅     |
| Tests                      | 72     | **79**  | +7          | ✅     |
| Lines deleted this session | —      | —       | **−15,852** | ✅     |
| Files changed this session | —      | —       | **464**     | ✅     |

---

## ✅ PHASE 1 — CRITICAL BUGS (COMPLETED)

### 1A. Claim Financial Page — Route Param Bug ✅ FIXED

- [x] **1A-1** Fixed `params?.id` → `params?.claimId` in financial page
- [x] **1A-2** Analysis will now load with correct claimId

### 1B. Mortgage Checks & Permits Pages ✅ VERIFIED

- [x] **1B-1** Verified Prisma models exist (`mortgage_checks`, `permits`)
- [x] **1B-2** Pages use `guarded()` wrapper — errors return empty array gracefully
- [x] **1B-3** No code fix needed — pages work when DB has data

---

## ✅ PHASE 2 — HYGIENE & DRIFT PREVENTION (COMPLETED)

### 2A. ESLint Rules ✅ ADDED

- [x] Added `no-console: warn` to catch new console.log additions
- [x] Added `@typescript-eslint/no-explicit-any: warn` to catch new `as any` additions
- [x] Added `no-restricted-imports` for `@clerk/nextjs/server` auth functions
  - Warns when importing `auth`, `currentUser`, `clerkClient` directly
  - Message directs to use `@/lib/auth/` canonical guards

### 2B. Health Route Consolidation ✅ DONE (31 → 6)

Deleted 25 redundant health routes. Remaining canonical routes:

- `/api/health` — Basic liveness (prod monitors)
- `/api/health/ready` — Readiness probe (DB check)
- `/api/health/live` — Kubernetes liveness probe
- `/api/health/deep` — Full diagnostic
- `/api/health/drift-metrics` — Auth drift tracking

### 2C. CI Auth Drift Guard ✅ ADDED

- [x] Added to `.github/workflows/ci.yml`
- [x] Fails CI if direct Clerk server imports exceed threshold (700)
- [x] Prevents new auth drift from entering codebase

### 2D. Dead Code Purge ✅ VERIFIED

- [x] `ConditionalNav.tsx` — already deleted
- [x] `UnifiedNavigation.tsx` — already deleted
- [x] `GradientButton.tsx` — already deleted
- [x] `PageShell.tsx` — already deleted
- [x] `TopNav.jsx` — already deleted
- [x] `src/client/` — already deleted

---

## PHASE 3 — DEPLOY & VALIDATE (Do Now — Manual)

> **Effort:** 1 hour | **Risk:** None | **YOU DO THIS**

- [ ] **3-1** Deploy current `main` to Vercel production
- [ ] **3-2** Verify `/api/health` returns 200
- [ ] **3-3** Verify `/api/health/ready` returns 200
- [ ] **3-4** Verify `/api/health/live` returns 200
- [ ] **3-5** Hit `/api/webhooks/stripe` with GET — expect 405 (method not allowed)
- [ ] **3-6** Confirm Stripe Dashboard webhook URL points to `/api/webhooks/stripe` (not old paths)
- [ ] **3-7** Log in as Org A → attempt to navigate to Org B claim via URL → confirm 403
- [ ] **3-8** Open browser DevTools Network tab → confirm only 1 PostHog init request to `us.i.posthog.com`
- [ ] **3-9** Watch Sentry for 24 hours — controlled 401/403 spikes = good, 500s = investigate
- [ ] **3-10** Watch PostHog for 24 hours — verify events are flowing

**Exit criteria:** All 10 items verified. Screenshot or log each one.

---

## ✅ PHASE 4 — TEST COVERAGE (COMPLETED)

### 4A. Tests Added ✅

- [x] **4A-1** Webhook signature test (already existed in `__tests__/api/webhooks/stripe.test.ts`)
- [x] **4A-2** Billing guard test — `__tests__/lib/billing-guard.test.ts` (7 tests)
- [x] **4A-3** Auth hardening tests (already existed)
- [x] **4A-4** Cross-org isolation tests (already existed)
- [x] **4A-5** Auth matrix tests (already existed)

### 4B. CI Pipeline ✅

- [x] **4B-1** Auth drift guard added to `.github/workflows/ci.yml`
- [x] **4B-2** Vitest already runs on every PR
- [x] **4B-3** Build already runs on every PR

---

## ✅ PHASE 5 — API RATIONALIZATION (COMPLETED)

### 5A. Routes Deleted ✅

| Category                           | Routes Deleted |
| ---------------------------------- | -------------- |
| `_disabled/` directory             | 29 routes      |
| `diag/` diagnostic routes          | 12 routes      |
| `dev/`, `demo/`, `test/`, `debug/` | 8 routes       |
| Unused `system/` routes            | 5 routes       |
| Health route duplicates            | 25 routes      |
| **Total**                          | **79 routes**  |

**API routes: 883 → 804**

---

## ✅ PHASE 6 — ERROR BOUNDARY CONSOLIDATION (COMPLETED)

- [x] **6-1** Deleted 368 nested error boundaries
- [x] **6-2** Kept only 3 strategic error boundaries:
  - `src/app/error.tsx` — Root error boundary (catches everything)
  - `src/app/(app)/error.tsx` — App layout boundary
  - `src/app/portal/error.tsx` — Portal layout boundary

**Error boundaries: 371 → 3**

---

## 🎯 REMAINING (Low Priority — Future Sprints)

### Type Safety (When Time Permits)

778 `as any` casts remaining. ESLint rule added to warn on new additions.

- [ ] Fix top 20 `as any` in API route handlers
- [ ] Fix top 20 `as any` in `src/lib/`
- [ ] Track count in CI

### UI Consistency (When Time Permits)

7 pages use inline headers instead of `PageHero`. Not blocking.

---

## 📊 TOTAL IMPACT — Auth Hardening + Cleanup Sprint

| Metric                | Before | After      | Change                         |
| --------------------- | ------ | ---------- | ------------------------------ |
| Files touched         | —      | 661+       | —                              |
| Lines deleted         | —      | **71,579** | (55,727 auth + 15,852 cleanup) |
| Lines added           | —      | ~4,800     | Net reduction                  |
| API routes            | 883    | 804        | **−79**                        |
| Health routes         | 31     | 6          | **−25**                        |
| Error boundaries      | 371    | 3          | **−368**                       |
| Tests                 | 72     | 79         | **+7**                         |
| Test files            | 9      | 12         | **+3**                         |
| Auth implementations  | 5      | 1          | **−4** (canonical only)        |
| Client-supplied orgId | Yes    | No         | **Eliminated**                 |
| Cross-org protection  | Weak   | Strong     | **Hardened**                   |

---

## ✅ WHAT'S DONE (For the Record)

- [ ] **5B-1** Audit all 18 error boundaries
- [ ] **5B-2** Consolidate to 3–5 strategic placement points
- [ ] **5B-3** Ensure error boundaries report to Sentry

### 5C. Dashboard Enhancement

- [ ] **5C-1** Add "Retail" tab to Company Leaderboard
- [ ] **5C-2** Upgrade dashboard stat cards with sparklines/trends
- [ ] **5C-3** Verify door-knocking counter increments correctly

---

## PHASE 6 — OPERATIONAL MATURITY (Month 2)

> **Effort:** Ongoing | **Risk:** None | **Enterprise discipline**

### 6A. API Route Rationalization (883 → target ~200)

883 API routes is unsustainable. Most SaaS platforms this size have 100–200.

- [ ] **6A-1** Audit all routes — categorize as: active / duplicate / dead / internal-only
- [ ] **6A-2** Delete confirmed dead routes
- [ ] **6A-3** Merge duplicate routes
- [ ] **6A-4** Consider domain-splitting: `/api/billing/*`, `/api/trades/*`, `/api/portal/*`, `/api/core/*`

### 6B. Prisma Schema Governance

258 models / 6,476 lines.

- [ ] **6B-1** Audit for unused models (no route references them)
- [ ] **6B-2** Audit for duplicate/redundant models
- [ ] **6B-3** Consider schema splitting by domain (Prisma multi-schema)

### 6C. Monitoring & Alerting

- [ ] **6C-1** Set up Sentry alert for 500-rate > 1% over 5 minutes
- [ ] **6C-2** Set up uptime monitoring on `/api/health/live` (e.g., BetterUptime, Vercel)
- [ ] **6C-3** PostHog funnel for critical user flows (sign-up → first claim → report)
- [ ] **6C-4** Weekly review cadence: check Sentry, PostHog, Vercel logs

---

## PHASE 7 — FUTURE ARCHITECTURE (Month 3+)

> **Not urgent. Plan only.**

- [ ] **7-1** Design API domain segmentation (billing / trades / portal / core modules)
- [ ] **7-2** Evaluate edge middleware performance (cold start profiling)
- [ ] **7-3** Consider read replicas if DB becomes bottleneck
- [ ] **7-4** Plan v2 auth architecture (if Clerk doesn't scale, evaluate alternatives)
- [ ] **7-5** Evaluate monorepo split for trades-service

---

## ⚠️ RULES OF ENGAGEMENT

1. **Do not start Phase N+1 until Phase N is verified green.**
2. **Let each deploy stabilize for 24–48 hours before the next change.**
3. **Watch Sentry + PostHog after every deploy.** Controlled 401/403 = good. 500s = stop and investigate.
4. **Do not refactor for refactoring's sake.** Every change must have a measurable outcome.
5. **The 673 direct Clerk imports are not an emergency.** The lint rule prevents new drift. Gradual migration is fine.
6. **The 778 `as any` casts are not an emergency.** They're tech debt, not security risk. Fix incrementally.

---

## 📋 SUPERSEDED DOCUMENTS

These planning docs are now consolidated into this gameplan:

| Document                              | Status                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| `TODO.md` (v4, 325 lines)             | Partially superseded — production fixes absorbed into Phase 1    |
| `MASTER_TODO.md`                      | Partially superseded — dashboard/leaderboard items in Phase 5    |
| `MASTER_SIMPLIFICATION_PLAN.md`       | ✅ Completed — token/credit purge done                           |
| `ENTERPRISE_STABILITY_GAMEPLAN.md`    | Partially superseded — P0 template fix done, auth hardening done |
| `COMPONENT_REDUNDANCY_MASTER_PLAN.md` | Dead code items absorbed into Phase 2D                           |
| `TODO-v2-complete.md`                 | ✅ Historical — archive                                          |
| `TODO-v3-complete.md`                 | ✅ Historical — archive                                          |

---

## ✅ WHAT'S ALREADY DONE (For the Record)

- [x] Auth guard fragmentation → 1 canonical source (`src/lib/auth/`)
- [x] Client-supplied orgId eliminated → server-derived only
- [x] Portal access hardened → `assertPortalAccess` verifies org membership on claim
- [x] 55,727 lines deleted (dead code, duplicate files, legacy systems)
- [x] Stripe webhook consolidated → single `/api/webhooks/stripe/route.ts`
- [x] PostHog double-init fixed → single `src/lib/analytics.tsx`
- [x] ENV explosion fixed → 5 canonical files, 0 git-tracked
- [x] Template API wildcard scoped → marketplace + health only
- [x] Security headers file removed (Vercel handles this)
- [x] Token/credit system fully purged
- [x] Build stabilized with 8GB heap in package.json + vercel.json
- [x] 72 tests passing (auth hardening, cross-org isolation, middleware, rate limiting)
- [x] Billing model simplified → $80/seat, no tokens, no tiers

---

_This is your single source of truth. One document. One priority order. Work top to bottom._
