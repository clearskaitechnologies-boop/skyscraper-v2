# 🎯 MASTER GAME PLAN — February 2026

> **Phase**: Pre-Pilot / Release Candidate Engineering  
> **Priority Order**: B → C → E → D → A  
> **Target**: Pilot-ready in 2 weeks

---

## 📊 CURRENT STATUS ASSESSMENT

### ✅ FULLY OPERATIONAL

- Architecture boundaries & adapters
- Security, tenancy, rate limiting
- Marketplace → Profile → Messaging flow
- Client ↔ Pro profile symmetry
- Workspace deep-linking
- Exports & PDFs (core)
- Regression guards (32/32 passing)
- Build stable (production ready)

### 🟡 NEEDS FINALIZATION

| Area              | Current State                     | Gap                                  |
| ----------------- | --------------------------------- | ------------------------------------ |
| Compliance Engine | API exists, IRC/IBC codes partial | Caching, PDF table, more states      |
| Damage Builder    | Vision API integration exists     | Annotation overlay, full pipeline    |
| Pricing           | 3 tiers defined, Stripe setup     | Test plans validation, pilot pricing |
| Onboarding        | Multi-path flows exist            | Checklist, pilot contracts           |
| TypeScript        | 3164 errors, skipTypeCheck on     | Not blocking pilots                  |

---

## 🥇 PRIORITY B — COMPLIANCE ENGINE FINALIZATION

### Current Assets

- `/src/lib/compliance/code-checker.ts` - Core checker with IRC/IBC
- `/src/app/api/ai/code-compliance/route.ts` - Full API endpoint
- `/src/modules/reports/types/index.ts` - Types with jurisdictionType
- `/src/modules/reports/core/DataProviders.ts` - Code citations

### What Exists ✅

- State code adoptions (AZ, TX, FL, CA, CO, NY)
- IRC roofing codes (underlayment, wind resistance, ice barrier, flashings)
- Hurricane zone requirements
- Permit requirement detection
- Violation severity levels
- Zod validation on inputs

### What's Missing ❌

1. **More state coverage** - Only 6 states have full data
2. **County-level amendments** - Structure exists, data sparse
3. **Caching layer** - No Redis/memory cache for repeat lookups
4. **PDF compliance table** - Not integrated into report export
5. **Deterministic citations** - Some are AI-generated, need to be static

### Execution Plan

#### Sprint 1: Data Expansion (Day 1-2)

```
1. Add 10 more high-priority states:
   - NV, NM, OK, LA, GA, SC, NC, TN, AL, MS

2. Add hurricane zone data for Gulf/Atlantic states

3. Add wildfire zone data for Western states (CA, CO, NV)
```

#### Sprint 2: Caching & Performance (Day 2-3)

```
1. Add in-memory cache for code lookups
2. Add Redis cache with 24hr TTL for API results
3. Pre-compute common state/damage combinations
```

#### Sprint 3: PDF Integration (Day 3-4)

```
1. Add compliance section to PDF report generator
2. Table format: Code | Section | Requirement | Status
3. Include jurisdiction/edition in header
4. Add permit notes section
```

#### Sprint 4: Validation (Day 4)

```
1. Test all 16 states with sample claims
2. Verify citations are accurate
3. Confirm PDF export looks correct
```

### Files to Modify

| File                                      | Action                           |
| ----------------------------------------- | -------------------------------- |
| `src/lib/compliance/code-checker.ts`      | Add more states, cache layer     |
| `src/app/api/ai/code-compliance/route.ts` | Add caching, expand requirements |
| `src/lib/pdf/generateReport.ts`           | Add compliance table section     |
| `src/modules/reports/sections/`           | Add ComplianceSection.ts         |

---

## 🥈 PRIORITY C — DAMAGE BUILDER PIPELINE

### Current Assets

- `/src/modules/ai/engines/damageBuilder.ts` - Core vision analysis
- `/src/app/api/ai/annotations/route.ts` - SVG annotation overlay
- `/src/lib/ai/damage.ts` - Analysis types
- `/src/lib/pdf/damageReport.ts` - PDF generation
- `/src/worker/jobs/damage-analyze.ts` - Background worker

### What Exists ✅

- OpenAI Vision API integration (gpt-4o)
- Damage type detection (hail, wind, granule loss)
- Severity classification (low/medium/high/critical)
- Caption generation
- Mock fallback for dev/demo
- SVG annotation overlay generation

### What's Missing ❌

1. **UI for annotation review** - No visual editor
2. **Photo-to-PDF pipeline** - Exists but needs polish
3. **Annotation overlay on exports** - SVG exists, PDF integration incomplete
4. **Batch photo upload** - Single photo only
5. **Confidence thresholds** - No filtering by confidence

### Execution Plan

#### Sprint 1: Annotation Pipeline (Day 1-2)

```
1. Integrate SVG overlay into PDF export
2. Add bounding box rendering for damages
3. Include confidence scores in captions
```

#### Sprint 2: Batch Processing (Day 2-3)

```
1. Update upload to handle multiple photos
2. Queue processing with progress indicators
3. Aggregate results across photo set
```

#### Sprint 3: Review UI (Day 3-4)

```
1. Add annotation preview component
2. Allow toggling annotations on/off
3. Edit captions before export
4. Approve/reject individual findings
```

#### Sprint 4: PDF Polish (Day 4)

```
1. Photo gallery section with annotations
2. Damage summary table
3. Material identification list
4. Overall condition assessment
```

### Files to Modify

