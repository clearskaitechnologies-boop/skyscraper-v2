# 🏗️ ClearSkai Master TODO v3 — The Road to 8.5+

> **Generated:** February 11, 2026 — Post-Audit v2  
> **Previous:** v2.0.0 "Fearless Release" (215 items ✅ DONE)  
> **Production:** https://www.skaiscrape.com  
> **GitHub:** ClearSkaiTechnologiesLLC/Skaiscrape (main)  
> **Current Score:** 6.7/10  
> **Target:** 8.5+/10  
> **Architecture:** Next.js 14 · Clerk · Prisma · Supabase · Stripe · Vercel  
> **Scale:** 473 pages · 868 API routes · 1,166 `as any` casts · 313 TODO comments

---

## 📊 Audit Gap Summary

| Category          | Current | Target | Key Metric                       |
| ----------------- | ------- | ------ | -------------------------------- |
| TypeScript Safety | 5/10    | 8/10   | 1,166 → <200 `as any` casts      |
| Testing           | 4/10    | 7/10   | vitest in CI, 5 → 20+ test files |
| Code Hygiene      | 5/10    | 8/10   | 313 → <50 TODO comments          |
| API Validation    | 10%     | 50%+   | 64 → 104+ routes with Zod        |
| UX / Loading      | 9%      | 40%+   | 44 → 90+ loading.tsx files       |

---

## Phase 1 — CI + Testing (4 items)

- [ ] **T-01** Add `pnpm vitest run` step to `.github/workflows/ci.yml` after Lint
- [ ] **T-02** Add `"test:unit": "vitest run"` script to `package.json`
- [ ] **T-03** Verify `vitest.config.ts` resolves aliases and includes src/
- [ ] **T-04** Run vitest locally — fix any failing tests so CI will pass

---

## Phase 2 — `as any` Cleanup: API Routes (20 items)

_Target: eliminate `as any` from the 20 worst API route files (296 → ~180)_

- [ ] **A-01** `api/automation/recommendation/accept/route.ts` — 14 casts
- [ ] **A-02** `api/claims/[claimId]/predict/route.ts` — 13 casts
- [ ] **A-03** `api/intel/claims-packet/route.ts` — 12 casts
- [ ] **A-04** `api/trades/job-board/route.ts` — 10 casts
- [ ] **A-05** `api/_disabled/_wip/report/pdf/route.ts` — 10 casts
- [ ] **A-06** `api/intel/super-packet/route.ts` — 7 casts
- [ ] **A-07** `api/team/invitations/accept/route.ts` — 5 casts
- [ ] **A-08** `api/diag/prisma/route.ts` — 5 casts
- [ ] **A-09** `api/claims/[claimId]/bad-faith/route.ts` — 5 casts
- [ ] **A-10** `api/weather/quick-dol/route.ts` — 4 casts
- [ ] **A-11** `api/vendors/products/route.ts` — 4 casts
- [ ] **A-12** `api/trades/profile/[id]/public/route.ts` — 4 casts
- [ ] **A-13** `api/claims/[claimId]/supplement/[supplementId]/excel/route.ts` — 4 casts
- [ ] **A-14** `api/claims/[claimId]/supplement/[supplementId]/download/route.ts` — 4 casts
- [ ] **A-15** `api/claims/[claimId]/rebuttal-builder/route.ts` — 4 casts
- [ ] **A-16** `api/templates/[templateId]/duplicate/route.ts` — 3 casts
- [ ] **A-17** `api/reports/view/[id]/route.ts` — 3 casts
- [ ] **A-18** `api/reports/retail/generate/route.ts` — 3 casts
- [ ] **A-19** `api/reports/delivery/route.ts` — 3 casts
- [ ] **A-20** `api/onboarding/init/route.ts` — 3 casts

---

## Phase 3 — `as any` Cleanup: Lib + Components (20 items)

_Target: eliminate `as any` from the 20 worst lib/component files (573 → ~350)_

