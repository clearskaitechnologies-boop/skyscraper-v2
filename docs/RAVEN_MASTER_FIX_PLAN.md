# 🦅 RAVEN MASTER FIX PLAN

## Systemic Certainty Roadmap — January 2026

> **Purpose**: Transform a multi-era codebase into a production-hardened system with zero drift, full type safety, and complete observability.

---

## 📊 AUDIT SUMMARY

### System Health Snapshot

| Metric                  | Value               | Status       |
| ----------------------- | ------------------- | ------------ |
| **Prisma Schema**       | Valid               | ✅           |
| **Migrations**          | 12 applied, in sync | ✅           |
| **Valid Prisma Models** | 73 delegates        | ✅           |
| **TypeScript Errors**   | 3,407 lines         | 🔴 CRITICAL  |
| **API Routes**          | 802 total           | —            |
| **Protected Routes**    | 531 (66.2%)         | ⚠️           |
| **Unprotected Routes**  | 224 (27.9%)         | 🔴 HIGH RISK |
| **Missing UI Routes**   | 54 referenced       | 🟡 MEDIUM    |
| **Empty Catch Blocks**  | 135 instances       | 🔴 HIGH      |

---

## 🔍 ERROR TAXONOMY

### The 6 Buckets of Drift

| Bucket                         | Description                                | Error Count | Priority |
| ------------------------------ | ------------------------------------------ | ----------- | -------- |
| **A. Dead Prisma Delegates**   | Models renamed/removed, code never updated | ~40         | P0       |
| **B. Field Renames**           | `snake_case → camelCase` not propagated    | ~80         | P0       |
| **C. Invalid Include/Select**  | Relations renamed/flattened                | ~60         | P0       |
| **D. GroupBy Type Mismatches** | Prisma v5 strict typing                    | ~15         | P1       |
| **E. DTO Drift**               | Hand-written types vs Prisma reality       | ~30         | P1       |
| **F. Dead Features**           | Experimental pages never cleaned up        | ~20         | P2       |

---

## 📦 VALID PRISMA DELEGATES (73 Models)

These are the **ONLY** valid model names. Anything else in code is dead:

```
prisma.activities          prisma.ai_reports          prisma.billingSettings
prisma.cacheStat           prisma.claimClientLink     prisma.claimTimelineEvent
prisma.claim_documents     prisma.claim_events        prisma.claims
prisma.client              prisma.clientConnection    prisma.clientPortalAccess
prisma.clientProConnection prisma.clientSavedPro      prisma.clientWorkRequest
prisma.client_contacts     prisma.client_networks     prisma.client_saved_trades
prisma.contacts            prisma.documentShare       prisma.documents
prisma.email_queue         prisma.estimates           prisma.fileAsset
prisma.inspections         prisma.jobRun              prisma.jobs
prisma.leads               prisma.legal_acceptances   prisma.message
prisma.messageThread       prisma.notification        prisma.org
prisma.orgTemplate         prisma.org_branding        prisma.plan
prisma.projects            prisma.properties          prisma.proposal_drafts
prisma.proposal_files      prisma.quick_dols          prisma.referral_rewards
prisma.referrals           prisma.signature_requests  prisma.subscription
prisma.tasks               prisma.telemetryEvent      prisma.template
prisma.tokenWallet         prisma.token_packs         prisma.token_usage
prisma.tokens_ledger       prisma.tool_usage          prisma.tradesCompany
prisma.tradesCompanyMember prisma.tradesJobPosting    prisma.tradesOnboardingInvite
prisma.tradesPortfolioItem prisma.tradesPost          prisma.tradesReview
prisma.usage_tokens        prisma.user_organizations  prisma.users
prisma.vendor              prisma.vendorContact       prisma.vendorLocation
prisma.vendorProduct       prisma.vendorResource      prisma.vendorUsageHistory
prisma.weather_daily_snapshots  prisma.weather_documents   prisma.weather_events
prisma.webhookEvent
```

### ❌ DEAD DELEGATES (Referenced in Code but Don't Exist)

