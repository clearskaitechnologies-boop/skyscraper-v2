# 🎯 TITAN 10-DAY WAR PLAN

## Enterprise Readiness Sprint — 180 Users, Zero Excuses

> Target: Titan Restoration onboarding call in 10 days
> Scale: 180 employees across Sales, PMs, Admins, Finance, Owners, Subcrews
> Goal: Rock-solid stability, clean onboarding, observable production system

---

## 📊 Current Readiness Assessment

| Dimension                  | Score  | Gap                                                             |
| -------------------------- | ------ | --------------------------------------------------------------- |
| **Auth Architecture**      | 🟡 40% | `withAuth` has 0 adopters — 338 routes use raw ad-hoc `auth()`  |
| **Role System**            | 🟡 50% | 3 competing role systems, no unified type, no role presets      |
| **Onboarding Flow**        | 🟢 75% | 3 paths exist but no bulk CSV import, no product tour           |
| **Observability**          | 🟡 50% | Sentry wired, but logs go nowhere, no metrics backend           |
| **Load Readiness**         | 🔴 20% | Zero load testing, no connection pool enforcement               |
| **Data Migration**         | 🟡 40% | Xactimate/ACH parsers exist, no general CSV import              |
| **Support Structure**      | 🟡 45% | Basic feedback form + email, no ticket system                   |
| **Multi-tenant Integrity** | 🟢 80% | `orgId` scoping on most queries, but not enforced at auth layer |

---

## 🗓️ THE 10-DAY SPRINT

### DAY 1–2: Security & Auth Hardening

> _"Can a manager accidentally see another org's data?"_

- [ ] **Migrate top 20 critical write routes to `withAuth`**
  - POST/PATCH/DELETE on: claims, jobs, invoices, team invitations, billing, proposals
  - These are the routes where auth failure = data breach
  - Pattern: `export const POST = withAuth(async (req, { orgId, userId }) => { ... })`

- [ ] **Consolidate role system to single source**
  - Merge `roles.ts` + `requireAuth.ts` + `permissions.ts` into unified type
  - Define Titan roles: `owner`, `admin`, `manager`, `project_manager`, `sales_rep`, `finance`, `field_tech`, `viewer`
  - Add role presets for quick assignment during bulk onboarding

- [ ] **Fix shallow health check HTTP status**
  - `/api/health/live` currently always returns 200 even when degraded
  - Fix: return 200 for healthy, 503 for degraded/offline
  - External monitors (BetterStack) need real status codes

### DAY 3–4: Onboarding & Bulk Operations

> _"You cannot manually onboard 180 people"_

- [ ] **Build CSV team import endpoint**
  - `POST /api/team/import-csv` — accepts CSV with columns: email, name, role
  - Validates emails, deduplicates, creates Clerk invitations in batch
  - Returns summary: invited, skipped (duplicate), failed

- [ ] **Add role presets to team invite UI**
  - Role dropdown with Titan-ready presets: Sales Rep, Project Manager, Admin, Finance, Field Tech
  - Each preset auto-assigns appropriate feature access

- [ ] **Build first-login walkthrough state**
  - Add `onboardingComplete` flag to user metadata
  - On first dashboard load: show getting-started checklist sidebar
  - Dismiss persists via API call to set flag

- [ ] **Clean onboarding flow — remove confusion**
  - Audit all 11 onboarding pages for dead links, missing metrics
  - Ensure `/onboarding` → `/getting-started` → `/dashboard` flow is seamless
  - Remove retired `/onboarding/homeowner` redirect

### DAY 5–6: Observability & Monitoring

> _"When 180 people log in and something breaks, you must see it instantly"_

- [ ] **Wire logger to Sentry breadcrumbs**
  - Replace `console.log` in `lib/logger.ts` with Sentry `addBreadcrumb()` calls
  - Every `logger.warn()` and `logger.error()` auto-creates a Sentry breadcrumb
  - Structured context: `{ orgId, userId, route, duration }`

- [ ] **Add Prisma query instrumentation**
  - Install `@prisma/instrumentation` package
  - Wire to Sentry spans so slow queries are visible
  - Alert threshold: queries > 2s

- [ ] **Build in-app "Report Issue" modal**
  - Floating button (bottom-right corner) on all app pages
  - Auto-captures: orgId, userId, current URL, browser info
  - Submits to existing `/api/feedback` endpoint
  - Shows confirmation toast

