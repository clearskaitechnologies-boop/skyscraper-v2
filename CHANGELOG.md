# Changelog

## [2.1.0] - 2025-02-12

### 🎯 "Clarity Release" — Code Quality + Production Fixes

This release closes all 120 items from TODO v3 (Phases 1-7) plus hotfixes for user-reported production bugs.

### Code Quality (Phases 1-7)

- **CI + Testing:** Added vitest to GitHub Actions CI pipeline; 7 test files / 44 tests all passing
- **TypeScript Safety:** Removed ~346 `as any` casts across 40 files (1,166 → 820); TypeScript: 0 errors
- **Zod Validation:** Added schema validation to ~15 critical write routes (leads, claims, contacts, messages, checkout, etc.)
- **Loading Skeletons:** Created 46 new `loading.tsx` files (44 → 90 total) using PageSkeleton component
- **Import Sorting:** ESLint autofix applied to all flagged files; Problems tab clean

### UI Fixes

- **Black outlines removed:** Stripped border classes from `Card`, `PageSectionCard`, `.card`, `.panel`, `.panel-ghost`, `.badge`, `.card-bubble-elevated` — cards now use shadows only for visual separation
- **Navigation:** Enabled Vision Labs and Mockup Generator in sidebar (feature flags flipped to `true`)
- **Property Profiles [id]:** Rewrote data fetching from broken self-fetch (`/api/v1/property-profiles/`) to direct Prisma queries with `property_profiles` → `properties` fallback
- **Property Profiles listing:** Enhanced to use `property_profiles` model with health scores, digital twins, and inspection counts
- **Messages error boundary:** Added dedicated `error.tsx` for `/trades/messages` with retry + back-to-dashboard actions

### DevOps

- **TODO v4:** Comprehensive master TODO with ~140 items across 7 phases (A-G) including future product vision (Design Workspace, AI Image Creation, Material Plan Builder, Client Product Page, Vendor Ordering)

---

## [2.0.0] - 2025-02-12

### 🚀 Platform Overhaul — "Fearless Release"

This release completes 215 TODO items across 6 phases, elevating SkaiScrape from 8.1/10 → production-grade.

### Phase 0: Foundation (30 items)

- Fixed Clearbit logos, brochure PDF format tags, multi-category vendor mapping
- Vendor network manufacturer exclusion, ghost company cleanup SQL migration
- Dark mode polish, profile page fixes, delete/archive features
- Notification fixes, 90 TypeScript errors → 0

### Phase 1: Trust Floor — UI Wire-Up (48 items)

- **Settings page**: Full wire-up with SettingsForm client component, notification preferences API, org settings API
- **Sidebar**: Feature flag gating for unreleased AI tools (Recommendations, Mockup Generator, Vision Labs)
- **Dashboard**: Removed hardcoded Phoenix default, removed diag/ready reference
- **Contracts detail page**: `/contracts/[id]` with claim/job lookup
- **Referral landing page**: `/refer/[orgSlug]` with SEO metadata
- **Review reply endpoint**: `POST /api/trades/reviews/[id]/reply` with Zod validation
- **Portal stats**: Verified all portal stats use real Prisma queries (not hardcoded)

### Phase 2: Guardrails — Security & Cleanup (32 items)

- **CI pipeline**: Added lint step to GitHub Actions workflow
- **Auth sweep**: 12 API routes secured (diag/\*, notifications/email, notifications/sms, clients, pipeline, branding)
- **Auth audit script**: `scripts/audit-auth.ts` scans all routes for missing auth guards
- **Org isolation**: Verified all 4 domains (claims, leads, messages, files) properly scope by orgId
- **Deprecated routes**: Deleted 31 files from `_deprecated/` directory + 2 duplicate routes
- **Duplicate routes**: Deleted 6 more dead routes (reports/build, build-draft, quick + maps/geocode, onboard, reverse)
- **Stub routes**: 7 routes marked with TODO comments for future cleanup

### Phase 3: UX Confidence (40 items)

