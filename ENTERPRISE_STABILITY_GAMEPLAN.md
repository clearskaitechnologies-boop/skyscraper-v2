# 🏗️ ENTERPRISE STABILITY GAME PLAN

> **Generated:** Post-purge system audit (commit `cb5e582`)
> **Goal:** Enterprise-grade stability before onboarding 180 users
> **Current state:** Build passes clean ✅ | 0 broken imports ✅ | 3,653 source files | 887 API routes | 449 pages

---

## 📊 AUDIT RESULTS SUMMARY

| Audit                    | Status  | Finding                                                           |
| ------------------------ | ------- | ----------------------------------------------------------------- |
| Build Health             | ✅ PASS | Zero compilation errors, clean build                              |
| Broken Imports           | ✅ PASS | Zero dangling imports from purge                                  |
| Middleware Auth Layer    | ✅ PASS | All non-public API routes return 401 at edge                      |
| In-Handler Auth Guards   | ⚠️ WARN | 128 routes missing in-handler auth (middleware covers them)       |
| Tenant Isolation (orgId) | ✅ GOOD | 580 routes use orgId in queries                                   |
| Error Boundaries         | ⚠️ WARN | 12 implementations (should be 3-4)                                |
| Test Coverage            | 🔴 LOW  | 43 test files for 3,653 source files (1.2%)                       |
| Provider Tree            | ✅ GOOD | Clean nesting, no duplication detected                            |
| Build Warnings           | ⚠️ INFO | 2 Sentry deprecations, 1 pdf-parse import, 34 dynamic-route noise |
| Template Routes Exposed  | 🔴 CRIT | `/api/templates(.*)` wildcard in public middleware list           |

---

## 🔴 P0 — CRITICAL (Do Before Any User Onboarding)

### P0-1: Template API Wildcard Exposure

**Risk:** The middleware `isPublicRoute` includes `"/api/templates(.*)"` which makes ALL 29 template routes publicly accessible — including `create`, `duplicate`, `set-default`, `generate-pdf`, `add-to-company`, etc.

