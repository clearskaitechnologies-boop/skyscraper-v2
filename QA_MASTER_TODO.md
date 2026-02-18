# SkaiScraper Pro CRM — QA Master TODO

> Generated from the Feb 18 2026 end-to-end QA audit.
> Tracks every bug, UI fix, missing feature, test gap, and infrastructure upgrade
> uncovered during the comprehensive agent test of the Pro platform.

---

## Legend

| Icon | Meaning |
|------|---------|
| 🔴 | **Blocker / Critical** — blocks a core journey or crashes the app |
| 🟠 | **Major** — core feature broken or missing validation |
| 🟡 | **Medium** — UX gap, inconsistency, or partial failure |
| 🟢 | **Minor / Nit** — polish, copy, or cosmetic |
| ✅ | Done |
| 🔲 | Not started |
| 🔧 | In progress |

---

## Phase 0 — Blockers & Critical Crashes (ship-stopping)

> These must be resolved before any demo, beta, or release.

### 0-1  Reports & Documents Module — Server Component Crash

| Field | Detail |
|-------|--------|
| Bug ID | BUG-001, BUG-007 |
| Severity | 🔴 Blocker |
| Status | 🔲 |
| Routes | `/reports/hub`, `/reports/builder`, `/reports/templates`, `/reports/community`, `/reports/batch`, `/reports/history` |
| Code | `src/app/(app)/reports/` — has `error.tsx` but the underlying server components fail before the boundary can catch them; sometimes causes Chrome "Aw, Snap" (error code 5) |

**Tasks:**

- [ ] 0-1a — Audit every `page.tsx` under `src/app/(app)/reports/` for missing imports, broken DB queries, or uncompiled server components
- [ ] 0-1b — Add `Suspense` boundaries with skeleton loaders inside `src/app/(app)/reports/layout.tsx` (or create one) wrapping `{children}`
- [ ] 0-1c — Verify `error.tsx` at `src/app/(app)/reports/error.tsx` catches *all* rendering failures (currently works for React errors but not SSR build failures)
- [ ] 0-1d — Add memory-limit / payload-size checks for batch & community pages to prevent tab crashes
- [ ] 0-1e — Smoke-test all 6 subpages after fix (Hub, Builder, Templates, Community & Batch, Company Docs, History)
- [ ] 0-1f — Add Playwright e2e test: navigate to each reports page and assert no error boundary is rendered

---

### 0-2  Vendor Detail & Contractor Packet — Server Component Crash

| Field | Detail |
|-------|--------|
| Bug ID | BUG-002 |
| Severity | 🔴 Blocker |
| Status | 🔲 |
| Routes | `/vendor-network/[vendorSlug]`, `/reports/contractor-packet` |
| Code | `src/app/(app)/vendor-network/[vendorSlug]/`, `src/app/(app)/reports/contractor-packet/` |

**Tasks:**

- [ ] 0-2a — Check `[vendorSlug]/page.tsx` data-fetching: does `getVendorBySlug` handle missing/empty data without throwing?
- [ ] 0-2b — Add `error.tsx` to `src/app/(app)/vendor-network/` (currently **missing**)
- [ ] 0-2c — Add `error.tsx` to `src/app/(app)/materials/` (currently **missing**)
- [ ] 0-2d — Verify `contractor-packet/page.tsx` compiles; if feature is unfinished, replace with a "Coming Soon" placeholder
- [ ] 0-2e — Smoke-test View Details on 3+ vendor cards
- [ ] 0-2f — Smoke-test contractor packet download flow

---

### 0-3  Material Order Creation — API Failure

| Field | Detail |
|-------|--------|
| Bug ID | BUG-003 |
| Severity | 🔴 Critical |
| Routes | `/orders` (or `/materials` new-order modal) |
| Code | API route under `src/app/api/` (search for order creation endpoint), UI in `src/app/(app)/materials/` |

**Tasks:**