- **20 loading.tsx files**: Skeleton loading for messages, appointments, contacts, analytics, contracts, performance, referrals, time-tracking, billing, network, weather, vendor-network, materials, invitations, calendar, reviews, search, trades/messages, trades/profile, portal/my-pros
- **Portal pages**: Created notifications, community/feed, jobs listing pages
- **Pro UX**: Improved empty states in trades/employees, added back navigation to trades/groups/[slug]
- **Sonner verified**: Zero `window.alert()` calls remain across portal and trades
- **window.alert → toast**: Replaced in ai/damage-builder

### Phase 4: Scale & Trust (35 items)

- **Security hardening**:
  - 23x `Math.random()` → `crypto.randomUUID()` replacements across 15 files
  - Rate limiting utility already existed (Upstash Redis + in-memory fallback)
  - CSP headers already configured in next.config.mjs
  - `$queryRawUnsafe` occurrences documented (7 live, all parameterized)
- **DB performance**:
  - 5 routes parallelized with `Promise.all()` (analytics, portal stats, reports, claims detail)
  - Prisma query logging enabled in development (`['query', 'warn', 'error']`)
  - Singleton pattern verified, connection pool via env var
- **Stripe/billing**:
  - No duplicate subscription case (was fall-through pattern)
  - Receipt email TODO added to checkout handler
  - Hardcoded price IDs replaced with env var fallbacks
  - Legacy `STRIPE_API_KEY` reference cleaned up
- **Testing**: 6 test files created (auth-guard, rate-limit, stripe webhook, email, middleware, auth-matrix)
- **Email templates**: 6 React Email templates (new-message, new-review, claim-status, job-assignment, order-status, team-invite)
- **Settings sub-pages**: Security logs, backups/export, permissions/team roles, service areas
- **CRM fixes**:
  - `handleNextAction` implemented (was empty stub)
  - Activity feed author names resolved from user registry
  - Branding swatches fixed with proper display and tooltips
- **Claims validation**:
  - NaN guards added to 6 locations
  - Orphaned contactId checks in 2 API routes
  - Claim status transition validation with allowed-transitions map

### Phase 5: Delight (30 items)

- **SEO**: generateMetadata on 5 key pages, JSON-LD on homepage, canonical URLs, noindex for app pages
- **PWA**: Offline fallback page created, service worker updated, manifest/icons verified
- **Accessibility**: Skip-to-content link verified, sidebar ARIA improved, main landmark confirmed
- **Real-time messaging**: 5 hooks created (useRealtimeMessages, useTypingIndicator, usePresence, useReadReceipts, useUnreadCount)
- **Advanced features**:
  - Claims ready folder page
  - PDF export utility (centralized)
  - ZIP bundle utility (JSZip)
  - Xactimate parser (CSV/XML/text)
  - Admin dashboard with platform stats
- **Vendor portal**: Analytics, portfolio, badges/certifications, calendar pages

### Stats

- **Files created**: ~80+
- **Files modified**: ~60+
- **Files deleted**: ~39 (deprecated + duplicates)
- **TypeScript errors**: 0
- **Auth-guarded routes**: 100% (12 previously unprotected routes secured)
- **Loading skeletons**: 34+ pages covered

## [1.0.6] - 2025-11-22

### Pre-Deploy Finalization Phase 1

- Consolidated Redis usage: replaced ad-hoc Upstash client instantiation in `src/lib/api/wrappers.ts` with singleton (`upstash.ts`) and unified BullMQ scheduler to reuse `getRedis()` ioredis singleton.
- Documented legacy raw connection test (`ARCHIVE_DEV_SCRIPTS/test-redis.ts`) and scrubbed emojis from dev test script output (`scripts/test-redis-connection.js`) for cleaner CI logs.
- Implemented global runtime emoji removal via `EmojiScrubber` component injected in app layout; removed residual layout emojis for professional UI consistency.
- Added Phase 1 Zod schemas (`phase1Schemas.ts`) for `claims`, `leads`, `storm_records`, `team_members` aligning core fields with Prisma to begin reducing 64 advisory drift warnings.
- Production build validated post changes; existing ECONNRESET warnings remain transient and non-blocking; schema validator still advisory only.

### Operational Impact