- [ ] **L-01** `lib/domains/custom.ts` — 16 casts
- [ ] **L-02** `lib/db/adapters/userAdapter.ts` — 16 casts
- [ ] **L-03** `lib/report-engine/collectors/documents.ts` — 15 casts
- [ ] **L-04** `lib/services/chat-service.ts` — 14 casts
- [ ] **L-05** `components/pdf/sections/WarrantySection.tsx` — 14 casts
- [ ] **L-06** `lib/orchestration/kubernetes.ts` — 12 casts
- [ ] **L-07** `lib/audit/auditTrail.ts` — 12 casts
- [ ] **L-08** `lib/active/learning.ts` — 12 casts
- [ ] **L-09** `(app)/contracts/[id]/page.tsx` — 12 casts
- [ ] **L-10** `lib/failover/multiregion.ts` — 11 casts
- [ ] **L-11** `lib/activity/feed.ts` — 11 casts
- [ ] **L-12** `components/pdf/sections/ClaimSnapshotSection.tsx` — 11 casts
- [ ] **L-13** `lib/migration/tools.ts` — 10 casts
- [ ] **L-14** `(app)/trades/messages/page.tsx` — 10 casts
- [ ] **L-15** `lib/auth/getActiveOrgSafe.ts` — 9 casts
- [ ] **L-16** `lib/activity/activityFeed.ts` — 9 casts
- [ ] **L-17** `lib/webhooks/advanced.ts` — 8 casts
- [ ] **L-18** `lib/queue/messaging.ts` — 8 casts
- [ ] **L-19** `lib/errors/tracking.ts` — 8 casts
- [ ] **L-20** `lib/ensemble/methods.ts` — 8 casts

---

## Phase 4 — Zod Validation on Critical Write Routes (20 items)

_Target: add Zod schemas to the 20 highest-risk write endpoints_

- [ ] **Z-01** `api/leads/route.ts` — POST create lead
- [ ] **Z-02** `api/claims/route.ts` — POST create claim
- [ ] **Z-03** `api/contacts/[contactId]/route.ts` — PUT/PATCH update contact
- [ ] **Z-04** `api/messages/create/route.ts` — POST send message
- [ ] **Z-05** `api/checkout/route.ts` — POST create checkout session
- [ ] **Z-06** `api/portal/claims/create/route.ts` — POST homeowner claim
- [ ] **Z-07** `api/trades/profile/route.ts` — PUT update trade profile
- [ ] **Z-08** `api/trades/onboarding/route.ts` — POST onboard contractor
- [ ] **Z-09** `api/settings/organization/route.ts` — PUT org settings
- [ ] **Z-10** `api/settings/notifications/route.ts` — PUT notification prefs
- [ ] **Z-11** `api/team/invite/route.ts` — POST invite team member
- [ ] **Z-12** `api/team/members/[memberId]/route.ts` — PATCH update role
- [ ] **Z-13** `api/profile/route.ts` — PUT update profile
- [ ] **Z-14** `api/onboarding/complete/route.ts` — POST complete onboarding
- [ ] **Z-15** `api/billing/subscription/route.ts` — POST subscription action
- [ ] **Z-16** `api/claims/[claimId]/route.ts` — PATCH update claim
- [ ] **Z-17** `api/claims/[claimId]/documents/route.ts` — POST upload doc
- [ ] **Z-18** `api/claims/[claimId]/notes/route.ts` — POST add note
- [ ] **Z-19** `api/vendors/route.ts` — POST create vendor
- [ ] **Z-20** `api/templates/route.ts` — POST create template

---

## Phase 5 — Loading Skeletons: Batch 1 (23 items)

_Target: add loading.tsx to first 23 of 46 missing (app) directories_

- [ ] **S-01** `(app)/admin/loading.tsx`
- [ ] **S-02** `(app)/ai-proposals/loading.tsx`
- [ ] **S-03** `(app)/ai-tools/loading.tsx`
- [ ] **S-04** `(app)/archive/loading.tsx`
- [ ] **S-05** `(app)/assets/loading.tsx`
- [ ] **S-06** `(app)/bids/loading.tsx`
- [ ] **S-07** `(app)/box-summary/loading.tsx`
- [ ] **S-08** `(app)/builder/loading.tsx`
- [ ] **S-09** `(app)/claims-ready-folder/loading.tsx`
- [ ] **S-10** `(app)/client-leads/loading.tsx`
- [ ] **S-11** `(app)/client-networks/loading.tsx`
- [ ] **S-12** `(app)/clients/loading.tsx`
- [ ] **S-13** `(app)/company-map/loading.tsx`
- [ ] **S-14** `(app)/damage-builder/loading.tsx`
- [ ] **S-15** `(app)/deployment-proof/loading.tsx`
- [ ] **S-16** `(app)/depreciation/loading.tsx`
- [ ] **S-17** `(app)/evidence/loading.tsx`
- [ ] **S-18** `(app)/feedback/loading.tsx`
- [ ] **S-19** `(app)/getting-started/loading.tsx`
- [ ] **S-20** `(app)/governance/loading.tsx`
- [ ] **S-21** `(app)/integrations/loading.tsx`
- [ ] **S-22** `(app)/map/loading.tsx`
- [ ] **S-23** `(app)/marketplace/loading.tsx`