- [ ] 0-3a — Identify the API route handling order creation (grep for `createOrder` or `POST` in `/api/orders/` or `/api/materials/`)
- [ ] 0-3b — Log and inspect the server error payload — likely missing field or Prisma validation failure
- [ ] 0-3c — Add client-side validation: require ≥1 line item, positive quantities, valid delivery date before enabling "Create Order"
- [ ] 0-3d — Return descriptive error messages from the API instead of generic 500
- [ ] 0-3e — Add toast with actionable message (`e.message` or field-level feedback)
- [ ] 0-3f — Integration test: create order → verify it appears in the orders table with correct totals

---

## Phase 1 — Major Functional Bugs

### 1-1  Damage Report Builder — AI Parse Failure

| Field | Detail |
|-------|--------|
| Bug ID | BUG-004 |
| Severity | 🟠 Major |
| Route | `/ai/damage-builder` |
| Code | `src/app/(app)/ai/damage-builder/client.tsx`, API route for `analyzeDamage` |

**Tasks:**

- [ ] 1-1a — Add Zod schema validation on the AI response before parsing in `client.tsx`
- [ ] 1-1b — Wrap parse logic in try/catch; show user-friendly message ("Analysis could not be completed — try a clearer photo") instead of "Failed to parse AI analysis"
- [ ] 1-1c — Log the raw AI response to Sentry for debugging
- [ ] 1-1d — Coordinate with AI/ML to confirm expected response shape
- [ ] 1-1e — Test with 5+ images (clear damage, blurry, non-damage, oversized, tiny) and verify graceful handling
- [ ] 1-1f — Verify caption generation and PDF export work after successful analysis

---

### 1-2  Rebuttal Builder — No Validation, Silent Failure

| Field | Detail |
|-------|--------|
| Bug ID | BUG-005 |
| Severity | 🟠 Major |
| Route | `/claims/rebuttal-builder` or `/ai/rebuttal-builder` |
| Code | `src/app/(app)/ai/rebuttal-builder/` — **⚠️ DIRECTORY IS EMPTY** |

**Tasks:**

- [ ] 1-2a — **Confirm routing**: the sidebar links to a rebuttal builder but `src/app/(app)/ai/rebuttal-builder/` has no `page.tsx` — is the actual page at `src/app/(app)/claims/appeal-builder/` or somewhere else? Locate the real component.
- [ ] 1-2b — Disable "Generate Rebuttal" button when `!selectedClaim || !carrierResponse.trim()`
- [ ] 1-2c — Add inline validation messages: "Select a claim" and "Enter the carrier response"
- [ ] 1-2d — Show loading state and error handling when AI generation is in progress or fails
- [ ] 1-2e — Test with valid claim + response and verify output quality

---

### 1-3  Appointment Empty-State Button — Dead Click

| Field | Detail |
|-------|--------|
| Bug ID | BUG-006 |
| Severity | 🟠 Major |
| Route | `/appointments` |
| Code | `src/app/(app)/appointments/AppointmentsClient.tsx` |

**Tasks:**

- [ ] 1-3a — Find the empty-state "Schedule Appointment" `<Button>` in `AppointmentsClient.tsx` and wire its `onClick` to the same handler as the header "New Appointment" button (likely `router.push("/appointments/new")`)
- [ ] 1-3b — Remove duplicate CTA: show only the empty-state button when no appointments exist; show header button when list is populated
- [ ] 1-3c — Verify the new appointment form opens from both entry points

---

### 1-4  Supplement Builder — Items Without a Claim

| Field | Detail |
|-------|--------|
| Bug ID | BUG-008 |
| Severity | 🟡 Medium |
| Route | `/ai/supplement-builder` or `/supplements` |
| Code | `src/app/(app)/ai/supplement-builder/` — **⚠️ DIRECTORY IS EMPTY** |

**Tasks:**

- [ ] 1-4a — **Locate the real supplement builder component** (directory is empty — check `src/app/(app)/supplements/`, `src/app/(app)/claims/[claimId]/supplement/`, or `src/components/supplement/`)
- [ ] 1-4b — Disable "Add Line Item" when no claim is selected; show prompt "Select or create a claim first"
- [ ] 1-4c — Optionally support draft mode where items are saved locally and attached to a claim later
- [ ] 1-4d — Test: add item with no claim → blocked; add item with claim → success

---

## Phase 2 — Validation, UX & Error Handling

