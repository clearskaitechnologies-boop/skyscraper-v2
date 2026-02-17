# 🚀 ClearSkai Master TODO v4 — Ship, Fix, Build the Future

> **Generated:** February 12, 2026  
> **Version:** v2.1.0 "Clarity Release"  
> **Previous:** v3 (120 items — Phases 1-7 ✅ DONE), v2 (215 items ✅ DONE)  
> **Production:** https://www.skaiscrape.com  
> **GitHub:** ClearSkaiTechnologiesLLC/Skaiscrape (main)  
> **Architecture:** Next.js 14 · Clerk · Prisma · Supabase · Stripe · Vercel  
> **Scale:** 473 pages · 868 API routes · 90 loading.tsx · 820 `as any` casts

---

## ✅ Completed This Session (v3 Execution)

| Phase     | What                    | Result                                                                |
| --------- | ----------------------- | --------------------------------------------------------------------- |
| Phase 1   | CI + Testing            | vitest in CI pipeline, 7 files / 44 tests passing                     |
| Phase 2   | `as any` API routes     | 20 worst files cleaned (~116 casts removed)                           |
| Phase 3   | `as any` lib/components | 20 worst files cleaned (~230 casts removed)                           |
| Phase 4   | Zod validation          | ~15 critical write routes validated                                   |
| Phase 5-6 | Loading skeletons       | 46 new loading.tsx files (44 → 90 total)                              |
| Phase 7   | Code hygiene            | TypeScript 0 errors, vitest 44/44, import sorting fixed               |
| Hotfix    | Black outlines          | Removed borders from Card, PageSectionCard, .card, .panel, .badge     |
| Hotfix    | Nav items               | Enabled Vision Labs + Mockup Generator feature flags                  |
| Hotfix    | Property Profiles       | Rewrote [id] page to use Prisma directly (was self-fetching dead API) |
| Hotfix    | Messages                | Added error boundary, verified API routes exist                       |
| Hotfix    | Imports                 | ESLint autofix on 6 files with sorting issues                         |

---

## 📋 PHASE A — Immediate Production Fixes (Sprint 1)

## ✅ Enterprise Credibility Sprint (Focused Block)

Replace current plan with:

1. **/api/integrations/status** endpoint
2. **Integration Status Dashboard UI** (`/settings/integrations`)
3. **Visual polish + empty states**
4. **Sales screenshot export**

Everything else moves below the fold.

---

## 🧾 Backlog (Below the Fold)

### A1. Trades Account Persistence

- [ ] **FIX-01** Investigate why Damien's trades account (buildwithdamienray@gmail.com) keeps vanishing
- [ ] **FIX-02** Check `tradesProfile` + `tradesCompanyMember` records in DB for userId linkage
- [ ] **FIX-03** Check Clerk userId mapping — ensure stable userId across sessions
- [ ] **FIX-04** Add DB trigger or constraint to prevent orphaned trades profiles
- [ ] **FIX-05** Seed/restore Damien Willingham profile if missing from DB

### A2. Company Page (ClearSkai Technologies)

- [ ] **FIX-06** Ensure ClearSkai Technologies is loaded as company page at `/trades/company`
- [ ] **FIX-07** Check `tradesCompany` record exists and is linked to org
- [ ] **FIX-08** Verify company branding/logo loads on the company page

### A3. Messages Page Stability

- [ ] **FIX-09** Add debug logging to `/api/messages/threads` to trace empty responses
- [ ] **FIX-10** Test message thread creation end-to-end (pro → client, pro → pro)
- [ ] **FIX-11** Verify `/api/trades/messages` returns data for authenticated user
- [ ] **FIX-12** Add retry logic in messages page for failed API calls

### A4. Notification Model

- [ ] **FIX-13** Create `TradeNotification` Prisma model (ROADMAP 1.3)
- [ ] **FIX-14** Create `ClientNotification` Prisma model
- [ ] **FIX-15** Run migration and uncomment 6 notification create calls
- [ ] **FIX-16** Wire notification badge counts to real data