- [ ] **Fix health endpoint for production monitoring**
  - Wire BetterStack/UptimeRobot to `/api/health/deep`
  - Set up Slack/Discord webhook for downtime alerts
  - Ensure health check reports real DB latency

### DAY 7–8: Load Testing & Performance

> _"200 concurrent auth requests, 100 concurrent claim creates"_

- [ ] **Install k6 load testing**
  - Write load test scenarios:
    1. 200 concurrent GET `/api/health/live`
    2. 100 concurrent POST `/api/claims` (auth'd)
    3. 50 concurrent GET `/dashboard` page loads
    4. 50 concurrent file uploads to `/api/uploads`
  - Target: p95 < 500ms, 0% 5xx rate

- [ ] **Add Prisma connection pool limits**
  - Add `?connection_limit=10` to `DATABASE_URL` for serverless
  - Or configure via Prisma `datasource` block
  - Monitor pool exhaustion during load test

- [ ] **Fix slow queries**
  - Run `EXPLAIN ANALYZE` on top 10 heaviest queries
  - Add missing indexes on: `crm_jobs.org_id`, `claims.org_id`, `commission_records.org_id`
  - Verify composite indexes exist for common filters

- [ ] **Optimize dashboard load**
  - Dashboard makes 8+ parallel API calls — ensure each returns < 200ms
  - Add Redis caching for expensive aggregates (claim counts, revenue totals)
  - Pre-compute daily snapshots via cron

### DAY 9: Simulated Titan Demo

> _"Run with fake 50-user org — break it on purpose"_

- [ ] **Create Titan demo seed script**
  - `db/seed-titan-demo.sql` — creates org with 50 members
  - 10 sales reps, 15 PMs, 5 finance, 5 admins, 10 field techs, 5 viewers
  - 200 sample claims across different statuses
  - Revenue data for finance dashboards

- [ ] **Run permission boundary test**
  - Verify: Sales rep cannot see Finance pages
  - Verify: PM cannot delete another PM's claims
  - Verify: Cross-org data is impossible via API manipulation
  - Verify: Bulk operations respect org scoping

- [ ] **Full onboarding simulation**
  - Walk through: Signup → Org creation → Team invite → Role assignment → First claim
  - Time the flow: target < 5 minutes from signup to first claim created
  - Note any confusing UI steps or missing guidance

### DAY 10: Harden & Ship

> _"If Titan signed tomorrow, would you feel calm?"_

- [ ] **Create Titan onboarding playbook document**
  - Step-by-step guide for the 48-hour onboarding window
  - Admin setup instructions
  - Bulk import instructions
  - Role assignment guide
  - Troubleshooting FAQ

- [ ] **Final production build + deploy**
  - Full `pnpm build` verification
  - Vercel production deployment
  - Smoke test all critical paths
  - Verify health checks green

- [ ] **Lock feature freeze**
  - No new features until Titan feedback
  - Only stability fixes and load test findings

---

## 🚨 NON-NEGOTIABLE Before Titan Call

| #   | Item                              | Risk if Missing                     |
| --- | --------------------------------- | ----------------------------------- |
| 1   | All write routes use `withAuth`   | Data breach between orgs            |
| 2   | Bulk team import works            | Can't onboard 180 people            |
| 3   | Sentry breadcrumbs wired          | Blind to production failures        |
| 4   | Health checks return real status  | Can't monitor uptime                |
| 5   | Load test passes p95 < 500ms      | Platform crashes on day 1           |
| 6   | Cross-org data isolation verified | Catastrophic trust failure          |
| 7   | Role presets exist                | Onboarding chaos with 6+ role types |
| 8   | Report Issue button works         | No support channel for 180 users    |

---

## 📋 WHAT NOT TO DO

- ❌ Add new features
- ❌ Polish gradients or UI tweaks
- ❌ Refactor non-critical components
- ❌ Build marketing pages
- ❌ Migrate all 338 routes (only migrate write routes)
- ❌ Build a custom metrics pipeline (Sentry is enough for now)

---

## 🏆 Success Criteria

When Damien gets on the Titan call, he can say:

1. "We've load-tested with 200 concurrent users — p95 is under 500ms"
2. "Onboarding 180 people takes 30 minutes with our CSV import"
3. "Every role has preset permissions — your sales reps can't touch finance data"
4. "We have real-time error monitoring — we'll know about issues before you do"
5. "Your data is org-isolated — mathematically impossible for cross-contamination"
6. "In-app support button on every page — we see your context automatically"

That's enterprise confidence. That's what closes Titan.