### 2-1  Quick DOL — Error Message Positioning

| Field | Detail |
|-------|--------|
| Bug ID | BUG-009 |
| Severity | 🟢 Minor |
| Route | `/quick-dol` |
| Code | `src/app/(app)/quick-dol/page.tsx` |

**Tasks:**

- [ ] 2-1a — Replace bottom-of-card "Please fill in all fields" with per-field inline validation (red text under each input)
- [ ] 2-1b — Change placeholder from `"123 Main St, City, State ZIP"` to `"Enter property address…"` to avoid confusion
- [ ] 2-1c — Disable "Find DOL Candidates" button until all required fields have values
- [ ] 2-1d — Clean up `console.log` at line 130 of the Quick DOL API route

---

### 2-2  Persistent Branding Banner — No Dismiss

| Field | Detail |
|-------|--------|
| Bug ID | BUG-010 |
| Severity | 🟢 Minor |
| Route | All pages (rendered in `src/app/(app)/layout.tsx`) |
| Code | `src/components/ProfileStrengthBanner.tsx`, `src/components/onboarding/BrandingContext.tsx` |

**Tasks:**

- [ ] 2-2a — Add a dismiss (X) button to `ProfileStrengthBanner.tsx` that sets `brandingBannerDismissed` in localStorage
- [ ] 2-2b — Respect dismissal state: don't render banner if dismissed OR if branding is complete
- [ ] 2-2c — Remove `console.log` in the banner component (reported at line ~47)
- [ ] 2-2d — Only render the banner on dashboard/settings pages, not every single route
- [ ] 2-2e — Verify banner reappears only if branding status changes (e.g., new required field added)

---

### 2-3  Consistent Form Validation Pattern

| Severity | 🟡 Medium |
|----------|-----------|
| Status | 🔲 |

**Tasks:**

- [ ] 2-3a — Audit all forms in the Pro CRM and categorize validation approach (HTML native, toast, inline, bottom-card)
- [ ] 2-3b — Define a standard validation pattern: inline errors below fields + disabled submit until valid
- [ ] 2-3c — Migrate all major forms to the standard pattern (prioritize: New Appointment, Material Order, Quick DOL, Lead Creation, Supplement Builder, Rebuttal Builder)
- [ ] 2-3d — Replace generic toast errors ("Failed to create order") with descriptive messages from the API

---

### 2-4  Button Style & Copy Consistency

| Severity | 🟡 Medium |
|----------|-----------|
| Status | 🔲 |

**Tasks:**

- [ ] 2-4a — Audit button variants across the app: catalogue every `<Button>` usage and its variant/size
- [ ] 2-4b — Standardize: primary actions = solid, secondary = outlined, destructive = red, ghost = tertiary
- [ ] 2-4c — Standardize placement: modal actions always bottom-right, page actions always top-right
- [ ] 2-4d — Standardize copy casing: choose Title Case or Sentence case and apply globally (currently mixed: "New Job" vs "Add Permit" vs "Convert To Claim")
- [ ] 2-4e — Remove duplicate CTAs (e.g., appointment page has two "new appointment" buttons)

---

### 2-5  Empty State Consistency

| Severity | 🟡 Medium |
|----------|-----------|
| Status | 🔲 |

**Tasks:**

- [ ] 2-5a — Audit all empty states: which have CTAs? Which CTAs work? Which are broken?
- [ ] 2-5b — Ensure every empty-state CTA is functional (fix appointment, crew manager, etc.)
- [ ] 2-5c — Standardize empty-state design: illustration + message + single action button
- [ ] 2-5d — Crew Manager calendar: add ability to create events/crews from the empty state

---

## Phase 3 — Missing Error Boundaries

> The audit and code review revealed 15+ high-traffic sections with no `error.tsx`.
> A crash in any of these renders the entire route group unusable.

