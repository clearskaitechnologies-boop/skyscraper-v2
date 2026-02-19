# 🎯 MASTER TODO — EVERYTHING LEFT

> **Last Updated:** February 19, 2026 | **Titan Meeting: Feb 27 — 8 DAYS**
> Build: ✅ GREEN | Deploy: ✅ skaiscrape.com | Tests: 321 across 37 files

---

## 📊 CURRENT STATE — HARD NUMBERS

| Metric                        | Value                | Status                         |
| ----------------------------- | -------------------- | ------------------------------ |
| API Routes                    | 671 total            | —                              |
| Routes with Auth              | 613 (91.4%)          | ✅ was 429 → now 613           |
| Routes with Billing Guard     | 27 (4.0%)            | ✅ was 0                       |
| Routes with Rate Limiting     | 113 (16.8%)          | ✅ was 97 → now 113            |
| Routes with RBAC              | 105 (15.6%)          | ✅                             |
| Unprotected Routes            | 35 (intentional)     | ✅ was 217 → now 35 (public)   |
| Webhook Routes (no user auth) | 5                    | ✅ All HMAC validated          |
| Public/Health Routes          | 21                   | ✅ Intentional                 |
| TypeScript Errors             | 1,998 in 335 files   | ⚠️ Build still GREEN (ignored) |
| Playwright Tests              | 321 tests / 37 files | ✅                             |
| Load Test (Stress)            | 500 VU, no crash     | ✅ Feb 17                      |
| `as any` Casts                | ~89 remaining        | Down from 197                  |
| Console.log in src/app        | 0                    | ✅ Cleaned                     |

---

## 🔴 P0 — MUST DO BEFORE FEB 27 TITAN CALL

### P0-1: Fix Remaining 217 Unprotected Routes ✅ DONE (Feb 19)

> Original "217 unprotected" was inflated by scanner missing 8+ auth patterns.
> After fixing scanner + adding auth to 4 truly unprotected routes:
>
> - Auth coverage: 63.9% → **91.4%** (429 → 613 of 671 routes)
> - Unprotected: 217 → **35** (all intentionally public: marketplace, status, build-info, etc.)
> - Rate limiting: 97 → **113** routes

**Fixed:**

- [x] All admin routes already had auth via `safeOrgContext()` + Clerk admin role (scanner false positive)
- [x] All AI routes already had auth via `withAiBilling` / `getSessionOrgUser` / `getResolvedOrgId`
- [x] All cron routes already had auth via `verifyCronSecret`
- [x] All dashboard/finance/settings routes already had auth
- [x] Added auth to `/api/config` (was leaking env var presence)
- [x] Added auth to `/api/carrier/export/zip` (was unauthed stub)
- [x] Added auth to `/api/diagnostics/routes` (was fully open — route enumeration)
- [x] Upgraded `withAiBilling` with Upstash Redis rate limiter (AI 10/min)
- [x] Added rate limiting to 16 routes: AI(5), ops(3), portal(5), storage(2), carrier(1)
- [x] Scanner expanded from 14 → 32 auth patterns

### P0-2: Wire Real Uptime Monitoring

- [ ] Wire BetterStack (free tier) to `/api/health/live` → real uptime %
- [ ] Enable Sentry profiling: `profilesSampleRate: 0.0` → `0.1`
- [ ] Replace hardcoded "99.9%" string with real data
- [ ] Get 7 days of real metrics before Titan call

### P0-3: Health Endpoint HTTP Status Codes ✅ DONE (Feb 19)

- [x] `/api/health` now returns 503 when DB is down (was always 200)
- [x] `/api/health/live` already returned 503 correctly
- [x] `/api/health/deep` already returned 503 correctly

### P0-4: Cross-Tenant Live Demo (Ready to Show)

- [ ] Create 2 production orgs ("Titan Test" + "ClearSkai Internal")
- [ ] Prove Org B cannot access Org A's claim via direct URL
- [ ] Record 60-second screen capture as backup proof
- [ ] Test API: `curl` with wrong org token → must get 403/404

### P0-5: Pipeline Drag-and-Drop ✅ FIXED (Feb 19)

- [x] Root cause: `onDragEnd` was calling `PATCH /api/claims/{id}` with `{ stage }` but claims PATCH uses `.strict()` validation and doesn't have a `stage` field
- [x] Fix: Switched to `POST /api/pipeline/move` endpoint which handles stage→status mapping correctly

### P0-6: /tools Page 404 ✅ FIXED (Feb 19)

- [x] Created `/tools` page as AI Tools hub linking to supplement, rebuttal, depreciation, damage analysis, mockup, report builder, smart actions, materials estimator
- [x] Fixed `/reports` topbar link (was 404 → now points to `/reports/hub`)

---

## 🟡 P1 — DO THIS WEEK (Before or Shortly After Titan)

### P1-1: TypeScript Error Triage — Bucket A (Auth/Billing/Core)

> 1,998 errors in 335 files. Build is GREEN because `ignoreBuildErrors: true`. Most are Prisma schema drift.