| Dead Delegate              | Replacement                  | Files Affected                                               |
| -------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `prisma.agent_runs`        | `prisma.jobRun` or DELETE    | `src/agents/baseAgent.ts`                                    |
| `prisma.stormIntake`       | DELETE or migrate            | `src/app/(app)/dashboard/storm-intakes/*`                    |
| `prisma.claimSupplement`   | DELETE                       | `src/app/(app)/claims/[claimId]/supplement/*`                |
| `prisma.retailJob`         | `prisma.leads` or DELETE     | `src/app/(app)/financed-jobs/*`, `src/app/(app)/inventory/*` |
| `prisma.retailJobPayment`  | DELETE                       | `src/app/(app)/invoicing/*`, `src/app/(app)/payments/*`      |
| `prisma.retailJobMaterial` | DELETE                       | `src/app/(app)/inventory/*`                                  |
| `prisma.financedJob`       | DELETE                       | `src/app/(app)/financed-jobs/*`                              |
| `prisma.reports`           | `prisma.ai_reports`          | `src/app/(app)/reports/[reportId]/*`                         |
| `prisma.tradeProfile`      | `prisma.tradesCompanyMember` | `src/app/(app)/network/my-profile/*`                         |
| `prisma.tradesTeam`        | `prisma.tradesCompany`       | `src/app/(app)/company/connections/*`                        |
| `prisma.client_activity`   | DELETE or custom             | `src/app/(app)/network/clients/[clientNetworkId]/*`          |
| `prisma.user`              | `prisma.users`               | `src/app/(app)/network/trades/[companyId]/*`                 |

---

## 🔄 FIELD RENAME MAP (snake_case → camelCase)

Apply these mechanical replacements across the codebase:

| Old Field           | New Field           | Affected Areas                 |
| ------------------- | ------------------- | ------------------------------ |
| `first_name`        | `firstName`         | leads, contacts, selects       |
| `last_name`         | `lastName`          | leads, contacts, selects       |
| `zip_code`          | `zipCode`           | leads, contacts, properties    |
| `updated_at`        | `updatedAt`         | tokenLedgerAgent, creates      |
| `insured_name`      | `insuredName`       | claims, pipeline, depreciation |
| `claim_supplements` | DELETE              | rebuttalAgent includes         |
| `properties`        | `propertyId` + JOIN | claims includes                |

---

## 🔴 UNPROTECTED API ROUTES (224 — CRITICAL)

Routes that need `auth()` middleware or explicit public marking:

### High-Risk Routes (Require Immediate Protection)

```
/api/activity/list
/api/ai/damage/upload
/api/ai/dashboard-assistant
/api/ai/proposals/run
/api/billing/checkout
/api/billing/tokens/checkout
/api/branding/get
/api/bulk-actions
/api/claims/* (multiple)
/api/contacts/*
/api/documents/*
/api/leads/*
/api/network/*
/api/projects/*
/api/reports/*
/api/settings/*
/api/templates/*
/api/trades/*
```

### Action Required

1. Run `node scripts/audit-api-auth.js` for full list
2. Review `api-auth-audit.json` for categorized output
3. Add `auth()` to protected routes
4. Mark intentionally public routes with `// @public` comment

---

## 🔗 MISSING UI ROUTES (54)

### Clerk Routes (External — Safe)

- `/sign-in` (78 refs) — Handled by Clerk
- `/sign-up` (14 refs) — Handled by Clerk
- `/sign-out` (1 ref) — Handled by Clerk

### Need Creation (High Priority)

| Route                | Refs | Action                         |
| -------------------- | ---- | ------------------------------ |
| `/contacts/new`      | 3    | Create contact creation page   |
| `/portal/find-a-pro` | 3    | Create pro discovery in portal |
| `/demo`              | 3    | Create demo/marketing page     |
| `/book-demo`         | 2    | Create demo booking page       |
| `/admin/branding`    | 2    | Create admin branding page     |

### Footer Placeholders (Low Priority)

- `/docs`, `/careers`, `/blog`, `/help`, `/training`, `/cookies`

### Dead References (Remove Links)

- `/FOUNDATION.md`, `/PRISMA_SQL_MAPPING.md` — File links, not routes
- `/claims/test`, `/claims/generate` — Dead experimental
- `/project-board`, `/leads/all` — Unreleased features

