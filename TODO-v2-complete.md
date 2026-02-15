# 🏗️ ClearSkai Master TODO — The Road to 10/10

> **Generated:** February 9, 2026 — Post-Audit  
> **Rebuilt:** February 11, 2026 — Definitive master plan after deep platform audit  
> **Production:** https://www.skaiscrape.com  
> **GitHub:** ClearSkaiTechnologiesLLC/Skaiscrape (main)  
> **TypeScript:** ✅ ZERO errors  
> **VS Code Problems:** ✅ ZERO errors  
> **Current Score:** 8.1/10  
> **Target:** 10.0/10  
> **Architecture:** Next.js 14 · Clerk · Prisma · Supabase · Stripe · Vercel  
> **Scale:** 332 pages · 904 API routes · 6,243-line schema · 49 sidebar nav items

---

## 📊 PHASE SCORING MAP — 215 TOTAL ITEMS

| Phase | Name                       | Items    | Score After | Effort          |
| ----- | -------------------------- | -------- | ----------- | --------------- |
| 0     | ✅ Foundation (DONE)       | 30 done  | **8.1/10**  | Complete        |
| 1     | 🔴 Trust Floor             | 48 items | **8.5/10**  | ~2 sprints      |
| 2     | 🟠 Guardrails              | 32 items | **9.0/10**  | ~2 sprints      |
| 3     | 🟡 UX Confidence           | 40 items | **9.3/10**  | ~2 sprints      |
| 4     | 🔵 Scale & Trust           | 35 items | **9.6/10**  | ~2 sprints      |
| 5     | 🟢 Delight & Differentiate | 30 items | **10.0/10** | ~2 sprints      |
| —     | **GRAND TOTAL**            | **215**  | —           | **~10 sprints** |

---

## ✅ PHASE 0: FOUNDATION (COMPLETE)

Everything shipped in sessions Feb 9–11, 2026.

| #   | Item                                                                                      | Status |
| --- | ----------------------------------------------------------------------------------------- | ------ |
| —   | TypeScript: 90 errors → 0 across 14 files                                                 | ✅     |
| —   | VS Code Problems tab: 0 errors                                                            | ✅     |
| —   | SectionKey type + SectionRegistry expanded (weather-verification, test-cuts, supplements) | ✅     |
| —   | RightPanel label→title fix                                                                | ✅     |
| —   | Portal prisma.ClientProConnection → camelCase                                             | ✅     |
| —   | Referrals estimatedValue → value (matching DB)                                            | ✅     |
| —   | MaterialOrder create: added id + updatedAt                                                | ✅     |
| —   | find-pro userId in select (2 queries)                                                     | ✅     |
| —   | Public profile id scope fix (try/catch)                                                   | ✅     |
| —   | Missing lucide imports (Share2, TrendingUp)                                               | ✅     |
| —   | Public profile metadata type annotation                                                   | ✅     |
| —   | Profile API hardening (body.firstName/lastName)                                           | ✅     |
| —   | Company auto-create fix (no firstName+lastName fallback)                                  | ✅     |
| —   | Damien Willingham profile/company restore                                                 | ✅     |
| —   | Profile 5-attempt fix chain deployed                                                      | ✅     |
| —   | 33 missing tradesCompanyMember columns migrated                                           | ✅     |
| —   | 7 missing tradesCompany columns migrated                                                  | ✅     |
| —   | Prisma Decimal/Date/BigInt serialization fix                                              | ✅     |
| —   | Notifications API hardened (raw SQL try/catch)                                            | ✅     |
| —   | Nav badges scheduledAt→startTime                                                          | ✅     |
| —   | Self-healing 4-step company resolution                                                    | ✅     |
| —   | Dark mode polish (11 pages)                                                               | ✅     |
| —   | Clearbit vendor logos (50+)                                                               | ✅     |
| —   | Multi-category vendor mapping                                                             | ✅     |
| —   | Ghost company cleanup migration                                                           | ✅     |
| —   | MessageThread archive (archivedAt/archivedBy + PATCH)                                     | ✅     |
| —   | Delete/archive: messages, claims, leads (RecordActions)                                   | ✅     |
| —   | Brochure PDF URLs fixed (6 GAF products)                                                  | ✅     |
| —   | Notifications: clear on read + pro bell + deep-link nav                                   | ✅     |
| —   | Org planKey set to solo_plus                                                              | ✅     |

---

