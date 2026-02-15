# SkaiScrape / ClearSkai — Comprehensive Remaining-Work Roadmap

> Generated from full system audit on commit `0af16fe`  
> Platform: Next.js 14 + Prisma + Supabase + Clerk + Stripe + Vercel  
> Scale: **861 API routes · 486 pages · 5,999-line Prisma schema · 230 DB migrations**

---

## 🔴 TIER 1 — BLOCKING (Must fix before any real user touches it)

### 1.1 TypeScript Errors in Active Portal Pages

**3 errors — users will hit broken pages**

| File                                 | Line | Error                                  |
| ------------------------------------ | ---- | -------------------------------------- |
| `src/app/portal/find-a-pro/page.tsx` | 981  | `.slug` doesn't exist on `Pro` type    |
| `src/app/portal/network/page.tsx`    | 688  | `.slug` doesn't exist on type          |
| `src/app/portal/network/page.tsx`    | 801  | `.slug` doesn't exist on `TrendingPro` |

**Fix:** Add `slug: string` to the Pro / TrendingPro type definitions, or change `.slug` to `.id`.

---

### 1.2 Team Invite Emails Never Sent

**File:** `src/app/api/trades/company/seats/invite/route.ts` (lines 126, 155)

Two `// TODO: Send invite email` stubs. The route creates the DB record and returns success, but **no email is ever delivered**. A contractor inviting a team member gets a green checkmark while the invitee never receives anything.

**Fix:** Wire up the existing `src/lib/mailer.ts` (Resend) to send an invite email with token link.

---

### 1.3 Notifications Never Stored (Model Missing)

**6 routes** try to create notifications but `TradeNotification` / `ClientNotification` models don't exist:

- `src/app/api/portal/messages/[threadId]/send/route.ts` — line 67
- `src/app/api/portal/messages/create-thread/route.ts` — line 146
- `src/app/api/messages/[threadId]/route.ts` — line 248
- `src/app/api/trades/accept/route.ts` — line 185
- `src/app/api/trades/attach-to-claim/route.ts` — line 180
- `src/app/api/portal/claims/[claimId]/accept/route.ts` — line 165

**Impact:** Users accept claims, send messages, attach trades — zero notifications delivered.

**Fix:** Add `TradeNotification` model to Prisma schema, run migration, uncomment the create calls.

---

### 1.4 Unprotected Portal API Routes (Auth Missing)

**9 portal routes** have no `auth()` / `getAuth()` call:

| Route                                             | Risk                        |
| ------------------------------------------------- | --------------------------- |
| `portal/invite`                                   | Invite enumeration          |
| `portal/profile`                                  | Profile data leak           |
| `portal/client/upload`                            | Unauthenticated uploads     |
| `portal/claims/[claimId]/accept`                  | Anyone can accept claims    |
| `portal/claims/[claimId]/files`                   | File access without auth    |
| `portal/claims/[claimId]/files/[fileId]/comments` | Comment injection           |
| `portal/claims/[claimId]/events`                  | Event data leak             |
| `portal/claims/[claimId]/timeline`                | Timeline data leak          |
| `portal/resolve-token`                            | May be intentionally public |