---

## 📋 WEEK-BY-WEEK EXECUTION PLAN

---

### 🔥 WEEK 1 — P0: Foundation (Critical Path)

**Goal**: Eliminate all TypeScript errors blocking build. Protect sensitive APIs.

#### Day 1-2: Dead Delegate Purge

- [ ] Remove/replace `prisma.agent_runs` → `prisma.jobRun`
- [ ] Remove/replace `prisma.stormIntake` pages (DELETE or feature-flag)
- [ ] Remove/replace `prisma.claimSupplement` pages
- [ ] Remove/replace `prisma.retailJob*` pages (financed-jobs, inventory, invoicing, payments)
- [ ] Remove/replace `prisma.reports` → `prisma.ai_reports`
- [ ] Remove/replace `prisma.tradeProfile` → `prisma.tradesCompanyMember`

#### Day 3: Field Rename Codemod

```bash
# Run these replacements project-wide
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/first_name/firstName/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/last_name/lastName/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/zip_code/zipCode/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/updated_at/updatedAt/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/insured_name/insuredName/g'
```

#### Day 4: Include/Select Fixes

- [ ] Fix `claims` includes (remove `claim_supplements`, `properties` → use `propertyId`)
- [ ] Fix `contacts` selects (use camelCase fields)
- [ ] Fix `template` selects (remove `title`, `hasHtml`, etc.)

#### Day 5: API Protection Pass

- [ ] Review 224 unprotected routes
- [ ] Add `auth()` to 50 highest-risk routes
- [ ] Mark intentionally public routes

---

### 🟠 WEEK 2 — P1: Type Safety & Analytics

**Goal**: Fix GroupBy typing, eliminate DTO drift, harden admin dashboards.

#### Day 1-2: GroupBy Standardization

- [ ] Fix `admin/page.tsx` groupBy queries
- [ ] Add explicit `_count: { _all: true }` to all groupBy calls
- [ ] Add explicit `_avg`, `_max` selections

#### Day 3: DTO Detox

- [ ] Replace `TemplateData` with `Prisma.templateGetPayload<...>`
- [ ] Replace `ClaimLite` with proper Prisma type
- [ ] Replace `LeadLite` with proper Prisma type
- [ ] Remove all hand-written interfaces that drift

#### Day 4: Missing Imports Fix

- [ ] Remove `ArtifactType`, `GeneratedArtifact`, `UniversalTemplate` imports
- [ ] Remove `report_templates`, `report_template_sections` imports
- [ ] Fix `Info` component import in AI mockup

#### Day 5: API Protection (Continued)

- [ ] Complete remaining 174 unprotected routes
- [ ] Verify with `node scripts/audit-api-auth.js`

---

### 🟡 WEEK 3 — P2: Dead Feature Cleanup & Polish

**Goal**: Archive or delete unused features. Create missing routes. Full verification.

#### Day 1-2: Feature Triage

| Feature          | Decision | Action                   |
| ---------------- | -------- | ------------------------ |
| `/artifacts`     | KILL     | Delete page              |
| `/financed-jobs` | KILL     | Delete page              |
| `/inventory`     | KILL     | Delete page              |
| `/invoicing`     | KILL     | Delete page              |
| `/payments`      | KILL     | Delete page              |
| `/storm-intakes` | PARK     | Feature flag             |
| `/ai/mockup`     | PARK     | Feature flag             |
| `/maps/map-view` | FIX      | Update to use propertyId |

#### Day 3: Missing Routes Creation

- [ ] Create `/demo` marketing page
- [ ] Create `/contacts/new` contact form
- [ ] Create `/book-demo` scheduling page
- [ ] Create footer placeholders (simple static pages)

#### Day 4: Empty Catch Block Fixes

- [ ] Add structured logging to 135 empty catch blocks
- [ ] Integrate with `formTracker` for UI feedback
- [ ] Priority: form submissions, API calls, auth flows

#### Day 5: Full Verification

- [ ] Run `npx tsc --noEmit` — Should be 0 errors
- [ ] Run `node scripts/audit-api-auth.js` — 0 unprotected
- [ ] Run `node scripts/verify-routes.js` — 0 missing (or documented)
- [ ] Run `pnpm playwright test` — All E2E passing