## 🔴 PHASE 1: TRUST FLOOR → 8.5/10

> **Goal:** No fake numbers. No dead buttons. No shell pages exposed to users.  
> **Principle:** Every surface showing data MUST be real, or it must be hidden.

---

### 1A. Settings Page — Wire ALL Save Handlers

| #   | Task                                                                                           | File              | Priority |
| --- | ---------------------------------------------------------------------------------------------- | ----------------- | -------- |
| 1   | Wire "Display Name" input — add onChange + save to Clerk API                                   | settings/page.tsx | 🔴       |
| 2   | Wire "Email Notifications" checkbox — persist to user preferences                              | settings/page.tsx | 🔴       |
| 3   | Wire "Lead Alerts" checkbox — persist to user preferences                                      | settings/page.tsx | 🔴       |
| 4   | Wire "Weekly Summary" checkbox — persist to user preferences                                   | settings/page.tsx | 🔴       |
| 5   | Wire "Organization Name" input — save to Org model                                             | settings/page.tsx | 🔴       |
| 6   | Wire "Default Timezone" dropdown — save to Org model                                           | settings/page.tsx | 🔴       |
| 7   | Create `POST /api/settings/notifications` — persist per-user notification prefs                | New file          | 🔴       |
| 8   | Create `POST /api/settings/organization` — persist org name + timezone                         | New file          | 🔴       |
| 9   | Wire "Export My Data" button — GDPR data export (JSON download of user's data)                 | settings/page.tsx | 🔴       |
| 10  | Wire "Delete Account" button — confirmation dialog + Clerk account deletion flow               | settings/page.tsx | 🔴       |
| 11  | Add `UserPreferences` model to Prisma (notificationEmail, leadAlerts, weeklySummary, timezone) | schema.prisma     | 🔴       |

### 1B. Contracts Page — Fix Value Bug + Detail Page

| #   | Task                                                                                  | File               | Priority |
| --- | ------------------------------------------------------------------------------------- | ------------------ | -------- |
| 12  | ✅ Fix `estimateTotal` → `estimatedValue` in insurance value reduce (always shows $0) | contracts/page.tsx | ✅ DONE  |
| 13  | Wire "New Contract" button to creation flow or claim/job selection                    | contracts/page.tsx | 🔴       |
| 14  | Add contract detail page at `/contracts/[id]` (show claim/job details)                | New file           | 🟠       |

### 1C. Time Tracking — Fix Field Mismatches

| #   | Task                                                                           | File                   | Priority |
| --- | ------------------------------------------------------------------------------ | ---------------------- | -------- |
| 15  | ✅ Fix `pendingApprovals` — wire to real query instead of hardcoded 0          | time-tracking/page.tsx | ✅ DONE  |
| 16  | ✅ Fix schedule select — use `date` field (title/status/startTime don't exist) | time-tracking/page.tsx | ✅ DONE  |
| 17  | ✅ Fix member table — use `createdAt` instead of nonexistent `joinedAt`        | time-tracking/page.tsx | ✅ DONE  |

### 1D. Referrals — Fix Missing Fields

| #   | Task                                                                  | File               | Priority |
| --- | --------------------------------------------------------------------- | ------------------ | -------- |
| 18  | ✅ Add `contacts` relation to leads select so referral name resolves  | referrals/page.tsx | ✅ DONE  |
| 19  | Create `/refer/[orgSlug]` public route to handle referral link clicks | New file           | 🟠       |
| 20  | Add referral source tracking — attribute lead to referring link       | referrals/page.tsx | 🟠       |

### 1E. Kill Remaining Mock/Fake Data

| #   | Task                                                                                  | File                      | Priority |
| --- | ------------------------------------------------------------------------------------- | ------------------------- | -------- |
| 21  | ✅ Remove `mockBids` fallback array in `/bids/page.tsx` — show empty state instead    | bids/page.tsx             | ✅ DONE  |
| 22  | ✅ Remove `mockCart` in `/materials/cart/page.tsx` — fallback to empty array          | materials/cart/page.tsx   | ✅ DONE  |
| 23  | ✅ Remove "Export generated successfully (mock data)" → "coming soon"                 | carrier/export/client.tsx | ✅ DONE  |
| 24  | ✅ Remove same mock export message in ai/exports → "coming soon"                      | ai/exports/page.tsx       | ✅ DONE  |
| 25  | ✅ Delete `trades-hub/page.tsx.OLD_MOCK_DELETE_LATER` — DELETED                       | trades-hub/               | ✅ DONE  |
| 26  | ✅ Fix placeholder geocoding in `/jobs/map/actions.ts` — deterministic hash           | jobs/map/actions.ts       | ✅ DONE  |
| 27  | ✅ Fix placeholder geocoding in `/route-optimization/actions.ts` — deterministic hash | route-optimization/       | ✅ DONE  |
| 28  | ✅ Fix fake `Math.random()` analytics in `lib/analytics/tenant.ts` → zeros/empty      | lib/analytics/tenant.ts   | ✅ DONE  |

### 1F. Portal Dashboard & Profile — Wire Real Stats

| #   | Task                                                             | File            | Priority |
| --- | ---------------------------------------------------------------- | --------------- | -------- |
| 29  | Wire `projectCount` to real Prisma count (currently hardcoded 0) | portal/page.tsx | 🔴       |
| 30  | Wire `messageCount` to real unread message count                 | portal/page.tsx | 🔴       |
| 31  | Wire `bidCount` to real pending bid/request count                | portal/page.tsx | 🔴       |
| 32  | Wire portal profile "Active Projects" to real count              | portal/profile/ | 🔴       |
| 33  | Wire portal profile "Saved Contractors" to real count            | portal/profile/ | 🔴       |
| 34  | Wire portal profile "Claims" to real count                       | portal/profile/ | 🔴       |
| 35  | Wire portal profile "Messages" to real count                     | portal/profile/ | 🔴       |

### 1G. Sidebar — Hide Unfinished Surfaces

| #   | Task                                                                        | File           | Priority |
| --- | --------------------------------------------------------------------------- | -------------- | -------- |
| 36  | Add plan-gated visibility to AppSidebar — hide items based on org plan tier | AppSidebar.tsx | 🔴       |
| 37  | Add feature-flag gating to sidebar items — hide unreleased features         | AppSidebar.tsx | 🔴       |
| 38  | Hide "AI Recommendations" if `FEATURE_AI_TOOLS` is off                      | AppSidebar.tsx | 🔴       |
| 39  | Hide "Mockup Generator" if `FEATURE_MOCKUP_GENERATOR` is off                | AppSidebar.tsx | 🔴       |
| 40  | Hide "Vision Labs" if `FEATURE_VISION_AI` is off                            | AppSidebar.tsx | 🔴       |

### 1H. Reviews Page — Replace Demo Data

| #   | Task                                                                           | File             | Priority |
| --- | ------------------------------------------------------------------------------ | ---------------- | -------- |
| 41  | ✅ Already wired to `/api/trades/reviews` — TODO was incorrect (not hardcoded) | reviews/page.tsx | ✅ DONE  |
| 42  | Build review submission form with star rating + photo upload                   | reviews/page.tsx | 🟠       |
| 43  | Add review reply endpoint at `trades/reviews/[id]/reply/route.ts`              | New file         | 🟠       |

### 1I. Dashboard AI Panel — Fix or Feature-Flag

| #   | Task                                                                                      | File               | Priority |
| --- | ----------------------------------------------------------------------------------------- | ------------------ | -------- |
| 44  | ✅ DashboardAIPanel already wrapped in AsyncBoundary (error boundary)                     | dashboard/page.tsx | ✅ DONE  |
| 45  | Re-enable DashboardAIPanel import + JSX (currently commented out)                         | dashboard/page.tsx | 🟠       |
| 46  | ✅ Removed 🔥 console.log debug spam                                                      | dashboard/page.tsx | ✅ DONE  |
| 47  | Remove self-fetch to `/api/diag/ready` (server component fetching own API is antipattern) | dashboard/page.tsx | 🔴       |
| 48  | Remove hardcoded Phoenix, AZ default location — use org location or prompt                | dashboard/page.tsx | 🟠       |

---

## 🟠 PHASE 2: GUARDRAILS → 9.0/10

> **Goal:** Regressions become impossible. Auth is audited. CI enforces correctness.

---

### 2A. CI Pipeline — Enforce Quality on Every PR

| #   | Task                                                                     | File                     | Priority |
| --- | ------------------------------------------------------------------------ | ------------------------ | -------- |
| 49  | Add `pnpm typecheck` (tsc --noEmit) to `ci.yml` workflow                 | .github/workflows/ci.yml | 🔴       |
| 50  | Add `pnpm lint:core` to CI workflow                                      | ci.yml                   | 🔴       |
| 51  | Add `pnpm test` (Playwright smoke) to CI workflow                        | ci.yml                   | 🟠       |
| 52  | Add Playwright E2E to CI (at minimum smoke project)                      | ci.yml                   | 🟠       |
| 53  | Configure test coverage reporting (lcov → PR comment)                    | ci.yml                   | 🟡       |
| 54  | Add CI check: `tsc --project tsconfig.typecheck.json --noEmit` must pass | ci.yml                   | 🔴       |

### 2B. Auth Route Audit — Close Security Gaps

| #   | Task                                                                                    | File              | Priority |
| --- | --------------------------------------------------------------------------------------- | ----------------- | -------- |
| 55  | Audit all 383 API routes without `auth()` — categorize: intentionally public vs missing | Script            | 🔴       |
| 56  | Add `auth()` to `/api/clients/route.ts` (client data exposure)                          | clients/route.ts  | 🔴       |
| 57  | Add `auth()` to `/api/pipeline/route.ts` (business pipeline data)                       | pipeline/route.ts | 🔴       |
| 58  | Add `auth()` to `/api/messages/unread/route.ts` (private conversations)                 | messages/unread/  | 🔴       |
| 59  | Add `auth()` to `/api/notify/push/route.ts` (arbitrary notification sending)            | notify/push/      | 🔴       |
| 60  | Add `auth()` to `/api/artifacts/` routes (document access)                              | artifacts/        | 🔴       |
| 61  | Add `auth()` to `/api/branding/` routes (org branding modification)                     | branding/         | 🟠       |
| 62  | Restrict `/api/diag/` routes — env/DB/Clerk/AI status should not be public              | diag/             | 🟠       |
| 63  | Create script `scripts/audit-auth.ts` — auto-detect routes missing auth                 | New file          | 🟠       |

### 2C. Org Isolation — Verify Tenant Boundaries

| #   | Task                                                                 | File               | Priority |
| --- | -------------------------------------------------------------------- | ------------------ | -------- |
| 64  | Verify all claim queries include `orgId` where clause                | All claim routes   | 🔴       |
| 65  | Verify all lead queries include `orgId` where clause                 | All lead routes    | 🔴       |
| 66  | Verify all message queries scope to user's threads only              | All message routes | 🔴       |
| 67  | Verify all file/document queries scope to org                        | All file routes    | 🔴       |
| 68  | Add Playwright org-isolation test: user A cannot see user B's claims | tests/             | 🟠       |

### 2D. Notifications — Consolidate the 3 Competing Systems

| #   | Task                                                                                         | File              | Priority |
| --- | -------------------------------------------------------------------------------------------- | ----------------- | -------- |
| 69  | Delete broken `/api/notifications/v2/` — references nonexistent model, crashes on every call | notifications/v2/ | 🔴       |
| 70  | Build unified `NotificationService` class in `src/lib/notifications/service.ts`              | New file          | 🟠       |
| 71  | Migrate raw SQL notifications tables to Prisma-managed                                       | Migration         | 🟠       |
| 72  | Add auth check to `notifications/email/route.ts` (currently anyone can trigger)              | notifications/    | 🔴       |
| 73  | Add auth check to `notifications/sms/route.ts` (currently anyone can trigger)                | notifications/    | 🔴       |
| 74  | Wire `notifications/email/route.ts` to Resend (replace console.log stub)                     | notifications/    | 🟠       |

### 2E. Deprecated Route Cleanup

| #   | Task                                                                                      | File              | Priority |
| --- | ----------------------------------------------------------------------------------------- | ----------------- | -------- |
| 75  | Audit 31 deprecated API routes — delete or migrate to current models                      | api/\_deprecated/ | 🟠       |
| 76  | Delete `/api/_deprecated/` directory (routes returning empty arrays)                      | api/\_deprecated/ | 🟠       |
| 77  | Consolidate `/api/portal/work-request` + `/api/portal/work-requests` (singular vs plural) | api/portal/       | 🟡       |
| 78  | Consolidate `/api/trades/onboarding` + `/api/trades/onboard`                              | api/trades/       | 🟡       |
| 79  | Consolidate `/api/trades/reviews` + `/api/trades/review`                                  | api/trades/       | 🟡       |
| 80  | Consolidate `/api/trades/connect` + `/api/trades/engage` + `/api/trades/connections`      | api/trades/       | 🟡       |

---

## 🟡 PHASE 3: UX CONFIDENCE → 9.3/10

> **Goal:** Everything feels intentional. Fast loads. Polished empty states.

---

### 3A. Loading States — Top 20 Routes

| #   | Task                                     | Route              | Priority |
| --- | ---------------------------------------- | ------------------ | -------- |
| 81  | Add loading.tsx for `/messages`          | trades/messages/   | 🟠       |
| 82  | Add loading.tsx for `/appointments`      | appointments/      | 🟠       |
| 83  | Add loading.tsx for `/contacts`          | contacts/          | 🟠       |
| 84  | Add loading.tsx for `/analytics`         | analytics/         | 🟠       |
| 85  | Add loading.tsx for `/contracts`         | contracts/         | 🟠       |
| 86  | Add loading.tsx for `/performance`       | performance/       | 🟠       |
| 87  | Add loading.tsx for `/referrals`         | referrals/         | 🟠       |
| 88  | Add loading.tsx for `/time-tracking`     | time-tracking/     | 🟠       |
| 89  | Add loading.tsx for `/billing`           | billing/           | 🟠       |
| 90  | Add loading.tsx for `/network`           | network/           | 🟠       |
| 91  | Add loading.tsx for `/weather`           | weather/           | 🟠       |
| 92  | Add loading.tsx for `/vendor-network`    | vendor-network/    | 🟠       |
| 93  | Add loading.tsx for `/materials`         | materials/         | 🟠       |
| 94  | Add loading.tsx for `/invitations`       | invitations/       | 🟠       |
| 95  | Add loading.tsx for `/calendar`          | calendar/          | 🟠       |
| 96  | Add loading.tsx for `/reviews`           | reviews/           | 🟠       |
| 97  | Add loading.tsx for `/search`            | search/            | 🟠       |
| 98  | Add loading.tsx for `/trades/profile`    | trades/profile/    | 🟠       |
| 99  | Add loading.tsx for `/portal/find-a-pro` | portal/find-a-pro/ | 🟠       |
| 100 | Add loading.tsx for `/portal/my-pros`    | portal/my-pros/    | 🟠       |

### 3B. Duplicate Route Cleanup

| #   | Task                                                                                      | Routes        | Priority |
| --- | ----------------------------------------------------------------------------------------- | ------------- | -------- |
| 101 | Consolidate `/ai/bad-faith` (812 lines) + `/ai/bad-faith-detector` (162 lines) → keep one | ai/           | 🟡       |
| 102 | Remove redirect `/ai/supplement` → `/ai/tools/supplement` — make one canonical            | ai/           | 🟡       |
| 103 | Remove redirect `/ai/rebuttal` → `/ai/tools/rebuttal`                                     | ai/           | 🟡       |
| 104 | Remove redirect `/ai/depreciation` → `/ai/tools/depreciation`                             | ai/           | 🟡       |
| 105 | Consolidate `/maps/map-view` (260 lines) + `/maps/view` (132 lines) → keep one            | maps/         | 🟡       |
| 106 | Remove `/jobs` redirect to `/pipeline` — move to middleware                               | middleware.ts | 🟡       |
| 107 | Remove `/network/feed` + `/network/metrics` legacy redirects                              | network/      | 🟡       |

### 3C. Stub Routes — Decide: Build or Remove from Nav

| #   | Task                                                           | Route    | Priority |
| --- | -------------------------------------------------------------- | -------- | -------- |
| 108 | `/reports/templates/pdf-builder` — Complete or remove from nav | reports/ | 🟡       |
| 109 | `/reports/smart` — Complete or remove                          | reports/ | 🟡       |
| 110 | `/reports/batch` — Complete or remove                          | reports/ | 🟡       |
| 111 | `/reports/analytics` — Complete or remove                      | reports/ | 🟡       |
| 112 | `/reports/community` — Complete or remove                      | reports/ | 🟡       |

### 3D. Portal UX Polish

| #   | Task                                                                  | File              | Priority |
| --- | --------------------------------------------------------------------- | ----------------- | -------- |
| 113 | Replace `window.alert()` in portal/claims/new with toast notification | portal/claims/    | 🟠       |
| 114 | Add standalone Notifications page for portal (currently header-only)  | portal/           | 🟠       |
| 115 | Fix portal/community/feed — connect to real API or remove             | portal/community/ | 🟠       |
| 116 | Fix portal/jobs — use real model or remove from nav                   | portal/jobs/      | 🟠       |
| 117 | Fix search results client link — `/portal/profiles/` not `/client/`   | search/page.tsx   | 🟡       |

### 3E. Pro Side UX Polish

| #   | Task                                                                       | File     | Priority |
| --- | -------------------------------------------------------------------------- | -------- | -------- |
| 118 | Standardize empty states across all list pages (claims, leads, jobs, etc.) | Multiple | 🟡       |
| 119 | Add "Back" navigation to all detail pages                                  | Multiple | 🟡       |
| 120 | Verify all toast notifications use sonner (not legacy alert())             | Multiple | 🟡       |

---

## 🔵 PHASE 4: SCALE & TRUST → 9.6/10

> **Goal:** Security hardened. Performance optimized. Testing enforced.

---

### 4A. Security Hardening

| #   | Task                                                                                        | File          | Priority |
| --- | ------------------------------------------------------------------------------------------- | ------------- | -------- |
| 121 | Replace ALL `$queryRawUnsafe` with `$queryRaw` (tagged template literals) — SQL injection   | Multiple      | 🔴       |
| 122 | Add input sanitization on user-generated content (reviews, messages, bios) — XSS prevention | lib/          | 🟠       |
| 123 | Add Content-Security-Policy headers via middleware or next.config.mjs                       | middleware.ts | 🟠       |
| 124 | Add rate limiting on auth-related endpoints (sign-in, sign-up, password reset)              | middleware.ts | 🟠       |
| 125 | Replace `Math.random()` for ID generation with `crypto.randomUUID()` everywhere             | Multiple      | 🟡       |

### 4B. Database Performance

| #   | Task                                                                              | File           | Priority |
| --- | --------------------------------------------------------------------------------- | -------------- | -------- |
| 126 | Parallelize sequential DB queries in notifications/route.ts with `Promise.all()`  | notifications/ | 🟠       |
| 127 | Add Prisma connection pool config for serverless (connection_limit, pool_timeout) | schema.prisma  | 🟠       |
| 128 | Add database query logging in development (`log: ['query']`)                      | lib/prisma.ts  | 🟡       |

### 4C. Stripe & Billing

| #   | Task                                                                             | File             | Priority |
| --- | -------------------------------------------------------------------------------- | ---------------- | -------- |
| 129 | Fix duplicate `case 'customer.subscription.updated'` in webhooks/stripe/route.ts | webhooks/stripe/ | 🔴       |
| 130 | Add receipt email on `checkout.session.completed`                                | webhooks/stripe/ | 🟠       |
| 131 | Verify all 6 Stripe price IDs in Vercel env vars match Stripe dashboard          | Vercel           | 🟠       |

### 4D. Testing — Write Critical Path Tests

| #   | Task                                                                               | File   | Priority |
| --- | ---------------------------------------------------------------------------------- | ------ | -------- |
| 132 | Add unit tests for trades profile API (GET/POST/PATCH flows)                       | tests/ | 🟠       |
| 133 | Add unit tests for company seats invite API (invite/revoke/accept)                 | tests/ | 🟠       |
| 134 | Add unit tests for Stripe webhook handler (critical billing path)                  | tests/ | 🟠       |
| 135 | Add unit tests for mailer functions (Resend integration)                           | tests/ | 🟡       |
| 136 | Run all 43 existing test files — fix failures                                      | tests/ | 🟠       |
| 137 | Add API auth-matrix test: verify unauthed requests get 401 on all protected routes | tests/ | 🟠       |

### 4E. Email System Completion

| #   | Task                                                                 | File                | Priority |
| --- | -------------------------------------------------------------------- | ------------------- | -------- |
| 138 | Add email template: New Message Received                             | email-templates/    | 🟠       |
| 139 | Add email template: New Review Posted                                | email-templates/    | 🟠       |
| 140 | Add email template: Claim Status Change                              | email-templates/    | 🟠       |
| 141 | Add email template: Job Assignment                                   | email-templates/    | 🟡       |
| 142 | Add email template: Order Status Update                              | email-templates/    | 🟡       |
| 143 | Wire team invite email (currently 2 TODO stubs in seat invite route) | api/trades/company/ | 🔴       |

### 4F. Settings Sub-pages

| #   | Task                                                                            | File                    | Priority |
| --- | ------------------------------------------------------------------------------- | ----------------------- | -------- |
| 144 | `/settings/security` — Replace hardcoded fake security logs with real audit log | settings/security/      | 🟠       |
| 145 | `/settings/backups` — Replace hardcoded mock backup data with real status       | settings/backups/       | 🟡       |
| 146 | `/settings/permissions` — Wire RBAC roles to real permission system             | settings/permissions/   | 🟡       |
| 147 | `/settings/service-areas` — Replace mock data with real service areas           | settings/service-areas/ | 🟡       |

### 4G. CRM Page Fixes

| #   | Task                                                                       | File         | Priority |
| --- | -------------------------------------------------------------------------- | ------------ | -------- |
| 148 | Fix `handleNextAction` — empty function body                               | crm/page.tsx | 🟠       |
| 149 | Replace hardcoded "Team Member" with real author name from `post.authorId` | crm/page.tsx | 🟠       |
| 150 | Replace `window.location.href` with `router.push()`                        | crm/page.tsx | 🟡       |
| 151 | Fix branding color swatches — `data-color` doesn't set background          | crm/page.tsx | 🟡       |

### 4H. Claims Intake Validation

| #   | Task                                                                  | File        | Priority |
| --- | --------------------------------------------------------------------- | ----------- | -------- |
| 152 | Add `NaN` guard on `deductible` field (parseInt on non-numeric = NaN) | api/claims/ | 🟠       |
| 153 | Fix orphaned `contactId` fallback (random UUID creates phantom FK)    | api/claims/ | 🟠       |
| 154 | Add Zod validation schema for all claim intake fields                 | api/claims/ | 🟠       |
| 155 | Add Zod validation to all API POST/PATCH routes (global standard)     | Multiple    | 🟡       |

---

## 🟢 PHASE 5: DELIGHT & DIFFERENTIATE → 10.0/10

> **Goal:** Mobile-ready. SEO-optimized. Accessible. Revenue-ready for aggressive sales.

---

### 5A. SEO & Marketing Pages

| #   | Task                                                                           | File             | Priority |
| --- | ------------------------------------------------------------------------------ | ---------------- | -------- |
| 156 | Add `generateMetadata` to all public pages (pricing, features, about, contact) | (marketing)/     | 🟡       |
| 157 | Add JSON-LD structured data: Organization, Product, LocalBusiness              | layout.tsx       | 🟡       |
| 158 | Add dynamic sitemap for public trades profiles (`server-sitemap.xml`)          | New file         | 🟡       |
| 159 | Add `canonical` URLs to prevent duplicate content                              | Multiple         | 🟡       |
| 160 | Add `noindex` to all authenticated app pages                                   | (app)/layout.tsx | 🟡       |

### 5B. PWA / Mobile

| #   | Task                                                                         | File          | Priority |
| --- | ---------------------------------------------------------------------------- | ------------- | -------- |
| 161 | Create `public/manifest.json` (name, icons, start_url, display, theme_color) | New file      | 🟡       |
| 162 | Generate PWA icons at 192x192 and 512x512 (ClearSkai branded)                | public/       | 🟡       |
| 163 | Add `<link rel="manifest">` + apple-touch-icon to root layout                | layout.tsx    | 🟡       |
| 164 | Add offline fallback page at `public/offline.html`                           | New file      | 🟡       |
| 165 | Full responsive audit at 375px — fix broken mobile layouts                   | Multiple      | 🟡       |
| 166 | Add bottom navigation bar for mobile viewport                                | New component | 🟡       |

### 5C. Accessibility

| #   | Task                                                            | File     | Priority |
| --- | --------------------------------------------------------------- | -------- | -------- |
| 167 | WCAG 2.1 AA audit — aria-labels on all interactive elements     | Multiple | 🟡       |
| 168 | Focus management — keyboard navigation through sidebar + modals | Multiple | 🟡       |
| 169 | Color contrast audit — ensure 4.5:1 ratio on all text           | Multiple | 🟡       |
| 170 | Screen reader testing with VoiceOver (macOS native)             | Manual   | 🟡       |

### 5D. Real-Time Messaging

| #   | Task                                                         | File      | Priority |
| --- | ------------------------------------------------------------ | --------- | -------- |
| 171 | Configure Supabase Realtime for message subscriptions        | lib/      | 🟡       |
| 172 | Replace 8-second polling in chat with real-time subscription | messages/ | 🟡       |
| 173 | Add typing indicators to chat UI                             | messages/ | 🟢       |
| 174 | Add online presence indicators (green dot)                   | messages/ | 🟢       |
| 175 | Add read receipts                                            | messages/ | 🟢       |

### 5E. Advanced Features

| #   | Task                                                                | File     | Priority |
| --- | ------------------------------------------------------------------- | -------- | -------- |
| 176 | Build Claims Ready Folder hub (`/claims/[id]/ready-folder`)         | claims/  | 🟡       |
| 177 | PDF export for complete report packets                              | reports/ | 🟡       |
| 178 | ZIP bundling for carrier document packages                          | reports/ | 🟡       |
| 179 | Xactimate ESX file parser in `lib/xactimate/parser.ts`              | lib/     | 🟢       |
| 180 | Admin dashboard (system overview, user management, billing metrics) | admin/   | 🟡       |

### 5F. Vendor Portal Enhancements

| #   | Task                                                     | File     | Priority |
| --- | -------------------------------------------------------- | -------- | -------- |
| 181 | Vendor analytics dashboard (views, leads, response time) | vendors/ | 🟢       |
| 182 | Vendor portfolio/gallery page (showcase past projects)   | vendors/ | 🟢       |
| 183 | Vendor certification badges system                       | vendors/ | 🟢       |
| 184 | Vendor availability calendar                             | vendors/ | 🟢       |

### 5G. CHANGELOG & Versioning

| #   | Task                                                                      | File         | Priority |
| --- | ------------------------------------------------------------------------- | ------------ | -------- |
| 185 | Update CHANGELOG.md — 3 months of unreleased work since v1.0.6 (Nov 2025) | CHANGELOG.md | 🟡       |

---

## 📋 QUICK-WIN BATCHES (Ship in 1 Session Each)

### ✅ Batch A: "Kill the Fakes" (Items 12–28, 41, 44, 46) — COMPLETE

16 items shipped. Mock data removed, field mismatches fixed, deterministic geocoding, debug logs cleaned.

### Batch B: "Wire the Settings" (Items 1–11)

Add save handlers + API endpoints for all settings inputs. Create `UserPreferences` model.

### Batch C: "Portal Stats" (Items 29–35)

Wire all 7 portal dashboard/profile stats to real Prisma counts.

### Batch D: "Sidebar Gating" (Items 36–40)

Add feature-flag + plan-tier visibility to sidebar. Hide surfaces that aren't ready.

### Batch E: "CI Lock" (Items 49–54)

Add typecheck + lint + test to CI workflow. Regressions become impossible.

### Batch F: "Auth Sweep" (Items 55–63)

Audit and fix the 383 unprotected API routes. Create audit script for ongoing enforcement.

### Batch G: "Loading Blitz" (Items 81–100)

Add loading.tsx to 20 routes in one session. Copy existing loading.tsx pattern.

### Batch H: "Route Cleanup" (Items 75–80, 101–112)

Delete deprecated routes, consolidate duplicates, remove stubs from nav.

---

## 📊 SUMMARY BY PRIORITY

| Priority  | Count   | Effort          |
| --------- | ------- | --------------- |
| 🔴 P0     | 52      | ~2 sprints      |
| 🟠 P1     | 58      | ~3 sprints      |
| 🟡 P2     | 52      | ~3 sprints      |
| 🟢 P3     | 23      | ~2 sprints      |
| **Total** | **185** | **~10 sprints** |

---

## 📈 SCORE PROGRESSION

```
Current:  ████████░░  8.1/10  (Foundation complete, TS clean, auth layered)
Phase 1:  ████████▌░  8.5/10  (No fake data, settings work, sidebar gated)
Phase 2:  █████████░  9.0/10  (CI enforced, auth audited, notifications unified)
Phase 3:  █████████▎  9.3/10  (Loading states, route cleanup, portal polish)
Phase 4:  █████████▌  9.6/10  (Security hardened, tests written, email complete)
Phase 5:  ██████████  10.0/10 (Mobile, SEO, accessibility, real-time, admin)
```

---

_Last updated: February 12, 2026_  
_Batch A: ✅ DONE (16 items) — Next: Batch B "Wire the Settings" (Items 1–11)_  
_Progress: 46/215 (21%) — Phase 0 ✅ + 16 Batch A items ✅_  
_Owner: Damien Ray, ClearSkai Technologies LLC_