- [x] Fixed 6 quick-win errors in portal.ts, sso.ts, tenant.ts, seed-roles.ts, getActiveOrgSafe.ts, ensureOrgForUser.ts
- [ ] **Remaining Bucket A (55 errors)** — all Prisma schema drift:
  - `src/lib/org/suspension.ts` (20 errors) — references `status`, `metadata`, `suspendedAt` etc.
  - `src/lib/org/transferOwnership.ts` (12 errors) — references `ownershipTransfer` model
  - `src/lib/billing.ts` (9 errors) — references `plan`, `tokens`, `subscription` includes
  - `src/lib/billing/stripe.ts` (5 errors) — references `tenantId`, `apiLog`, `document`
  - `src/lib/auth/sso.ts` (5 errors) — references `ssoConfig` model
  - These ALL need Prisma schema migrations to fix properly

### P1-2: Prisma Schema Alignment

> Most TS errors stem from code referencing models that don't exist in the schema.

- [ ] Audit `prisma/schema.prisma` for missing models: `ssoConfig`, `ownershipTransfer`, `tokenWallet`, `apiLog`, `activity`
- [ ] Either: add migrations for these models, OR delete the code that references them
- [ ] Target: eliminate 50+ TS errors by aligning schema with code

### P1-3: PDF Generation Audit (Sprint 24)

> Multiple PDF routes exist but quality/functionality hasn't been verified.

- [ ] Test `POST /api/ai/supplement/export-pdf` — does it generate a real PDF?
- [ ] Test `POST /api/ai/rebuttal/export-pdf` — does it generate a real PDF?
- [ ] Test `POST /api/ai/depreciation/export-pdf` — does it generate a real PDF?
- [ ] Test `POST /api/export/pdf` — general PDF export
- [ ] Test `POST /api/pdf/generate` — generic PDF generator
- [ ] Test template PDF generation — `/api/templates/[id]/generate-pdf`
- [ ] Fix any broken PDF generators → this is revenue-critical

### P1-4: Cron Route Security ✅ DONE (Already Secured)

> All 7 cron routes already use `verifyCronSecret()` — scanner false positive.

- [x] All cron routes verified to have `verifyCronSecret` auth

### P1-5: Admin Route Security ✅ DONE (Already Secured)

> All 6 admin routes already use `safeOrgContext()` + Clerk admin role check — scanner false positive.

- [x] All admin routes verified to have auth

### P1-6: Run E2E Tests Against Dev Server

- [ ] Start dev server: `pnpm dev`
- [ ] Run Sprint 26 API tests: `pnpm test:sprint26`
- [ ] Run full smoke suite: `pnpm test:smoke`
- [ ] Fix any failures
- [ ] Run against production: `BASE_URL=https://www.skaiscrape.com pnpm test:sprint26`

---

## 🟠 P2 — NEXT 14 DAYS

### P2-1: Field Chaos Test

- [ ] Give 3 field reps the app on iPhone + Android
- [ ] Test in rural AZ signal conditions (Prescott, Show Low, Flagstaff)
- [ ] Tasks: upload photos from roof, generate estimate, submit claim
- [ ] Document and fix top 3 issues

### P2-2: Penetration Test

- [ ] Schedule external pen test (Cobalt.io, Synack, or local Phoenix firm)
- [ ] Minimum scope: API abuse, cross-tenant access, auth bypass, rate limit bypass
- [ ] Get signed report PDF for Titan IT

### P2-3: SSO/SAML Configuration

- [ ] Verify Clerk Enterprise SSO is enabled
- [ ] Test SAML flow with Okta free tier
- [ ] Build one-page SSO setup guide for Titan IT
- [ ] Confirm SSO users get correct orgId via Clerk webhooks

### P2-4: SOC 2 Progress

- [ ] Sign up for Vanta or Drata
- [ ] Run gap assessment
- [ ] Set realistic timeline (Type I by Q3 2026)

### P2-5: Dashboard Data Endpoints Auth ✅ DONE (Already Secured)

> All dashboard routes already use `safeOrgContext()` — scanner false positive.

- [x] All dashboard routes verified to have auth + rate limiting added

- [ ] Add `withAuth` to:
  - `/api/dashboard/kpis`
  - `/api/dashboard/stats`
  - `/api/dashboard/charts`
  - `/api/dashboard/activities`

### P2-6: Portal Routes Auth ✅ DONE (Feb 19)

> All portal routes already used `requirePortalAuth` — scanner false positive.

- [x] All portal routes verified to have auth
- [x] Rate limiting added to all 5 portal routes

### P2-7: Finance Routes Auth ✅ DONE (Already Secured)

- [x] Finance routes already use `requireOrgContext()` — scanner false positive

### P2-8: Remaining `as any` Casts

- [ ] 89 remaining → target 40 or fewer
- [ ] Focus on: API routes, auth layer, billing layer first

### P2-9: Observability Polish

- [ ] Enable Sentry Performance monitoring
- [ ] Add structured logging to top 20 most-hit routes
- [ ] Create Vercel Analytics dashboard for Titan demo

---