---

## 🔧 QUICK REFERENCE COMMANDS

```bash
# Audit API security
node scripts/audit-api-auth.js

# Verify UI routes
node scripts/verify-routes.js

# List valid Prisma models
node scripts/list-prisma-models.js

# TypeScript check
npx tsc --noEmit 2>&1 | head -100

# Count TS errors
npx tsc --noEmit 2>&1 | wc -l

# Prisma validate
npx prisma validate

# Prisma migration status
npx prisma migrate status

# Run E2E tests
pnpm playwright test e2e/trades-onboarding.spec.ts
```

---

## ✅ PRODUCTION READINESS CHECKLIST

### Before Any Deploy

- [ ] `npx prisma validate` passes
- [ ] `npx prisma migrate status` shows no pending migrations
- [ ] `npx tsc --noEmit` has 0 errors
- [ ] `node scripts/audit-api-auth.js` shows 0 unprotected (or documented public)
- [ ] `node scripts/verify-routes.js` shows 0 critical missing routes
- [ ] All critical flows have E2E coverage
- [ ] No empty catch blocks in form submissions

### Per-Feature Verification

| Feature           | Test Command                                         | Expected                 |
| ----------------- | ---------------------------------------------------- | ------------------------ |
| Auth              | Manual login/logout                                  | Redirects work           |
| Claims            | Create claim E2E                                     | Saves, appears in list   |
| Trades Onboarding | `pnpm playwright test e2e/trades-onboarding.spec.ts` | All pass                 |
| Network Bridge    | Manual invite flow                                   | Job appears on recipient |
| Messaging         | Send message                                         | Delivered, visible       |

---

## 📁 FILES CREATED BY THIS AUDIT

| File                                                                               | Purpose                      |
| ---------------------------------------------------------------------------------- | ---------------------------- |
| [scripts/audit-api-auth.js](scripts/audit-api-auth.js)                             | API security audit           |
| [scripts/verify-routes.js](scripts/verify-routes.js)                               | UI route verification        |
| [scripts/list-prisma-models.js](scripts/list-prisma-models.js)                     | Valid Prisma delegates       |
| [e2e/trades-onboarding.spec.ts](e2e/trades-onboarding.spec.ts)                     | Onboarding E2E tests         |
| [src/lib/formTracker.ts](src/lib/formTracker.ts)                                   | Form instrumentation         |
| [src/lib/profileCompletion.ts](src/lib/profileCompletion.ts)                       | Profile gate service         |
| [docs/POST_MORTEM_ONBOARDING_JAN_2026.md](docs/POST_MORTEM_ONBOARDING_JAN_2026.md) | Root cause analysis          |
| [docs/PRODUCTION_CONFIDENCE_CHECKLIST.md](docs/PRODUCTION_CONFIDENCE_CHECKLIST.md) | Deploy checklist             |
| [api-auth-audit.json](api-auth-audit.json)                                         | Detailed API audit results   |
| [route-audit.json](route-audit.json)                                               | Detailed route audit results |

---

## 🎯 SUCCESS METRICS

| Metric             | Current | Target         | Timeline |
| ------------------ | ------- | -------------- | -------- |
| TypeScript Errors  | 3,407   | 0              | Week 2   |
| Unprotected APIs   | 224     | 0              | Week 2   |
| Missing Routes     | 54      | <10            | Week 3   |
| Empty Catch Blocks | 135     | <20            | Week 3   |
| E2E Test Coverage  | Partial | Critical paths | Week 3   |

---

## 📞 ESCALATION CRITERIA

### Stop Everything If:

1. **Production data inconsistency** — Schema migration issue
2. **Auth bypass discovered** — Security vulnerability
3. **Payment flow broken** — Revenue impact
4. **Core feature regression** — Claims, leads, messaging

### Acceptable Tech Debt (For Now):

1. Footer placeholder pages (static "Coming Soon")
2. Experimental features behind flags
3. Admin analytics with type assertions (as long as functional)

---

_Last updated: January 16, 2026_
_Generated by: Raven System Audit_