- Reduced risk of Redis client saturation & connection resets by ensuring singleton usage across API rate limiting and scheduling.
- Established foundation for future stricter type enforcement and automated drift detection leveraging Zod parsing helpers.
- UI consistency improved (emoji scrub) without manual edits to every page via runtime DOM pass; can be phased out later by static component updates.

### Next Steps

- Phase 2: Expand Zod schemas with relational subsets & enum tightening (ClaimLifecycleStage, status/priority enumerations).
- Investigate ECONNRESET frequency—add retry wrapper or pool tuning if occurrence rate increases under load.
- Optionally convert runtime emoji scrub to static removal in high-traffic pages for performance micro-optimization.

## [1.0.3] - 2025-11-20

## [1.0.4] - 2025-11-20

## [1.0.5] - 2025-11-20

### Drift Metrics & Smoke Tests

- Added in-memory drift counters (`driftMetrics`) with API endpoint `/api/health/drift-metrics` (supports `?reset=1`).
- Instrumented all safe selectors to increment counters on fallback events.
- Added Playwright smoke tests (`tests/drift-smoke.spec.ts`) for Vendors, Report History, Retail Proposal pages.
- Provides quantitative fallback tracking for future alerting and dashboards.

### Monitoring Usage

- Query endpoint: `GET /api/health/drift-metrics` returns counters and uptime seconds.
- Reset counters: `GET /api/health/drift-metrics?reset=1` (auth-gate recommended in future if exposed publicly).

### Next Steps

- Persist drift metrics (Redis or Postgres) for historical trend analysis.
- Add properties/inspections safe selectors if errors emerge.
- Hook drift counts into `/api/health/full` aggregation.

### Additional Safe Selectors & Verification Improvements

- Added `safeProjectsSelect` and `safeJobsSelect` with Sentry breadcrumbs and drift fallbacks (minimal id/title sets on failure).
- Converted `scripts/check-user-columns.js` to ES module to align with `"type": "module"` and prevent runtime `require` error.
- Verified user profile columns present locally; script now exits cleanly with success code.
- Markdown lint fixes applied to `CHANGELOG.md` (wrapped bare URLs, disambiguated duplicate headings).

### Operational Guidance

- Use Sentry search for breadcrumb keys: `users.fallback.start`, `claims.fallback.start`, `leads.fallback.start`, `projects.fallback.start`, `jobs.fallback.start` to monitor drift frequency.
- If fallback breadcrumbs spike, run `scripts/verify_user_profile_columns.sh` and `scripts/audit-database-tables.js` for deeper introspection.

### Next Recommendations

- Migrate any remaining high-error query surfaces to safe selectors (e.g., properties, inspections) if logs show column issues.
- Add aggregated drift metrics endpoint (e.g. `/api/health/drift-metrics`) counting fallback events over last hour.

### Resilient Data Selectors & Drift Instrumentation

- Added `safeClaimsSelect` and `safeLeadsSelect` utilities with Sentry breadcrumbs + fallback minimal selects when column drift occurs.
- Refactored `safeRetailContext` and `ReportHistoryPage` to use new safe selectors for consistency and reduced duplication.
- Enhanced `safeUserSelect` with Sentry breadcrumbs (`users.fallback.start` / `users.fallback.success`).
- Vendor page now org-scoped (`where: { org_id: orgId }`) with minimal fallback (id, name, type) if full selection fails.
- Centralized claims/leads selection logic improves future maintenance and observability.

### Operational Follow-Ups Executed

- Implemented all recommended defensive fallbacks on high-risk pages (Vendors, Report History, Retail Proposal).
- Added structured breadcrumbs for drift events across users, claims, leads.
- Updated CHANGELOG documenting new resilience features.

### Next Suggested Actions

- Validate pages locally (`/vendors`, `/reports/history`, `/reports/retail`).
- Deploy and monitor Sentry for any `*.fallback.start` breadcrumb frequency spikes.
- Consider consolidating additional models (e.g., projects, jobs) under safe selectors if drift patterns recur.

## [1.0.2] - 2025-11-20

### Canonical Report History & Stability