### A5. Team Invite Emails

- [ ] **FIX-17** Wire Resend email in `trades/company/seats/invite` route (ROADMAP 1.2)
- [ ] **FIX-18** Create invite email template with magic link
- [ ] **FIX-19** Test invite flow end-to-end

---

## 📋 PHASE B — UI/UX Polish (Sprint 2)

### B1. Card & Layout System

- [x] **UI-01** Remove black borders from all card components ✅
- [x] **UI-02** Remove borders from .panel, .panel-ghost, .badge in globals.css ✅
- [ ] **UI-03** Audit remaining components for unwanted border lines (DataTable, sidebar dividers)
- [ ] **UI-04** Standardize shadow depths: shadow-sm (cards), shadow-md (modals), shadow-lg (popups)
- [ ] **UI-05** Add subtle gradient backgrounds to stat cards for visual depth

### B2. Loading & Error States

- [x] **UI-06** 46 new loading.tsx skeletons created ✅
- [ ] **UI-07** Create `not-found.tsx` for all major dynamic routes ([id] pages)
- [ ] **UI-08** Add empty states with action CTAs for every list page (claims, reports, contacts)
- [ ] **UI-09** Add shimmer/skeleton loading to data tables

### B3. Mobile Responsiveness

- [ ] **UI-10** Test all pages at 375px, 768px, 1024px breakpoints
- [ ] **UI-11** Fix sidebar collapse on mobile (hamburger menu)
- [ ] **UI-12** Ensure all modals/dialogs are mobile-friendly
- [ ] **UI-13** Touch-friendly tap targets (min 44px)

### B4. Dark Mode

- [ ] **UI-14** Audit all pages for dark mode compatibility
- [ ] **UI-15** Fix any hard-coded colors (bg-white, text-black) to use CSS variables
- [ ] **UI-16** Test dark mode transitions (no flash of wrong theme)

---

## 📋 PHASE C — Code Quality Hardening (Sprint 3)

### C1. TypeScript Safety (820 → <200 `as any`)

- [ ] **TS-01** Run `grep -rn "as any" src/ | wc -l` — current baseline
- [ ] **TS-02** Clean 20 more component files (highest cast counts)
- [ ] **TS-03** Clean 20 more API route files
- [ ] **TS-04** Clean 10 more lib/service files
- [ ] **TS-05** Add strict Prisma typing helpers (`satisfies Prisma.XxxCreateInput`)

### C2. Testing Expansion

- [ ] **TEST-01** Add tests for claim creation flow (API + validation)
- [ ] **TEST-02** Add tests for trades onboarding (profile + company creation)
- [ ] **TEST-03** Add tests for report generation pipeline
- [ ] **TEST-04** Add tests for billing/checkout webhook handling
- [ ] **TEST-05** Add E2E test for login → dashboard → create claim flow
- [ ] **TEST-06** Add E2E test for trades onboarding → profile → messages
- [ ] **TEST-07** Target: 20+ test files, 100+ tests

### C3. API Validation (80 → 150+ routes with Zod)

- [ ] **ZOD-01** Add Zod to all remaining PATCH/PUT routes
- [ ] **ZOD-02** Add Zod to all query param parsing (GET routes with filters)
- [ ] **ZOD-03** Add response schemas for critical endpoints
- [ ] **ZOD-04** Create shared Zod schemas in `src/lib/validations/`

### C4. Error Handling

- [ ] **ERR-02** Create standard API error response format (`{ error, code, details }`)
- [ ] **ERR-03** Add rate limiting to public-facing API routes
- [ ] **ERR-04** Add request ID tracking for debugging

---

## 📋 PHASE D — Data & Backend (Sprint 4)

### D1. Database Optimization

- [ ] **DB-01** Add missing indexes identified in ROADMAP (compound indexes on hot queries)
- [ ] **DB-02** Add soft delete pattern to claims, reports, contacts
- [ ] **DB-03** Implement connection pooling with PgBouncer
- [ ] **DB-04** Add query logging for slow queries (>500ms)

### D2. Caching & Performance