**File:** [middleware.ts](middleware.ts#L96)

**Fix:**

```
Change:  "/api/templates(.*)"
To:      "/api/templates/marketplace(.*)",
         "/api/templates/health",
```

Only marketplace browsing and health checks should be public. All other template operations require auth.

**Impact:** Without this fix, anyone can create/delete/duplicate templates without authentication.

---

### P0-2: Vercel Clerk Environment Variable Corruption

**Risk:** Production Clerk env vars (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) have `\n` appended in Vercel Dashboard. This can cause intermittent auth failures.

**Fix:** Manual — Go to Vercel Dashboard → Settings → Environment Variables → Re-paste values without trailing newline.

---

### P0-3: Defense-in-Depth Auth Guards on Sensitive Routes

**Risk:** While middleware blocks unauthenticated requests, 128 API route handlers have NO in-handler auth check. If middleware is ever bypassed (misconfiguration, Vercel edge bug, testing), these routes are wide open.

**Priority routes needing `requireAuth()` added (17 highest-risk):**

| Route                                                    | Risk | Why                                  |
| -------------------------------------------------------- | ---- | ------------------------------------ |
| `api/signatures/save`                                    | 🔴   | Saves legally-binding signatures     |
| `api/reports/email`                                      | 🔴   | Sends emails via Resend              |
| `api/share/create`                                       | 🔴   | Creates shareable links to reports   |
| `api/claims/[claimId]/cover-photo`                       | 🔴   | Uploads to claims                    |
| `api/claims/[claimId]/evidence/collections/[sectionKey]` | 🔴   | Modifies evidence                    |
| `api/claims/[claimId]/documents`                         | 🔴   | Claim documents CRUD                 |
| `api/claims/[claimId]/photos`                            | 🔴   | Claim photos CRUD                    |
| `api/claims/[claimId]/update`                            | 🔴   | Updates claim data                   |
| `api/claims/create`                                      | 🔴   | Creates new claims                   |
| `api/permissions`                                        | 🟡   | Exposes permission matrix            |
| `api/dashboard/metrics`                                  | 🟢   | Server metrics (CPU/RAM only)        |
| `api/activity/list`                                      | 🟡   | Activity feed (currently returns []) |
| `api/ai/supplement/analyze`                              | 🟡   | OpenAI-powered analysis (costs $)    |
| `api/branding/get`                                       | 🟡   | Org branding data                    |
| `api/onboarding/complete`                                | 🟡   | Completes onboarding flow            |
| `api/onboarding/progress`                                | 🟡   | Reads onboarding state               |
| `api/client-portal/[slug]/profile`                       | 🟡   | Client profile data                  |

**Fix pattern (add 2 lines to each handler):**

```ts
import { requireAuth, isAuthError } from "@/lib/auth/requireAuth";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId, userId } = auth;
  // ... rest of handler, use orgId for queries
}
```

**Full list:** See [128 unprotected routes appendix](#appendix-a) below.

---

## 🟡 P1 — HIGH (First Sprint After Launch)

### P1-1: Error Boundary Consolidation (12 → 3)

**Current state:** 12 separate ErrorBoundary implementations.

| Keep      | File                               | Used By                          |
| --------- | ---------------------------------- | -------------------------------- |
| ✅        | `system/ErrorBoundary.tsx`         | App layouts (3 refs)             |
| ✅        | `portal/portal-error-boundary.tsx` | Portal error pages (18 refs)     |
| ✅        | `errors/SmartErrorBoundary.tsx`    | Feature-level wrapping           |
| ❌ Merge  | `app/app-error-boundary.tsx`       | → system/ErrorBoundary (9 refs)  |
| ❌ Merge  | `portal/PortalErrorBoundary.tsx`   | → portal-error-boundary (6 refs) |
| ❌ Delete | `errors/ApiErrorBoundary.tsx`      | 0 external refs                  |
| ❌ Delete | `errors/AuthErrorBoundary.tsx`     | 0 external refs                  |
| ❌ Delete | `errors/PaymentErrorBoundary.tsx`  | 0 external refs                  |
| ❌ Delete | `errors/RouteErrorBoundary.tsx`    | 0 external refs                  |
| ❌ Delete | `errors/TabErrorBoundary.tsx`      | 0 external refs                  |
| ❌ Delete | `errors/UploadErrorBoundary.tsx`   | 0 external refs                  |
| ⚠️ Keep   | `ai/AIWidgetErrorBoundary.tsx`     | AI-specific recovery             |

**Impact:** Simpler error handling, consistent UX, smaller bundle.

---

### P1-2: Test Coverage Emergency

**Current:** 43 test files / 3,653 source files = **1.2% file coverage**

**Existing tests (good foundation):**

- `tests/api/org-isolation.spec.ts` — Tenant isolation ✅
- `__tests__/api/auth-matrix.test.ts` — Auth matrix ✅
- `__tests__/lib/auth-guard.test.ts` — Guard logic ✅
- `__tests__/lib/rate-limit.test.ts` — Rate limiting ✅
- `__tests__/middleware.redirect.test.ts` — Middleware ✅

**Critical gaps to fill:**

1. **Auth matrix test expansion** — Cover all 17 P0-3 routes (verify they return 401 without auth)
2. **Tenant isolation tests** — Verify org A cannot access org B data on claims, reports, templates
3. **Middleware public route test** — Verify template wildcard fix doesn't break marketplace
4. **Smoke tests for core flows** — Dashboard load, claim create, report generate, signature save

---

### P1-3: Invoice Route Missing orgId Filter

**File:** `src/app/api/invoices/[id]/route.ts`

Route uses `safeOrgContext` but does NOT filter queries by `orgId`. This means:

- User from Org A could potentially access Org B's invoices if they guess the ID.

**Fix:** Add `where: { id, orgId }` to all Prisma queries in this file.

---

## 🟠 P2 — MEDIUM (Weeks 2-4)

### P2-1: Remaining Component Duplication Cleanup

**Headers (7 files):** Context-appropriate — keep as-is. PDF headers serve different purpose than app Header.

**Sidebars (5 files):** Context-appropriate — AppSidebar, ClaimSidebar, report SidebarNavs serve different domains.

**Components needing review (6 saved directories):**
| Directory | Files | Status |
|-----------|-------|--------|
| `src/components/claim/` | 6 | Review for overlap with `claims/` (40 files) |
| `src/components/client/` | 1 | Review purpose |
| `src/components/kpi/` | 1 | Review overlap with `kpi-dashboard/` |
| `src/components/lead/` | 1 | Review purpose |
| `src/components/rbac/` | 2 | Review — may be active |
| `src/components/uploads/` | 2 | Review — may be active |

**Rule:** Run `list_code_usages` before deleting ANYTHING. Never grep-only.

---

### P2-2: Build Warning Cleanup

| Warning                                      | Impact | Fix                                                   |
| -------------------------------------------- | ------ | ----------------------------------------------------- |
| Sentry `disableLogger` deprecation           | Low    | Update config per Sentry v8 docs                      |
| Sentry `automaticVercelMonitors` deprecation | Low    | Update config per Sentry v8 docs                      |
| `pdf-parse` default export error             | Medium | Switch to named import or check package               |
| 34 Dynamic server usage messages             | None   | Expected — API routes using `headers()` at build time |
| 2 Supabase storage cache key failures        | None   | Health check probes during build — harmless           |

---

### P2-3: `api/dashboard/metrics` Route Identity

This route returns **server OS metrics** (CPU, RAM, uptime) — NOT business dashboard data.

**Consider:** Rename to `api/ops/server-metrics` or `api/system/metrics` to avoid confusion. The business dashboard KPIs load from claims/reports, not this endpoint.

---

## 🟢 P3 — LOW (Backlog)

### P3-1: Provider Tree Optimization

Current tree is clean and correct:

```
RootLayout: PostHogProvider
  └─ (app) Layout: ToastProvider → AppProviders
       └─ RouteGroupProvider → PHProvider → TokenGateProvider
            → UserIdentityProvider → BrandingProvider → AssistantProvider
```

Minor: `PHProvider` (PostHog) appears in both root AND AppProviders. Verify no double-tracking.

### P3-2: Settings Persistence

Settings toggles don't persist (no API backend). Need `/api/settings` CRUD endpoint + DB model.

### P3-3: Client Portal Auth Hardening

`/portal(.*)` routes are in the public middleware list. Portal handles its own auth via Clerk components, but the middleware-level protection is absent. Evaluate adding middleware-level checks for portal data routes.

---

## 📋 EXECUTION ORDER

```
WEEK 0 (NOW - Before ANY onboarding):
  ☐ P0-1: Fix template middleware wildcard (5 min)
  ☐ P0-2: Fix Vercel Clerk env vars (10 min, manual)
  ☐ P0-3: Add requireAuth to top 17 routes (2-3 hours)
  ☐ P1-3: Fix invoice orgId filter (15 min)
  ☐ Deploy & verify

WEEK 1 (First users onboarding):
  ☐ P1-2: Write auth-matrix tests for all P0-3 routes
  ☐ P1-2: Write tenant isolation smoke tests
  ☐ P0-3: Continue adding requireAuth to remaining ~111 routes (batch of 20/day)
  ☐ Monitor Sentry for runtime errors

WEEK 2:
  ☐ P1-1: ErrorBoundary consolidation (12 → 3)
  ☐ P2-1: Review 6 saved component directories
  ☐ P2-2: Fix build warnings

WEEK 3-4:
  ☐ P2-3: Rename dashboard/metrics → ops/server-metrics
  ☐ P3-1: Audit PostHog double-tracking
  ☐ P3-2: Build settings persistence API
  ☐ P3-3: Portal middleware hardening
```

---

## APPENDIX A: All 128 Routes Without In-Handler Auth {#appendix-a}

> These are protected by Clerk middleware at the edge (returns 401 for unauthenticated requests).
> Adding `requireAuth()` in-handler provides defense-in-depth + tenant scoping via orgId.

```
api/activity/list
api/ai/damage/upload
api/ai/dashboard-assistant
api/ai/job-scanner
api/ai/proposals/run
api/ai/suggest-status
api/ai/supplement/analyze
api/ai/supplement/export-pdf
api/ai/weather/run
api/artifacts
api/artifacts/[id]
api/artifacts/[id]/export-pdf
api/artifacts/[id]/regenerate
api/audit/job/[jobId]
api/auth/debug
api/batch/generate-addresses
api/batch/generate-per-address-pdfs
api/branding/get
api/build-verify
api/bulk-actions
api/carrier/export/zip
api/carrier/track/[trackingId]/[action]
api/claims/[claimId]/ai-reports
api/claims/[claimId]/artifacts
api/claims/[claimId]/artifacts/[artifactId]
api/claims/[claimId]/artifacts/[artifactId]/export-pdf
api/claims/[claimId]/context
api/claims/[claimId]/cover-photo
api/claims/[claimId]/documents
api/claims/[claimId]/documents/[documentId]
api/claims/[claimId]/evidence/collections/[sectionKey]
api/claims/[claimId]/evidence/upload
api/claims/[claimId]/final-payout
api/claims/[claimId]/final-payout/generate-packet
api/claims/[claimId]/final-payout/submit
api/claims/[claimId]/photos
api/claims/[claimId]/photos/[photoId]
api/claims/[claimId]/reports
api/claims/[claimId]/trade-partners/[id]
api/claims/[claimId]/update
api/claims/create
api/claims/document/upload
api/claims/files/upload
api/claims/test/workspace
api/client-portal/[slug]/profile
api/client/auth/request
api/clients/search
api/config
api/contractor/profile
api/dashboard/metrics
api/flags/config/[key]
api/flags/export
api/flags/import
api/flags/invalidate/[key]
api/flags/list
api/flags/metrics
api/generate-test-docx
api/import-export
api/jobs
api/jobs/schedule
api/jobs/schedule/[jobId]
api/jobs/stream
api/leads/[id]/route
api/legal/document/[docId]
api/materials/orders
api/migrations/acculynx
api/ocr/image
api/ocr/pdf
api/onboarding/complete
api/onboarding/create-sample
api/onboarding/progress
api/ops/errors
api/ops/funnel-stats
api/ops/upload-stats
api/pdf/generate
api/permissions
api/portal/claims/[claimId]/accept
api/portal/claims/[claimId]/events
api/portal/claims/[claimId]/files
api/portal/claims/[claimId]/files/[fileId]/comments
api/portal/claims/[claimId]/timeline
api/portal/client/upload
api/portal/company/[slug]
api/portal/products
api/portal/resolve-token
api/project/materials/add
api/properties/map
api/proposals/run
api/qr/generate
api/queue/echo
api/referrals/create
api/reports
api/reports/email
api/reports/export
api/reports/recent
api/reports/summary
api/retail-jobs
api/routes-manifest
api/routes-manifest/_routes
api/share/create
api/signatures/save
api/status
api/storage/signed-read
api/storage/signed-upload
api/supplement/generate
api/support/tickets
api/system/storage-check
api/system/truth
api/team/activity
api/templates/[templateId]/generate-assets
api/templates/[templateId]/generate-thumbnail
api/templates/[templateId]/placeholders
api/templates/[templateId]/thumbnail
api/templates/[templateId]/validate
api/templates/company
api/templates/generate
api/templates/marketplace
api/templates/marketplace/[slug]
api/templates/marketplace/[slug]/preview-pdf
api/templates/org
api/templates/org/add
api/templates/verify-all
api/trades/companies
api/trades/match
api/trades/search
api/uploadthing
api/v1/leads/ingest
api/vendors
api/vendors/[slug]
api/vendors/orders
api/vendors/orders/[orderId]/submit
api/vendors/pricing
api/vendors/products/[id]
api/verify/damage
api/vin
api/vin/[vendorId]
api/vin/ai-match
api/vin/cart
api/vin/connectors
api/vin/events
api/vin/job-attach
api/vin/programs
api/vin/receipts
api/weather/share/[token]
```

---

## KEY ARCHITECTURE FACTS

| Metric                         | Value                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Total source files             | 3,653                                                                                       |
| Page routes                    | 449                                                                                         |
| API routes                     | 887                                                                                         |
| Layouts                        | 24                                                                                          |
| Component directories          | 70+                                                                                         |
| Lib modules                    | 140+                                                                                        |
| Auth guard patterns            | 6 (`requireAuth`, `safeOrgContext`, `auth()`, `currentUser`, `requireUser`, `withOrgScope`) |
| Routes with in-handler auth    | 759 (85.6%)                                                                                 |
| Routes without in-handler auth | 128 (14.4%)                                                                                 |
| Middleware coverage            | 100% of non-public routes                                                                   |
| Test files                     | 43                                                                                          |
| Test coverage (file ratio)     | 1.2%                                                                                        |
| ErrorBoundary implementations  | 12                                                                                          |
| Provider nesting depth         | 8 levels                                                                                    |