- Canonicalized legacy `/reports` → `/reports/history` via middleware 308 redirect (`legacyReportsRedirect`) and updated all navigation surfaces (AppShell, Sidebar, SideNav, CRM navigation, marketing nav, dashboard quick actions).
- Added diagnostic logging to `RetailProposalPage` and `ReportHistoryPage` for auth/context visibility.
- Broadened `safeUserSelect` fallback detection to catch schema drift and degrade gracefully.
- Added migration `20251120_add_missing_user_columns.sql` creating missing `title`, `phone`, `headshotUrl`, `jobHistory` columns plus indexes.
- Added unit test `__tests__/middleware.redirect.test.ts` asserting redirect behavior.
- Updated context navigation key to `/reports/history` preserving child links.
- Unified report breadcrumbs and added back link in Retail Proposal builder.

### Ops & Reliability

- Logging around claims/leads load and retail proposal context for production diagnostics.
- Dashboard quick action now targets canonical history route to eliminate redirect loops.

### Developer Experience

- Refactored middleware redirect logic into pure function for isolated testing.
- Expanded schema drift handling messages captured via Sentry for proactive monitoring.

### Next Steps

- Add Playwright tests for Teams & Vendors pages post-migration.
- Evaluate pruning deprecated `/reports` context key if not required.

## [1.0.1] - 2025-10-31

### Added - Modern Instrumentation

- **Sentry Server/Edge**: `src/instrumentation.ts` replaces legacy config files
  - Production-only initialization with `SENTRY_DSN` environment variable
  - Automatic release tracking from `VERCEL_GIT_COMMIT_SHA`
  - Filters health check noise from error reports
  - 10% sample rate for performance tracing
  - Graceful fallback when DSN missing

- **Sentry Client**: `src/instrumentation-client.ts` for browser error tracking
  - Session replay on errors (100% sample rate)
  - Normal session replay (10% sample rate)
  - Masks all text and media for privacy
  - Uses `NEXT_PUBLIC_SENTRY_DSN` with fallback to `SENTRY_DSN`

### Added - E2E Testing

- **Playwright Configuration**: `playwright.config.ts` with chromium support
  - Base URL from `NEXT_PUBLIC_APP_URL` or localhost:3000
  - Screenshot on failure, trace on retry
  - HTML reporter for test results
  - Parallel test execution