| # | Route Section | Path | Status |
|---|---------------|------|--------|
| 3-1 | Dashboard | `src/app/(app)/dashboard/` | 🔲 |
| 3-2 | Messages | `src/app/(app)/messages/` | 🔲 |
| 3-3 | Contacts | `src/app/(app)/contacts/` | 🔲 |
| 3-4 | Appointments | `src/app/(app)/appointments/` | 🔲 |
| 3-5 | Billing | `src/app/(app)/billing/` | 🔲 |
| 3-6 | Invoices | `src/app/(app)/invoices/` | 🔲 |
| 3-7 | Vendor Network | `src/app/(app)/vendor-network/` | 🔲 |
| 3-8 | Materials | `src/app/(app)/materials/` | 🔲 |
| 3-9 | AI Suite | `src/app/(app)/ai/` | 🔲 |
| 3-10 | Pipeline | `src/app/(app)/pipeline/` | 🔲 |
| 3-11 | Notifications | `src/app/(app)/notifications/` | 🔲 |
| 3-12 | Proposals | `src/app/(app)/proposals/` | 🔲 |
| 3-13 | Supplements | `src/app/(app)/supplements/` | 🔲 |
| 3-14 | Work Orders | `src/app/(app)/work-orders/` | 🔲 |
| 3-15 | Commissions | `src/app/(app)/commissions/` | 🔲 |

**Tasks:**

- [ ] 3-A — Create a shared `ErrorFallback` component (reuse pattern from `src/app/(app)/reports/error.tsx`) with Sentry tagging
- [ ] 3-B — Add `error.tsx` to each of the 15 sections above using the shared component
- [ ] 3-C — Add `loading.tsx` skeletons to any section that doesn't already have one
- [ ] 3-D — Verify no error boundary is swallowed silently — all should report to Sentry

---

## Phase 4 — Untested Modules (Requires Full QA Pass)

> These modules were not tested during the audit due to time constraints.
> Each needs a dedicated QA pass with positive + negative testing.

| # | Module | Route | Priority |
|---|--------|-------|----------|
| 4-1 | Invoices | `/invoices` | High |
| 4-2 | Commissions | `/commissions` | High |
| 4-3 | Mortgage Checks | `/mortgage-checks` | High |
| 4-4 | SMS Center | `/sms` | High |
| 4-5 | Messages | `/messages` | High |
| 4-6 | Client Notifications | `/notifications` | Medium |
| 4-7 | Network (Referrals, Partners, Services) | `/network` | Medium |
| 4-8 | Settings — Billing | `/settings/billing` | High |
| 4-9 | Settings — Company | `/settings` | Medium |
| 4-10 | Settings — Seats & Permissions | `/settings/permissions` | High |
| 4-11 | Settings — Integrations | `/settings/integrations` | Medium |
| 4-12 | Settings — Branding | `/settings/branding` | Medium |
| 4-13 | Material Estimator — Full Calculation | `/materials/estimator` | Medium |
| 4-14 | Claim Conversion — End-to-End | `/claims/new` | Critical |
| 4-15 | PDF Exports (all tools) | Various | High |
| 4-16 | eSign Flows | `/esign` | High |
| 4-17 | Job Costing | `/job-costing` (if exists) | Medium |
| 4-18 | Time Tracking | `/time-tracking` | Medium |
| 4-19 | Proposals | `/proposals` | High |
| 4-20 | Vision Lab tools | `/vision-lab` | Medium |

**Tasks:**

- [ ] 4-A — Create a QA checklist for each module above (positive path, negative path, edge cases)
- [ ] 4-B — Execute QA pass for all "High" priority modules first
- [ ] 4-C — Document new bugs in `BUG_LOG.md` following the existing format
- [ ] 4-D — Regression-test Phases 0–2 fixes after new features are validated

---

## Phase 5 — AI Feature Quality & Reliability

> AI-powered features are a key differentiator. The audit found inconsistent quality.

| # | Feature | Status | Issue |
|---|---------|--------|-------|
| 5-1 | Damage Report Builder | ❌ Broken | Fails to parse AI response |
| 5-2 | Project Plan Builder | ✅ Works | Good output quality |
| 5-3 | Mockup Generator | ⚠️ Works but generic | Output not tailored to input image |
| 5-4 | Rebuttal Builder | ❌ No validation | Silent failure with empty inputs |
| 5-5 | Smart Actions | ⚠️ Empty state | No data to test |
| 5-6 | AI Claims Analysis | ❓ Untested | — |
| 5-7 | AI Video | ❓ Untested | — |
| 5-8 | Bad Faith Analysis | ⚠️ Requires claim | Inaccessible without test data |
| 5-9 | Depreciation Calculator | ❓ Untested | — |
| 5-10 | Roofplan Builder | ❓ Untested | — |