| File                                      | Action                    |
| ----------------------------------------- | ------------------------- |
| `src/modules/ai/engines/damageBuilder.ts` | Batch support, thresholds |
| `src/app/api/ai/annotations/route.ts`     | Multi-photo support       |
| `src/lib/pdf/damageReport.ts`             | Annotation overlay in PDF |
| `src/components/claims/`                  | Add DamageReviewPanel.tsx |

---

## 🥉 PRIORITY E — PILOT LAUNCH PREP

### Current Assets

- `/src/app/(marketing)/pricing/page.tsx` - 3-tier pricing page
- `/src/lib/billing/plans.ts` - Plan definitions
- `/src/lib/stripe/handler.ts` - Stripe webhook handling
- Multiple onboarding paths exist

### What Exists ✅

- Solo/Business/Enterprise tiers defined
- Feature lists per tier
- Stripe price IDs configured
- Checkout flow works
- Token-based billing
- Subscription tracking

### What's Missing ❌

1. **Pilot pricing tier** - No discounted pilot plan
2. **Test plans validated** - Need to verify in Stripe test mode
3. **Onboarding checklist** - No guided first-run experience
4. **Feedback collection** - No in-app feedback form
5. **Support channel** - No help desk/chat integration
6. **Pilot contracts** - No legal agreement flow

### Execution Plan

#### Sprint 1: Pilot Tier Setup (Day 1)

```
1. Create "Pilot" plan in Stripe
   - 50% discount
   - 3-month term
   - Limited to 10 customers

2. Add pilot tier to plans.ts

3. Add pilot pricing card to pricing page
```

#### Sprint 2: Onboarding Checklist (Day 1-2)

```
1. Create OnboardingChecklist component
2. Track completion of:
   - Profile setup
   - First claim created
   - First photo uploaded
   - First report generated
   - Team member invited

3. Show progress on dashboard
```

#### Sprint 3: Feedback & Support (Day 2-3)

```
1. Add feedback form modal
2. API endpoint to collect feedback
3. Store in database for review
4. Add help link to docs/support email
```

#### Sprint 4: Validation (Day 3)

```
1. Test Stripe checkout in test mode
2. Verify webhook processing
3. Confirm subscription creates properly
4. Test upgrade/downgrade flows
```

### Files to Create/Modify

| File                                                | Action                  |
| --------------------------------------------------- | ----------------------- |
| `src/lib/billing/plans.ts`                          | Add pilot tier          |
| `src/app/(marketing)/pricing/page.tsx`              | Add pilot card          |
| `src/components/onboarding/OnboardingChecklist.tsx` | NEW                     |
| `src/app/api/feedback/route.ts`                     | NEW - feedback endpoint |
| `src/components/feedback/FeedbackModal.tsx`         | NEW                     |

---

## 🟦 PRIORITY D — UI POLISH (After B, C, E)

### Quick Wins

- [ ] Loading skeletons on all data-fetching pages
- [ ] Empty states with helpful CTAs
- [ ] Error banners with retry buttons
- [ ] Mobile responsive tweaks
- [ ] Consistent button sizes
- [ ] Profile card spacing

---

## 🟩 PRIORITY A — TYPESCRIPT CLEANUP (Last)

### Attack Order

1. API routes (`src/app/api/**/route.ts`)
2. AI lib (`src/lib/ai/**`)
3. PDF lib (`src/lib/pdf/**`)
4. Exports (`src/app/(app)/exports/**`)
5. Messaging + Profiles

### Kill Patterns

- DTO mismatches
- Nullable fields without guards
- Snake_case → camelCase refs
- Prisma include shapes not in adapters
- Enum mismatches
- Implicit `any`

---

## 📅 WEEKLY EXECUTION TIMELINE

### Week 1: Core Engine Work

| Day | Focus                     | Deliverable             |
| --- | ------------------------- | ----------------------- |
| Mon | Compliance data expansion | 16 states covered       |
| Tue | Compliance caching + PDF  | Cache layer + PDF table |
| Wed | Damage builder batch      | Multi-photo processing  |
| Thu | Damage review UI          | Annotation preview      |
| Fri | Pilot tier + checklist    | Stripe pilot plan live  |

### Week 2: Polish & Launch

| Day | Focus                 | Deliverable        |
| --- | --------------------- | ------------------ |
| Mon | Feedback system       | Modal + API        |
| Tue | UI polish sweep       | Loading states     |
| Wed | Full QA pass          | End-to-end testing |
| Thu | Pilot contracts ready | Legal docs         |
| Fri | First pilot onboarded | 🚀                 |

---

## ✅ SUCCESS CRITERIA

### Compliance Engine

- [ ] 16+ states with full IRC/IBC data
- [ ] Cache hit rate > 80%
- [ ] PDF includes compliance table
- [ ] All citations are deterministic

### Damage Builder

- [ ] Batch upload works (5+ photos)
- [ ] Annotations visible in PDF
- [ ] Review UI allows edit/approve
- [ ] Confidence filtering works

### Pilot Ready

- [ ] Pilot tier in Stripe
- [ ] Checkout flow tested
- [ ] Onboarding checklist shows on dashboard
- [ ] Feedback form accessible
- [ ] 3 pilot customers identified

---

## 🔥 IMMEDIATE NEXT ACTIONS

1. **Push current changes** to git + Vercel prod
2. **Start compliance state expansion** (highest ROI first)
3. **Create pilot Stripe product** in test mode
4. **Build onboarding checklist component**

---

_Generated: 2026-02-04_  
_Status: Ready for execution_