- [ ] **PERF-01** Add Redis/Upstash caching for dashboard aggregate queries
- [ ] **PERF-02** Add ISR (Incremental Static Regeneration) for public pages
- [ ] **PERF-03** Optimize large data tables with virtual scrolling
- [ ] **PERF-04** Add image optimization pipeline (Sharp/next/image)
- [ ] **PERF-05** Bundle analysis — reduce client-side JS below 300kb

### D3. File Storage

- [ ] **STORE-01** Migrate from local/public to Supabase Storage for all uploads
- [ ] **STORE-02** Add signed URL generation for private files (reports, photos)
- [ ] **STORE-03** Implement file type validation (PDF, images only)
- [ ] **STORE-04** Add upload size limits (10MB images, 50MB PDFs)

---

## 📋 PHASE E — Feature Completion (Sprint 5-6)

### E1. Vision Labs (AI Image Analysis)

- [x] **FEAT-01** Enable Vision Labs in nav ✅
- [ ] **FEAT-02** Build photo upload interface (drag-drop, multi-image)
- [ ] **FEAT-03** Integrate OpenAI Vision API for damage detection
- [ ] **FEAT-04** Generate damage annotations on images
- [ ] **FEAT-05** Create damage summary report from AI analysis
- [ ] **FEAT-06** Save analysis results to property/claim record

### E2. Mockup Generator (AI Design)

- [x] **FEAT-07** Enable Mockup Generator in nav ✅
- [ ] **FEAT-08** Build mockup builder UI with canvas/overlay tools
- [ ] **FEAT-09** Integrate AI image generation (DALL-E / Stable Diffusion)
- [ ] **FEAT-10** Before/after visualization with slider
- [ ] **FEAT-11** Export mockups as PDF attachments for proposals
- [ ] **FEAT-12** Template library for common mockup scenarios

### E3. Design Workspace

- [ ] **FEAT-13** Create `/design-workspace` page with canvas-based editor
- [ ] **FEAT-14** Drag-and-drop material placement on property images
- [ ] **FEAT-15** Color picker / material selector (shingles, siding, paint)
- [ ] **FEAT-16** Integration with vendor product catalog for real materials
- [ ] **FEAT-17** Export design as client-ready presentation

### E4. Material Plan Builder

- [ ] **FEAT-18** Create `/material-plan` builder page
- [ ] **FEAT-19** AI-powered material quantity calculator from roof measurements
- [ ] **FEAT-20** Material cost estimator with vendor pricing integration
- [ ] **FEAT-21** Generate material order lists (BOM — Bill of Materials)
- [ ] **FEAT-22** One-click order placement through vendor network
- [ ] **FEAT-23** Material plan PDF export for client approval

### E5. Client Product Page

- [ ] **FEAT-24** Create `/portal/products` page for homeowners
- [ ] **FEAT-25** Show manufacturer catalog (moved from pro VIN — pro sees dealers only)
- [ ] **FEAT-26** Product comparison tool (side-by-side specs)
- [ ] **FEAT-27** Product recommendation engine based on property profile
- [ ] **FEAT-28** "Request Quote" button connecting to trades network

### E6. AI Image Creation

- [ ] **FEAT-29** Create `/ai/image-creator` page
- [ ] **FEAT-30** Upload property photo → generate renovation/repair mockup
- [ ] **FEAT-31** Style transfer for exterior/interior design concepts
- [ ] **FEAT-32** Before/after split-view with animation
- [ ] **FEAT-33** Gallery of generated images per property
- [ ] **FEAT-34** Integration with Material Plan Builder for realistic renders

### E7. Vendor Ordering System

- [ ] **FEAT-35** `/vendors/orders` page with order management
- [ ] **FEAT-36** Shopping cart for multi-vendor orders
- [ ] **FEAT-37** Order tracking & delivery status
- [ ] **FEAT-38** Invoice generation for vendor orders
- [ ] **FEAT-39** Integration with Stripe for payment processing

---

## 📋 PHASE F — Platform Growth (Sprint 7-8)