## 🟢 P3 — WITHIN 30 DAYS

### P3-1: Phased Rollout Plan (Execute)

| Phase   | Users                | Duration | Gate                               |
| ------- | -------------------- | -------- | ---------------------------------- |
| Phase 0 | 3-5 beta field reps  | 2 weeks  | 0 crashes, p95 < 500ms             |
| Phase 1 | 10 Titan power users | 2 weeks  | NPS > 40, < 1% error rate          |
| Phase 2 | 25 users (1 dept)    | 2 weeks  | p95 < 300ms, 0 cross-tenant issues |
| Phase 3 | 60 users (half org)  | 4 weeks  | SLA maintained                     |
| Phase 4 | 180 full Titan org   | Ongoing  | Full monitoring                    |

### P3-2: Revenue Features

- [ ] Stripe checkout for archive cold storage ($7.99/mo)
- [ ] QuickBooks OAuth integration
- [ ] ABC Supply routing
- [ ] AccuLynx data migration tool (production-ready)

### P3-3: Remaining Unprotected Routes ✅ DONE

> Only 35 intentionally-public routes remain (marketplace, status, build-info, etc.)
> All auth was verified — most were scanner false positives.

- [x] Auth coverage: 91.4% (613/671)
- [x] Run `pnpm coverage:unprotected` → shows only intentionally-public routes

### P3-4: TypeScript — Full Zero

- [ ] Kill remaining ~1,950 errors
- [ ] Remove `ignoreBuildErrors: true` from next.config.mjs
- [ ] Remove `ignoreDuringBuilds: true` for ESLint
- [ ] Clean CI: build must pass with zero errors

### P3-5: TODO Comments in Code

> 11 TODO/FIXME found in app pages:

- [ ] `settings/branding/cover-page/page.tsx:165` — Implement PDF export
- [ ] `archive/page.tsx:85` — Implement Stripe checkout ($7.99/mo cold storage)
- [ ] `depreciation/DepreciationClient.tsx:27` — Implement PDF export with jsPDF
- [ ] `appointments/AppointmentsClient.tsx:72` — Open edit modal
- [ ] `intelligence/[id]/page.tsx:177` — Get address from claim (hardcoded)
- [ ] `exports/carrier/actions.ts:92` — Implement ZIP bundling with JSZip
- [ ] `exports/carrier/actions.ts:181` — Fetch actual files for export
- [ ] `team/member/[memberId]/page.tsx:129` — Contractor profile validation
- [ ] `batch-proposals/[id]/mailers/page.tsx:92` — Retry logic for failed mailers
- [ ] `damage/new-wizard/page.tsx:44` — Upload to storage
- [ ] `reports/history/ReportHistoryClient.tsx:68` — Call rebuild API

---

## ✅ COMPLETED — Sprint History (This Session)

| Sprint | What                                                 | Commit    | Date   |
| ------ | ---------------------------------------------------- | --------- | ------ |
| 20     | Billing enforcement (27 routes)                      | `e661a7a` | Feb 19 |
| 21     | Auth migration (24 routes → withAuth)                | `e5854bb` | Feb 19 |
| 22     | Rate limiting (+28 routes, 97 total)                 | `8ff5a32` | Feb 19 |
| 23     | Build verification (GREEN)                           | —         | Feb 19 |
| 25     | AI Mockup quality (DALL-E 3 fix)                     | `86265a0` | Feb 19 |
| 26     | E2E smoke tests (38 tests) + coverage map            | `c194537` | Feb 19 |
| 27     | Webhook hardening (Twilio HMAC, Trades timing-safe)  | `07335bb` | Feb 19 |
| 28     | RBAC enforcement (withManager/withAdmin on 7 routes) | `6b9dd68` | Feb 19 |
| —      | TS triage Bucket A (6 errors fixed)                  | `a67a386` | Feb 19 |
| —      | /tools 404 fix, pipeline drag fix, /reports nav fix  | `2cac702` | Feb 19 |
| —      | Route hardening: auth 91.4%, +16 rate limits, 503s   | `ecda20c` | Feb 19 |

## ✅ COMPLETED — Prior Sessions

| Sprint | What                                                     |
| ------ | -------------------------------------------------------- |
| 1-11   | Console cleanup (181 → 0 calls in src/app)               |
| 12-16  | catch(:any) cleanup (516 catches), console batch cleanup |
| 17-19  | `as any` cleanup (197 → 89 casts)                        |

---

## 🔧 SCRIPTS & COMMANDS

```bash
# Route coverage audit
pnpm coverage:routes          # Full table
pnpm coverage:unprotected     # Only unprotected routes
pnpm coverage:routes:json     # JSON output for CI

# Tests
pnpm test:sprint26            # Sprint 26 critical flow tests
pnpm test:smoke               # Smoke suite
pnpm test:all                 # Everything

# Build verification
pnpm build                    # Next.js build (should be GREEN)

# TS errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l   # Count all
```

---

_This is the single source of truth. Everything else is context._
_Last updated: February 19, 2026 — Pipeline fix, /tools page, /reports nav fix, Master TODO built_
