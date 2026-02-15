# 🎯 COMPREHENSIVE DE-MOCK + PRODUCTION READINESS PLAN

**Status:** EXECUTING  
**Target Completion:** < 45 minutes  
**Blockers:** 0

---

## SYSTEMATIC FIX ORDER

### ✅ PHASE 0: Audit Tooling (COMPLETE)

- [x] Build fingerprint component created
- [x] Mock audit script created
- [x] Deployment verification confirmed
- [x] Commit: 8359d516

### 🔄 PHASE 1: Template Marketplace Real PDF Preview (IN PROGRESS)

**Files to Update:**

1. `prisma/schema.prisma` - Add `previewPdfUrl String?` to UniversalTemplate
2. `src/app/api/templates/[templateId]/generate-preview-pdf/route.ts` - NEW
3. `src/app/(public)/reports/templates/[templateId]/preview/page.tsx` - Update to show PDF
4. Add BuildFingerprint to marketplace pages

**Expected Outcome:**

- Preview page shows real PDF or "Generate Preview" button
- No blank white boxes
- PDF renders in iframe or react-pdf viewer

### 🔄 PHASE 2: Marketplace Navigation Fix (IN PROGRESS)

**Files to Update:**

1. `src/app/(public)/reports/templates/[templateId]/preview/page.tsx` - Add dynamic export
2. Fix "Back to Dashboard" link logic
3. Ensure Clerk context shared properly

**Expected Outcome:**

- "Back to Dashboard" always works
- No auth loop
- No trap in public shell

### 🔄 PHASE 3: Vendors Network De-Mock (READY TO EXECUTE)

**Files to Fix:**

1. `src/app/(app)/vendors/page.tsx` - Remove mock data, use API
2. `src/app/api/vendors/route.ts` - Ensure returns real data
3. `src/app/api/vendors/search/route.ts` - Implement search
4. Add empty state component

**Mock Data Locations:**

- NO MOCK DATA FOUND (good!)
- Vendors are already API-driven ✅

### 🔄 PHASE 4: Trades Network De-Mock (READY TO EXECUTE)

**Files to Fix:**

1. `src/app/(app)/trades-hub/page.tsx` - REMOVE ALL MOCK ARRAYS
   - Line 53-95: socialFeed mock data
   - Line 113-190: tradePartners mock data
   - Replace with API calls or empty states

2. `src/app/api/trades/feed/route.ts` - NEW (or use existing)
3. `src/app/api/trades/partners/route.ts` - NEW (or use existing)

**Expected Outcome:**

- NO hardcoded companies
- Real data from TradesProfile table or empty state
- Search works

### 🔄 PHASE 5: Contacts Page De-Mock (READY TO EXECUTE)

**Files to Fix:**

1. `src/app/(app)/contacts/page.tsx` - REMOVE mock contacts (lines 194-210)
2. Replace with API call to real contacts
3. Add empty state

### 🔄 PHASE 6: Map View De-Mock (READY TO EXECUTE)

**Files to Fix:**

1. `src/app/(app)/maps/map-view/page.tsx` - REMOVE mock vendors (line 54)
2. Fetch real vendors with coordinates
3. Show empty state if none

### 🔄 PHASE 7: Clients Network Unify (READY TO EXECUTE)

**Current State:**

- `/client-contacts` - Raven UI (good)
- `/clients` - Old UI (bad)

**Action:**

- Move Raven UI to `/clients` canonical route
- Add search functionality
- Remove duplicate from sidebar
- Delete old clients page

### 🔄 PHASE 8: Verification + Deploy

**Steps:**

1. Run `pnpm lint`
2. Run `pnpm build`
3. Run verification scripts
4. Commit all fixes
5. Push to main
6. Deploy: `vercel --prod`
7. Verify using build fingerprint

---

## EXECUTION STRATEGY

Given the comprehensive nature, I'll execute in batches:

**Batch 1: De-Mock UI Pages (Phases 4-6)**

- Systematic removal of all mock data arrays
- Replace with API calls or empty states
- Single commit

**Batch 2: Marketplace Fixes (Phases 1-2)**

- Add PDF preview generation
- Fix navigation
- Add build fingerprint
- Single commit

**Batch 3: Clients Unify (Phase 7)**

- Move Raven UI
- Add search
- Clean up duplicates
- Single commit

**Batch 4: Final Verification + Deploy (Phase 8)**

- All checks
- Deploy
- Verify

---

## MOCK DATA INVENTORY

**Found:**

- ✅ `trades-hub/page.tsx` - 7 instances (Elite Roofing, Pro Restoration, Storm Defense, Apex HVAC)
- ✅ `contacts/page.tsx` - 3 instances (Elite Roofing, Pro Restoration, Storm Defense)
- ✅ `maps/map-view/page.tsx` - 1 instance (Elite Roofing Supply)

**Total Mock Instances to Remove:** 11

**Replacement Strategy:**

- API-driven data where table exists
- Empty states where no data
- Clear CTAs to add data

---

## TIME ESTIMATE

- Batch 1 (De-Mock): 15 minutes
- Batch 2 (Marketplace): 15 minutes
- Batch 3 (Clients): 10 minutes
- Batch 4 (Verify/Deploy): 10 minutes

**Total: ~50 minutes**

---

**Status:** Ready to execute systematic fixes  
**Next Action:** Execute Batch 1 (De-Mock UI Pages)