- **Smoke Test Suite**: `tests/smoke.spec.ts` with 12 critical path tests
  - ✅ Marketing pages (homepage hero, pricing tiers)
  - ✅ Authentication flow (dashboard redirect, sign-in modal)
  - ✅ Health endpoints (`/api/health/live`, `/api/health/ready`)
  - ✅ Public routes (features, contact, trades-network)
  - ✅ SEO essentials (robots.txt, sitemap.xml, favicon)
  - All tests passing against production (<https://skaiscrape.com>)

- **NPM Scripts**: `test:e2e` and `test:e2e:ui` for running tests

### Added - Performance Guardrails

- **Lighthouse CI Workflow**: `.github/workflows/lighthouse.yml`
  - Runs on every PR to `main` branch
  - Tests `/` and `/pricing` routes
  - Fails build if performance score < 90
  - Uploads HTML reports as GitHub artifacts
  - Uses `treosh/lighthouse-ci-action@v11`

- **Lighthouse Config**: `.lighthouserc.json` with recommended presets
  - Performance: error threshold (≥90)
  - Accessibility, Best Practices, SEO: warning thresholds (≥90)
  - Temporary public storage for report sharing

### Added - Observability Documentation

- **README Operations Section**: Comprehensive ops guide with:
  - Local development workflow (nvm, clean, build, test)
  - Vercel Alerts setup (5xx errors, high latency, build failures)
  - External uptime monitoring recommendations (UptimeRobot, Better Stack, Pingdom)
  - Health endpoint details with expected responses
  - Sentry configuration instructions
  - Lighthouse CI report access

### Removed

- **Legacy Sentry Files**: Deleted deprecated configuration files
  - `sentry.server.config.ts` → `src/instrumentation.ts`
  - `sentry.edge.config.ts` → `src/instrumentation.ts`
  - `sentry.client.config.ts` → `src/instrumentation-client.ts`
  - Silences Next.js deprecation warnings

### Changed (1.0.1)

- **Test Organization**: Moved Jest/Vitest tests to `tests-backup/`
  - Playwright as single E2E framework
  - Cleaner test directory structure
  - Added test artifacts to `.gitignore`

### Technical Details (1.0.1)

- **Commit SHA**: 853edb7
- **Production URL**: <https://skaiscrape.com>
- **Tests**: 12/12 Playwright smoke tests passing
- **Build**: Clean (92 pages, expected warnings handled)
- **Health Checks**: Both `/api/health/live` and `/ready` returning 200 OK
- **GitHub Actions**: Auto-deployment on push to main (existing workflow)

### Validation

```bash
# Clean build with Node 20
pnpm clean && pnpm install --frozen-lockfile && pnpm build

# E2E tests against production
NEXT_PUBLIC_APP_URL=https://skaiscrape.com pnpm test:e2e
# Result: 12/12 tests passed in 4.5s

# Health endpoint verification
curl -fsS https://skaiscrape.com/api/health/live
# {"status":"ok","version":"3.0.0","env":{"hasDatabase":true,"hasClerk":true}}

curl -fsS https://skaiscrape.com/api/health/ready
# {"status":"ready","checks":{"database":"ok","prisma":"ok"}}
```

---

## [1.0.0] - 2025-10-31

### Added - Route Group Architecture

- **RouteGroupProvider Context**: Centralized route group detection with `(marketing)` and `(app)` groups
- **Conditional Navigation**: ConditionalNav component renders marketing header only in (marketing) group
- **Conditional Footer**: ConditionalFooter component shows footer only on public marketing pages
- **Centralized Marketing Links**: `src/constants/marketing-links.ts` for DRY navigation configuration
- **Clean Script**: `pnpm clean` command using rimraf to remove `.next`, `.turbo`, `dist`, and `node_modules/.cache`

### Added - Safe Prisma Pattern

- **Graceful Database Degradation**: `lib/db/prisma.ts` singleton with null-safe stub when `DATABASE_URL` unavailable
- **Build Resilience**: Prevents crashes during static export when database unreachable
- **Stub Detection**: `prismaIsStub` boolean flag for conditional database logic

### Added - Hardened Health Endpoints

- **Live Probe**: `/api/health/live` always returns 200 OK with environment validation (DATABASE_URL, CLERK keys)
- **Ready Probe**: `/api/health/ready` checks database connectivity using safe Prisma pattern
- **Version Tracking**: v3.0.0 semantic versioning in health responses
- **Service Metadata**: Timestamp, service name ("skaiscraper"), and structured checks in JSON responses

### Added - GitHub Actions CI/CD

- **Production Deployment**: `.github/workflows/deploy-vercel.yml` triggers on push to `main` branch
- **Preview Deployments**: `.github/workflows/preview-vercel.yml` creates preview URLs for pull requests
- **Auto-Comments**: PR preview deployments post deployment URL as GitHub comment
- **Health Verification**: Deployment workflow includes curl checks for `/api/health/live` and `/ready`
- **Source Builds**: Uses `vercel --prod --force` instead of prebuilt for cache consistency

### Added - Build Hygiene

- **rimraf Dependency**: Added `rimraf ^6.1.0` as devDependency for cross-platform file removal
- **Node Version Enforcement**: `.nvmrc` file specifies Node 20.x for consistent environments
- **Dynamic Route Markers**: `export const dynamic = "force-dynamic"; export const revalidate = 0;` for routes using `headers()` or `auth()`
  - `/projects/page.tsx`
  - `/api/pipeline/route.ts`
  - `/api/pipelines/summary/route.ts`
  - `/api/branding/status/route.ts`

### Fixed

- **ENOENT Manifest Error**: Removed duplicate `src/app/page.tsx` conflicting with `(marketing)/page.tsx`, archived to `archive/legacy/root-page.tsx.backup`
- **Duplicate Dashboard Page**: Removed `src/app/dashboard/page.tsx` conflicting with `(app)/dashboard/page.tsx`, archived to `archive/legacy/dashboard-page.tsx.backup`
- **Vercel Prebuilt Cache Drift**: Switched from prebuilt deployment to source builds with `--force` flag to prevent manifest inconsistencies after route refactor
- **Dynamic Server Usage Warnings**: Marked all routes using `headers()`, `auth()`, or database queries with `dynamic = "force-dynamic"` to prevent static export errors
- **Tailwind Config**: Updated `content` paths to exclude `archive/` directory while maintaining route group support

### Changed (1.0.0)

- **Route Organization**: Separated public marketing pages `(marketing)` from authenticated CRM pages `(app)`
- **Layout Hierarchy**: Marketing layout renders header/footer, app layout renders authenticated navigation
- **Middleware Logic**: Updated Clerk middleware to use `redirect_url` parameter instead of deprecated `redirect` for sign-in redirects
- **ESLint Config**: Minimal `.eslintrc.json` with only `next/core-web-vitals` preset, no deprecated options
- **Build Output**: 92 static pages generated, middleware at 67.4 kB, First Load JS 126-322 kB per route

### Technical Details (1.0.0)

- **Commit SHA**: bdd1365
- **Production URL**: <https://skaiscrape.com>
- **Health Status**: /api/health/live returns 200 OK with `{"status":"ok","hasDatabase":true,"hasClerk":true}`
- **Database Status**: /api/health/ready returns 200 OK with `{"status":"ready","checks":{"database":"ok","prisma":"ok"}}`
- **GitHub Repository**: <https://github.com/BuildingWithDamien/PreLossVision>
- **Tag**: v1.0.0 (pushed to origin)
- **Deployment ID**: 2DLryhziXgkujSqbuY9jBKiSpw9X

### Deprecated

- **Sentry Config Files**: `sentry.server.config.ts`, `sentry.edge.config.ts`, and `sentry.client.config.ts` should migrate to Next.js instrumentation file (non-blocking warnings)
- **Clerk SDK**: `@clerk/clerk-sdk-node@5.1.6` deprecated, Express users should migrate to `@clerk/express`
- **Supabase Auth Helpers**: `@supabase/auth-helpers-react@0.5.0` deprecated, migrate to `@supabase/ssr`

### Known Issues

- **DB Connection Warnings During Build**: Expected during static export when `DATABASE_URL` points to unavailable host, handled by safe Prisma pattern
- **ESLint Unknown Options**: Next.js internal ESLint handling emits warnings about deprecated `useEslintrc` and `extensions` options despite minimal `.eslintrc.json` (non-blocking)
- **Node Version Mismatch**: Project requires Node 20.x but local environment runs 24.10.0, causes pnpm engine warnings (use `nvm use 20` to resolve)

### Migration Guide

For developers cloning this project:

1. **Node Version**: `nvm use 20` or install Node 20.x
2. **Dependencies**: `pnpm install --frozen-lockfile`
3. **Environment**: Copy `.env.example` to `.env.local` and configure `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
4. **Database**: Run `pnpm prisma generate` then apply migrations
5. **Development**: `pnpm dev` starts development server on port 3000
6. **Clean Build**: `pnpm clean && pnpm build` validates production build

---

## [0.1.0] - 2025-10-29

### Added

- **Maintenance Mode**: Clean upload gating with `STORAGE_ENABLED` environment flag
- **Root Domain Auth**: Complete Clerk authentication on skaiscrape.com with /sign-in and /sign-up routes
- **Health Monitoring**: System health badges with real-time storage/token status
- **Theme System**: Light/dark/system theme toggle with persistence
- **Public Pages**: Home, pricing, case study, and contact pages for marketing
- **Legacy Redirects**: Automatic redirects from /login, /signin, /signup to correct routes
- **SEO Optimization**: Robots.txt and sitemap for root domain
- **Typography Standards**: Global CSS utilities for consistent styling

### Changed (0.1.0)

- Updated middleware to properly handle public vs protected routes
- Enhanced TopBar with health monitoring and theme controls
- Improved upload UI with clear disabled states during maintenance
- Restructured routing for root domain deployment

### Technical

- Firebase Admin SDK with conditional initialization
- Comprehensive health endpoints (/api/health/storage, /api/health/summary)
- Token gating system with graceful degradation
- WCAG AA compliant focus states and accessibility improvements