---

## Phase 6 — Loading Skeletons: Batch 2 (23 items)

_Target: add loading.tsx to remaining 23 of 46 missing (app) directories_

- [ ] **S-24** `(app)/meetings/loading.tsx`
- [ ] **S-25** `(app)/onboarding/loading.tsx`
- [ ] **S-26** `(app)/operations/loading.tsx`
- [ ] **S-27** `(app)/opportunities/loading.tsx`
- [ ] **S-28** `(app)/project-board/loading.tsx`
- [ ] **S-29** `(app)/property-profiles/loading.tsx`
- [ ] **S-30** `(app)/proposals/loading.tsx`
- [ ] **S-31** `(app)/quick-dol/loading.tsx`
- [ ] **S-32** `(app)/rebuttal/loading.tsx`
- [ ] **S-33** `(app)/report-workbench/loading.tsx`
- [ ] **S-34** `(app)/route-optimization/loading.tsx`
- [ ] **S-35** `(app)/routes/loading.tsx`
- [ ] **S-36** `(app)/scheduling/loading.tsx`
- [ ] **S-37** `(app)/supplement/loading.tsx`
- [ ] **S-38** `(app)/support/loading.tsx`
- [ ] **S-39** `(app)/tasks/loading.tsx`
- [ ] **S-40** `(app)/team/loading.tsx`
- [ ] **S-41** `(app)/tokens/loading.tsx`
- [ ] **S-42** `(app)/tools/loading.tsx`
- [ ] **S-43** `(app)/trade-partners/loading.tsx`
- [ ] **S-44** `(app)/uploads/loading.tsx`
- [ ] **S-45** `(app)/vision-lab/loading.tsx`
- [ ] **S-46** `(app)/weather-chains/loading.tsx`

---

## Phase 7 — Code Hygiene Sweep (5 items)

- [ ] **H-01** Triage 313 TODO comments: mark genuine work items, delete stale/placeholder TODOs
- [ ] **H-02** Remove 5 FIXME/HACK/XXX comments or convert to proper Issues
- [ ] **H-03** Run `pnpm typecheck` — fix any regressions from `as any` cleanup
- [ ] **H-04** Run `pnpm lint` — fix any new warnings
- [ ] **H-05** Run `pnpm build` — verify production build passes

---

## Phase 8 — Ship It (5 items)

- [ ] **D-01** Update CHANGELOG.md with v2.1.0 entries
- [ ] **D-02** Bump VERSION to v2.1.0
- [ ] **D-03** `git add -A && git commit -m "v2.1.0: audit gap closure"`
- [ ] **D-04** `git push origin main`
- [ ] **D-05** `vercel --prod --yes`

---

## 📈 Score Projection

| Phase                 | Items | Impact                 | Projected Score |
| --------------------- | ----- | ---------------------- | --------------- |
| Phase 1: CI + Testing | 4     | Testing 4→7            | 7.0             |
| Phase 2: `any` API    | 20    | TS Safety 5→6.5        | 7.3             |
| Phase 3: `any` Lib    | 20    | TS Safety 6.5→8        | 7.7             |
| Phase 4: Zod          | 20    | API Validation 10%→50% | 8.0             |
| Phase 5-6: Skeletons  | 46    | UX Loading 9%→40%      | 8.3             |
| Phase 7: Hygiene      | 5     | Code Hygiene 5→8       | 8.5             |
| Phase 8: Ship         | 5     | —                      | 8.5+ ✅         |

**Total: 120 items across 8 phases**

---

_Last updated: February 11, 2026_