**Tasks:**

- [ ] 5-A — Fix Damage Report AI parse failure (see 1-1 above)
- [ ] 5-B — Improve Mockup Generator: validate input image relevance, add disclaimers about AI limitations
- [ ] 5-C — Add input validation to ALL AI tools: require prerequisites, show loading states, handle errors gracefully
- [ ] 5-D — Add Zod response schemas for every AI endpoint to catch format changes
- [ ] 5-E — Create test fixtures (sample images, claims, carrier responses) for repeatable AI QA
- [ ] 5-F — Document AI limitations and expected input requirements in UI tooltips / help text
- [ ] 5-G — QA pass on untested AI tools (5-6 through 5-10)

---

## Phase 6 — Test Coverage & Automation

> Current: 104 tests. Target: comprehensive coverage of must-pass journeys.

### 6-1  Playwright E2E Tests

- [ ] 6-1a — Test: Pro login → dashboard loads with metrics
- [ ] 6-1b — Test: Create lead → appears in lead list → convert to claim
- [ ] 6-1c — Test: Navigate all Reports pages → no error boundary rendered
- [ ] 6-1d — Test: Navigate all Vendor pages → no error boundary rendered
- [ ] 6-1e — Test: Create material order → appears in table
- [ ] 6-1f — Test: Create appointment → appears in calendar/list
- [ ] 6-1g — Test: Generate AI project plan → output renders
- [ ] 6-1h — Test: Upload image to Damage Report → analysis or graceful error
- [ ] 6-1i — Test: Add permit → metrics update
- [ ] 6-1j — Test: Quick DOL with valid/invalid inputs

### 6-2  Vitest Unit / Integration Tests

- [ ] 6-2a — Test: Material order API validation (missing fields, invalid quantities)
- [ ] 6-2b — Test: AI response parsing with valid/malformed payloads
- [ ] 6-2c — Test: Form validation logic for Quick DOL, Supplement Builder, Rebuttal Builder
- [ ] 6-2d — Test: Branding banner display logic (complete, incomplete, dismissed)
- [ ] 6-2e — Test: Error boundary rendering for each section

### 6-3  Storybook Visual Tests

- [ ] 6-3a — Add stories for empty states (appointments, crews, orders, reports)
- [ ] 6-3b — Add stories for error states (API failure toasts, server errors)
- [ ] 6-3c — Add stories for all button variants to enforce design system
- [ ] 6-3d — Run Playwright-vs-Storybook visual regression (task `09`)

---

## Phase 7 — Infrastructure & Code Quality

### 7-1  `as any` Cleanup

- [ ] 7-1a — Current count: ~746 `as any` casts — target: <100
- [ ] 7-1b — Prioritize removal in API routes, AI response handlers, and Prisma queries
- [ ] 7-1c — Replace with proper types or Zod-inferred types

### 7-2  Console.log Cleanup

- [ ] 7-2a — Remove `console.log` from `ProfileStrengthBanner.tsx` (~line 47)
- [ ] 7-2b — Remove `console.log` from Quick DOL API route (~line 130)
- [ ] 7-2c — Run `grep -rn "console.log" src/ | wc -l` and track reduction

### 7-3  `withAuth` Migration

- [ ] 7-3a — Audit all ~200+ API routes for auth protection
- [ ] 7-3b — Migrate write routes (POST, PUT, DELETE) to use `withAuth` wrapper
- [ ] 7-3c — Verify read routes have appropriate auth or are intentionally public

### 7-4  State Management Consolidation

- [ ] 7-4a — Current: Zustand + Jotai + SWR + React Query (4 libraries!)
- [ ] 7-4b — Choose one client-state lib (Zustand) and one server-state lib (React Query or SWR)
- [ ] 7-4c — Migrate and remove unused state libraries from dependencies