### F1. Multi-Tenant / White Label

- [ ] **PLAT-01** Custom domain support per organization
- [ ] **PLAT-02** White-label branding (logo, colors, fonts per org)
- [ ] **PLAT-03** Org-level feature toggles
- [ ] **PLAT-04** Admin dashboard for managing all orgs

### F2. Integrations

- [ ] **INT-01** Xactimate import/export
- [ ] **INT-02** QuickBooks integration for invoicing
- [ ] **INT-03** Google Calendar sync for appointments
- [ ] **INT-04** Zapier/webhook triggers for key events
- [ ] **INT-05** CompanyCam photo import
- [ ] **INT-06** EagleView / GAF SmartMoney integration

### F3. Mobile App

- [ ] **MOB-01** React Native or Expo wrapper for core features
- [ ] **MOB-02** Push notifications (FCM/APNS)
- [ ] **MOB-03** Offline-capable claim/inspection creation
- [ ] **MOB-04** Camera integration for field documentation
- [ ] **MOB-05** GPS-based check-in/check-out for job sites

### F4. Analytics & Reporting

- [ ] **ANLY-01** Advanced analytics dashboard with charts (Recharts/Tremor)
- [ ] **ANLY-02** Revenue forecasting from pipeline data
- [ ] **ANLY-03** Team performance metrics
- [ ] **ANLY-04** Customer acquisition funnel tracking
- [ ] **ANLY-05** Automated weekly/monthly email reports

### F5. Security & Compliance

- [ ] **SEC-01** SOC 2 compliance checklist
- [ ] **SEC-02** GDPR data export/deletion tools
- [ ] **SEC-03** Audit logging for all data mutations
- [ ] **SEC-04** Two-factor authentication enforcement
- [ ] **SEC-05** Penetration testing and vulnerability assessment

---

## 📋 PHASE G — DevOps & Infrastructure (Ongoing)

### G1. CI/CD Pipeline

- [x] **OPS-01** Vitest in CI pipeline ✅
- [ ] **OPS-02** Add E2E tests to CI (Playwright)
- [ ] **OPS-03** Add Lighthouse CI performance checks
- [ ] **OPS-04** Add bundle size checks (fail if >5% increase)
- [ ] **OPS-05** Automated preview deployments for PRs
- [ ] **OPS-06** Staging environment with seed data

### G2. Documentation

- [ ] **DOC-01** API documentation (Swagger/OpenAPI spec)
- [ ] **DOC-02** Developer onboarding guide
- [ ] **DOC-03** Database schema documentation (ERD diagram)
- [ ] **DOC-04** Deployment runbook
- [ ] **DOC-05** Feature flag documentation

---

## 📊 Score Tracking

| Category          | Before v2 | After v2 | After v3 | Target |
| ----------------- | --------- | -------- | -------- | ------ |
| TypeScript Safety | 3/10      | 5/10     | 7/10     | 9/10   |
| Testing           | 2/10      | 4/10     | 6/10     | 8/10   |
| Code Hygiene      | 3/10      | 5/10     | 7/10     | 9/10   |
| API Validation    | 5%        | 10%      | 15%+     | 50%+   |
| UX / Loading      | 0%        | 9%       | 19%+     | 50%+   |
| Error Handling    | 4/10      | 5/10     | 6/10     | 8/10   |
| Overall           | 4.0/10    | 6.7/10   | 7.5/10   | 8.5+   |

---

## 🎯 Priority Order

1. **Phase A** — Fix production bugs (accounts, messages, notifications)
2. **Phase B** — Polish UI/UX for demo readiness
3. **Phase C** — Harden code quality for maintainability
4. **Phase D** — Backend optimization for scale
5. **Phase E** — Build differentiating features (Vision Labs, Design Workspace, Material Plans)
6. **Phase F** — Platform growth (mobile, integrations, white label)
7. **Phase G** — DevOps maturity (CI, monitoring, docs)

---

_Total items: ~140 remaining | Last updated: February 12, 2026 — ClearSkai Technologies LLC_