**Fix:** Add Clerk `auth()` check to each route (except resolve-token if it's a public invite flow).

---

### 1.5 Onboarding Invite Model Missing

**File:** `src/app/api/trades/onboarding/create-company/route.ts` — line 118

`tradesOnboardingInvite` model doesn't exist. If a contractor was invited to join, the onboarding flow can't link the invite to the company.

---

## 🟠 TIER 2 — BROKEN FEATURES (Routes exist but return stubs/errors)

### 2.1 Deprecated Routes Still Active (31 routes)

31 API routes are marked `DEPRECATED` with comments like "model doesn't exist in schema" but are **still importable and callable**. They return empty arrays or error stubs:

| Category            | Routes                                                                          | Missing Models                                                |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Vendor Intelligence | `vendors/usage`, `client-follows`                                               | `vendorUsageHistory`, `clientCompanyFollow`                   |
| Artifacts           | `artifacts/*` (5 routes)                                                        | `generatedArtifact`                                           |
| Templates           | `templates`, `templates/categories`                                             | `universalTemplate`                                           |
| Reports             | `reports/presets`, `reports/custom`, `reports/delivery/track`, `reports/resend` | `reportPreset`, `custom_reports`, `email_queue`, `email_logs` |
| Claims              | `claims/start`, `claims/[id]/attach-contact`, `claims/[id]/evidence`            | `claimsReport`, `evidenceCollection`, `evidenceAsset`         |
| Trade Partners      | `claims/[id]/trades`, `claims/[id]/trade-partners`                              | `ClaimTradePartner`                                           |
| HOA                 | `hoa/notices/*` (3 routes)                                                      | `hoaNoticePack`                                               |
| Retail              | `retail-jobs`, `retail/start`, `retail/save`                                    | `RetailJob`                                                   |
| Jobs                | `job-cost/*` (2 routes)                                                         | `JobCost`                                                     |
| AI/Ops              | `ops/ai-stats`                                                                  | `jobRun`                                                      |
| Community           | `community/create`, `trades/posts/[id]/comments`                                | `community`, `tradeComment`                                   |
| Docs                | `company-docs/*`, `documents/share`                                             | `companyDocumentTemplate`, `documentShare`                    |
| Mailers             | `mailers/batches`                                                               | `mailerBatch`                                                 |
| Notifications       | `notifications/job-scheduled`, `notifications/team-assignment`                  | `scheduled_jobs`                                              |
| Analytics           | `analytics/batch`, `conversion/track`                                           | `qrLink`, `conversionEvent`                                   |
| Photos              | `photos`                                                                        | `beforeAfterPhoto`                                            |
| Webhooks            | `webhooks/lob`                                                                  | `mailerJob`                                                   |
| Services            | `service-requests`, `trades/add-service`, `trades/remove-service`               | `serviceRequest`, `contractorService`                         |
| Network             | `network/connect`                                                               | `connectionRequest`                                           |
| Team                | `team/posts`                                                                    | `TeamPost`                                                    |

**Decision needed:** For each — either add the model and implement, or delete the route entirely.

---

### 2.2 Claims Pipeline Gaps

| Feature             | File                                       | Issue                                                  |
| ------------------- | ------------------------------------------ | ------------------------------------------------------ |
| Trade Partners      | `claims/[claimId]/trades/route.ts`         | `ClaimTradePartner` model missing — 3 handlers stubbed |
| Evidence Collection | `claims/[claimId]/evidence/route.ts`       | `evidenceCollection`/`evidenceAsset` missing           |
| File Visibility     | `claims/[claimId]/files/[fileId]/route.ts` | `visibleToClient` field not on `FileAsset`             |
| Document Sharing    | `claims/documents/sharing/route.ts`        | `sharedDocumentIds` not on `ClaimClientLink`           |
| Claim Import        | `claims/[claimId]/import/route.ts`         | `estimate_line_items` model TODO                       |
| Status Lifecycle    | `claims/[claimId]/status/route.ts`         | `lifecycleStage` column missing                        |
| Claim Predict       | `claims/[claimId]/predict/route.ts`        | Photo count hardcoded to 0                             |

---

### 2.3 Batch & AI Features Stubbed

| Feature         | File                              | Issue                                              |
| --------------- | --------------------------------- | -------------------------------------------------- |
| Batch Proposals | `batch-proposals/create/route.ts` | `BatchJob` model missing                           |
| Approvals       | `approvals/respond/route.ts`      | `ClaimApproval` model missing                      |
| AI Dispatch     | `ai/dispatch/[claimId]/route.ts`  | `contractor_dispatch`, `ai_actions` tables missing |

---

### 2.4 Report Email Delivery Incomplete

- `reports/generate/route.ts:372` — notification after report generation is TODO
- `reports/email/route.ts:246` — `email_logs` model doesn't exist (no delivery tracking)
- `reports/[reportId]/send/route.ts:47` — share token is ephemeral (not persisted)

---

## 🟡 TIER 3 — SECURITY & AUTH HARDENING

### 3.1 Auth Coverage Gaps

**244 API routes** (of ~861) have no visible auth check in the file itself. Many may be protected by middleware.ts (Clerk's route matcher), but need verification:

**High-risk unprotected routes to audit:**

- `clients/route.ts` & `clients/search/route.ts` — client data
- `notify/send/route.ts` — send notifications without auth
- `pipeline/route.ts` — pipeline data
- `tasks/route.ts` — task management
- `claims/[claimId]/update/route.ts` — claim modification
- `claims/[claimId]/evidence/upload/route.ts` — evidence upload
- `claims/[claimId]/artifacts/*` — artifact access
- `claims/[claimId]/context/route.ts` — claim context data
- `claims/[claimId]/final-payout/submit/route.ts` — payout submission

**Fix:** Cross-reference middleware.ts route matcher config against every route. Add explicit `auth()` calls to any route handling sensitive data.

---

### 3.2 Org Isolation

Several routes fetch data but may not filter by `orgId`:

- Verify all claim queries include `orgId` in WHERE clause
- Verify file/upload routes check ownership
- Verify message routes check thread membership

---

### 3.3 Stripe Webhook Security

✅ Webhook signature verification is present (`stripe.webhooks.constructEvent`) — good.
✅ No hardcoded Stripe keys found in active code — good.
⚠️ Verify `STRIPE_WEBHOOK_SECRET` env var is set in Vercel.

---

## 🔵 TIER 4 — FEATURE COMPLETION

### 4.1 Email System

- ✅ Resend SDK is configured (`src/lib/mailer.ts`)
- ✅ Email templates exist in `emails/` directory
- 🔲 Team invite emails — TODO stubs (Tier 1)
- 🔲 Report delivery emails — partial
- 🔲 Claim acceptance emails — notification model missing
- 🔲 Email retry cron exists but `email_queue` model is missing

### 4.2 Portal Features Needing Work

- 🔲 `portal/jobs/route.ts` — "Model doesn't exist, falls back to claims"
- 🔲 `portal/posts/route.ts` — "Table doesn't exist yet, returns empty"
- 🔲 `portal/claims/create/route.ts:116` — "Lead matching — trades models not yet implemented"
- 🔲 `portal/claims/[id]/files/[fileId]/comments/route.ts` — `ClaimFileComment` model missing

### 4.3 Cron Jobs

All 8 Vercel crons have route files ✅, but some have model dependencies:

- `cron/trials/sweep` — "Trial fields not in schema — skipping sweep"
- `cron/process-batch-jobs` — depends on `BatchJob` model (missing)
- `cron/email-retry` — depends on `email_queue` model (missing)

### 4.4 UI TODOs

- PDF export for reports
- ZIP bundling for carrier document packages
- Stripe checkout for cold storage ($7.99/mo)
- Edit modals for various profile sections
- Vendor PDF route verification (seeded URLs are valid CDN links — need spot-check)

---

## ⚪ TIER 5 — INFRASTRUCTURE & TECH DEBT

### 5.1 Dual Schema Risk

- Prisma schema uses default `public` schema (5,999 lines)
- Some SQL migrations reference `app` schema
- Manual SQL migrations (230 files in `db/migrations/`) coexist with Prisma migrations (17 dirs in `prisma/migrations/`)
- **Recommendation:** Audit which schema each table lives in. Consolidate to one migration system.

### 5.2 Test Infrastructure

- 43 test/spec files exist across `__tests__/`, `e2e/`, `playwright/`, `tests/`
- CI runs build + smoke tests but **doesn't run the full test suite**
- Playwright config exists but e2e tests may need DB/env setup
- **Recommendation:** Run all tests locally, fix failures, add `pnpm test` to CI.

### 5.3 CI Pipeline Gaps

Current CI does:

- ✅ Install → Prisma Generate → Schema Validate → Build → Smoke Tests → Build Guard

Current CI does NOT:

- 🔲 `tsc --noEmit` (would catch the 3 portal errors)
- 🔲 `pnpm test` (unit/integration tests)
- 🔲 Prisma migrate validation
- 🔲 ESLint
- 🔲 Playwright e2e

### 5.4 Dead Code Cleanup

- 31 deprecated API routes should be deleted or implemented
- `_disabled/` and `_wip/` folders (11 TS errors) — decide: implement or remove
- `archive/` folder with legacy code — safe to ignore but bloats repo

### 5.5 Legal Acceptance

- `legal/accept/route.ts` — "orgId not in schema" — legal acceptances can't be tied to orgs

---

## 📋 PRIORITIZED SPRINT PLAN

### Sprint 1 — "Make It Not Break" (1-2 days)

1. [ ] Fix 3 TS errors in portal pages (`.slug` → `.id` or add to type)
2. [ ] Wire invite emails via Resend in `seats/invite/route.ts`
3. [ ] Add `auth()` to 9 unprotected portal API routes
4. [ ] Add `TradeNotification` model to Prisma schema + migration
5. [ ] Uncomment notification creates in 6 routes

### Sprint 2 — "Core Claims Pipeline" (2-3 days)

6. [ ] Add `ClaimTradePartner` model → unblock trade partner assignment
7. [ ] Add `visibleToClient` field to `FileAsset` → client file sharing
8. [ ] Add `sharedDocumentIds` to `ClaimClientLink`
9. [ ] Add `ClaimFileComment` model → portal file comments
10. [ ] Add `lifecycleStage` to claims for status tracking
11. [ ] Wire report delivery emails end-to-end

### Sprint 3 — "Portal Polish" (2-3 days)

12. [ ] Implement lead matching for portal claim creation
13. [ ] Fix portal/jobs to use real model (or remove)
14. [ ] Fix portal/posts community feed
15. [ ] Test all 26 portal pages end-to-end
16. [ ] Spot-check vendor PDFs in browser

### Sprint 4 — "Security Audit" (1-2 days)

17. [ ] Audit all 244 potentially unprotected routes against middleware config
18. [ ] Add explicit auth to any route handling PII/financial data
19. [ ] Verify org-isolation on all claim/file/message queries
20. [ ] Verify Stripe env vars in Vercel

### Sprint 5 — "Infrastructure" (2-3 days)

21. [ ] Add `tsc --noEmit` to CI workflow
22. [ ] Run all 43 test files, fix failures
23. [ ] Add `pnpm test` to CI
24. [ ] Delete or decide on 31 deprecated routes
25. [ ] Audit and consolidate dual schema usage
26. [ ] Document which Prisma models map to which features

### Sprint 6 — "Feature Completion" (3-5 days)

27. [ ] Implement `generatedArtifact` model → AI artifact storage
28. [ ] Implement `BatchJob` model → batch proposals
29. [ ] Implement `email_queue` model → email retry cron
30. [ ] PDF export for reports
31. [ ] ZIP bundling for carrier document packages
32. [ ] Cold storage Stripe checkout

---

## 📊 SCOREBOARD

| Metric                                   | Count      |
| ---------------------------------------- | ---------- |
| Active TS errors (non-disabled)          | **3**      |
| Routes missing auth (needs audit)        | **244**    |
| Deprecated stub routes                   | **31**     |
| Missing Prisma models referenced in code | **~25+**   |
| TODO/FIXME in active code                | **~40**    |
| Test files (need validation)             | **43**     |
| Cron jobs (need model deps)              | **3 of 8** |
| Portal routes needing work               | **4**      |
| Invite emails sent                       | **0** ❌   |
| Notifications stored                     | **0** ❌   |

---

_This is the future of trades. Let's finish it right._ 🏗️