### 7-5  Duplicate Layout Detection

- [ ] 7-5a — Check `src/app/(app)/billing/` for duplicate layout providers vs. `src/app/(app)/settings/billing/`
- [ ] 7-5b — Consolidate billing-related routes under one parent

---

## Phase 8 — Cross-Browser, Accessibility & Performance

### 8-1  Cross-Browser Testing

- [ ] 8-1a — Test all must-pass journeys in Safari
- [ ] 8-1b — Test all must-pass journeys in Edge
- [ ] 8-1c — Test responsive design on mobile viewport (375px)
- [ ] 8-1d — Test responsive design on tablet viewport (768px)

### 8-2  Accessibility

- [ ] 8-2a — Run axe-core audit on dashboard, claims, reports, and settings pages
- [ ] 8-2b — Verify keyboard navigation through all major flows
- [ ] 8-2c — Check ARIA roles on modals, dropdowns, and navigation
- [ ] 8-2d — Verify contrast ratios meet WCAG AA (especially the orange branding banner)
- [ ] 8-2e — Screen reader test on key flows (login, lead creation, claim view)

### 8-3  Performance Under Load

- [ ] 8-3a — Populate test environment with 100+ leads, 50+ claims, 200+ orders
- [ ] 8-3b — Verify list rendering, sorting, and filtering perform within acceptable thresholds (<2s)
- [ ] 8-3c — Run Lighthouse CI (task `10`) and track Core Web Vitals
- [ ] 8-3d — Review k6 load test results (500 VU stress already passed ✅)

---

## Phase 9 — Design System & Documentation

### 9-1  Design System

- [ ] 9-1a — Document button variants, sizes, and usage rules
- [ ] 9-1b — Document form validation patterns (inline errors, disabled submit)
- [ ] 9-1c — Document empty-state patterns (illustration + message + CTA)
- [ ] 9-1d — Document modal vs. page navigation decisions
- [ ] 9-1e — Document color palette, spacing scale, and typography
- [ ] 9-1f — Publish as Storybook docs page

### 9-2  Feature Documentation

- [ ] 9-2a — Document AI tool input requirements and limitations for end users
- [ ] 9-2b — Add tooltips / onboarding hints to AI tools (Damage Report, Project Plan, Mockup)
- [ ] 9-2c — Document claim prerequisites for tools that require them (Supplement, Rebuttal, Bad Faith)
- [ ] 9-2d — Create internal runbook for QA testing of each module

---

## Summary Scorecard

| Phase | Items | Blockers | Priority |
|-------|-------|----------|----------|
| 0 — Blockers & Crashes | 3 bugs, 18 tasks | 🔴 3 | **Immediate** |
| 1 — Major Bugs | 4 bugs, 17 tasks | 🟠 4 | **This sprint** |
| 2 — Validation & UX | 5 areas, 20 tasks | — | **This sprint** |
| 3 — Error Boundaries | 15 sections, 4 tasks | — | **Next sprint** |
| 4 — Untested Modules | 20 modules, 4 tasks | — | **Next sprint** |
| 5 — AI Quality | 10 features, 7 tasks | — | **Next sprint** |
| 6 — Test Automation | 3 areas, 17 tests | — | **Ongoing** |
| 7 — Code Quality | 5 areas, 12 tasks | — | **Ongoing** |
| 8 — Cross-Browser/A11y | 3 areas, 12 tasks | — | **Pre-launch** |
| 9 — Design System | 2 areas, 10 tasks | — | **Pre-launch** |

**Total: ~120+ discrete tasks across 10 phases**

---

## Execution Order

```
Week 1:  Phase 0 (blockers) + Phase 1 (major bugs)
Week 2:  Phase 2 (validation/UX) + Phase 3 (error boundaries)
Week 3:  Phase 4 (QA untested modules) + Phase 5 (AI quality)
Week 4:  Phase 6 (test automation) + Phase 7 (code quality)
Week 5+: Phase 8 (cross-browser/a11y) + Phase 9 (design system)
```

---

*Last updated: Feb 18, 2026*
*Source: QA Agent Audit, BUG_LOG.md, codebase analysis*
