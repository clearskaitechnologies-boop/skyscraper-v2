# 🔥 MASTER STABILIZATION TODO - SKAISCRAPER

**Created:** December 25, 2025  
**Status:** IN PROGRESS  
**Goal:** Full system stabilization - Claims Workspace, Templates, PDFs, Client Portal, Navigation

---

## EXECUTION TRACKER

### ✅ PHASE 1 - ERROR BOUNDARIES (COMPLETED)

- [x] Global error boundary exists at `src/app/error.tsx`
- [x] Client portal error boundary exists at `src/app/(client-portal)/error.tsx`
- [x] Both use Sentry logging and provide recovery UI

### 🔄 PHASE 2 - NAVIGATION FIXES (IN PROGRESS)

- [x] ClaimAIColumn buttons use router.push() correctly
- [x] Documents API returns defensive empty arrays
- [ ] Fix pdf-builder window.location.href navigation (2 instances)
- [ ] Fix claims overview window.location.href redirect (1 instance)
- [ ] Fix billing window.location.href navigation (2 instances)
- [ ] Audit all template preview "Return to Dashboard" buttons
- [ ] Replace with useRouter from next/navigation

### ⏳ PHASE 3 - SELECT COMPONENT HARDENING (PENDING)

- [ ] Audit all <Select value={} /> components
- [ ] Fix claims/appeal Select components (2 instances)
- [ ] Fix claims/appeal-builder Select components (2 instances)
- [ ] Add null coalescing: `value={value ?? undefined}`
- [ ] Test all editable fields in Claims Overview
- [ ] Test Supplement builder selects
- [ ] Test Weather verification picker

### ⏳ PHASE 4 - CLAIMS WORKSPACE DATA SAFETY (PENDING)

- [ ] Fix client name rendering to use: `claim.insured_name ?? claim.policyholderName ?? 'Unnamed Client'`
- [ ] Add optional chaining to all property access
- [ ] Fix "Connection Error" false positives in Overview
- [ ] Ensure all APIs return safe defaults
- [ ] Test multiple claims with missing data
- [ ] Verify no data reuse between claims

### ⏳ PHASE 5 - CLIENT PORTAL HARDENING (PENDING)

- [ ] Audit all client portal data access
- [ ] Add null-safe rendering: `claim.client?.name`
- [ ] Add null-safe rendering: `claim.property?.address`
- [ ] Add null-safe rendering: `document.publicUrl ?? null`
- [ ] Test client portal with incomplete claims
- [ ] Test client portal with missing documents
- [ ] Fix expired token handling

### ⏳ PHASE 6 - PDF PREVIEW GENERATION (PENDING)

- [ ] Run: `pnpm exec tsx scripts/generate-missing-template-previews.ts`
- [ ] Verify all marketplace templates have previewPdfUrl
- [ ] Add loading state to template preview page
- [ ] Show "Generating preview..." when previewPdfUrl is null
- [ ] Add on-demand generation if preview missing
- [ ] Test template marketplace preview functionality

### ⏳ PHASE 7 - TEMPLATE PREVIEW UI (PENDING)

- [ ] Replace "Preview Not Available Yet" with loading state
- [ ] Add iframe null guard: `{previewPdfUrl && <iframe src={previewPdfUrl} />}`
- [ ] Add empty state for templates without previews
- [ ] Test template preview navigation
- [ ] Test marketplace preview buttons
- [ ] Verify branding merge works

### ⏳ PHASE 8 - FINAL VERIFICATION (PENDING)

- [ ] Run: `pnpm build`
- [ ] Run: `pnpm lint`
- [ ] Run: `pnpm audit:all`
- [ ] Test Claims Overview loads without errors
- [ ] Test Documents tab shows empty state
- [ ] Test Supplement/Weather buttons navigate correctly
- [ ] Test Client Portal loads without errors
- [ ] Test Template Marketplace previews show
- [ ] No white screens anywhere
- [ ] No red error boxes in production
- [ ] All navigation uses Next.js router

---

## CRITICAL FIXES IDENTIFIED

### 🔴 ROOT CAUSE #1: Navigation Boundary Crossing

**Issue:** Using `window.location.href` crosses App Router layouts  
**Impact:** White screens when navigating from public → app or marketplace → dashboard  
**Files:**

- `src/app/(app)/reports/templates/pdf-builder/page.tsx:374`
- `src/app/(app)/claims/[claimId]/overview/page.tsx:139`
- `src/app/(app)/billing/page.tsx:88,115`
- Template preview "Return to Dashboard" buttons

**Fix:** Replace all with:

```ts
const router = useRouter(); // from 'next/navigation'
router.push("/dashboard");
```

### 🔴 ROOT CAUSE #2: Radix Select Empty Values

**Issue:** Passing `""` or `null` to `<Select value={} />` causes crash  
**Impact:** Red error boxes in Claims Overview, Supplement, Weather  
**Files:**

- `src/app/(app)/claims/appeal/page.tsx:202`
- `src/app/(app)/claims/appeal-builder/ClaimAppealClient.tsx:71,96`
- Any editable field with null values

**Fix:** Add null coalescing:

```tsx
<Select value={value ?? undefined}>
```

### 🔴 ROOT CAUSE #3: Claims Data Inconsistency

**Issue:** UI assumes non-null fields that are actually nullable  
**Impact:** Multiple claims show same client name, "Connection Error" false positives  
**Files:**

- Claims Overview rendering logic
- Client portal claim display
- Property access without optional chaining

**Fix:** Add defensive rendering:

```ts
const clientName = claim.insured_name ?? claim.policyholderName ?? "Unnamed Client";
const address = claim.property?.address ?? "—";
```

### 🟡 ROOT CAUSE #4: PDF Previews Missing

**Issue:** `previewPdfUrl` is NULL for most marketplace templates  
**Impact:** "Preview Not Available Yet" messages, no PDFs show  
**Files:**

- Marketplace templates database records
- Template preview UI

**Fix:**

1. Run preview generation script
2. Add loading state when NULL
3. Queue generation on-demand

### 🟡 ROOT CAUSE #5: Documents Tab Defensive

**Issue:** API might throw for empty results  
**Status:** ✅ ALREADY FIXED in `/api/claims/[claimId]/documents/route.ts:96-99`  
**Verified:** Returns `{ ok: true, documents: [] }` on error

---

## FILE-BY-FILE FIXES NEEDED

### High Priority

1. **src/app/(app)/reports/templates/pdf-builder/page.tsx**
   - Line 374: Replace `window.location.href` with router.push
   - Line 78: Reading search params is OK (not navigation)

2. **src/app/(app)/claims/[claimId]/overview/page.tsx**
   - Line 139: Replace `window.location.href` with router.push
   - Add null-safe client name rendering
   - Test editable fields with null values

3. **src/app/(app)/billing/page.tsx**
   - Lines 88, 115: Replace `window.location.href` with router.push

4. **src/app/(app)/claims/appeal/page.tsx**
   - Line 202: Add `value={appealType || undefined}` to Select

5. **src/app/(app)/claims/appeal-builder/ClaimAppealClient.tsx**
   - Lines 71, 96: Add null coalescing to Select values

6. **src/app/(public)/reports/templates/[templateId]/preview/page.tsx**
   - Add loading state for missing previewPdfUrl
   - Guard iframe rendering
   - Test "Return to Dashboard" button navigation

### Medium Priority

7. **src/app/(client-portal)/portal/[slug]/claims/[claimId]/documents/page.tsx**
   - Already has null-safe rendering (✅)
   - Verify publicUrl access safe

8. **src/components/claims/EditableField.tsx**
   - Already handles null values (✅)
   - Verify no Select crashes

9. **Run Scripts:**
   - `pnpm exec tsx scripts/generate-missing-template-previews.ts`
   - `pnpm audit:all`

---

## VERIFICATION CHECKLIST (RUN AFTER FIXES)

### Claims Workspace

- [ ] Navigate to `/claims/[id]/overview` - no errors
- [ ] Edit client name field - saves correctly
- [ ] Edit insurance carrier - saves correctly
- [ ] Navigate to Documents tab - shows empty state if no docs
- [ ] Click "Generate Supplement" - navigates correctly
- [ ] Click "Weather Verification" - navigates correctly
- [ ] Click "Analyze Documents" - navigates correctly
- [ ] Multiple claims show correct client names

### Templates & PDFs

- [ ] Navigate to `/reports/templates/marketplace` - templates load
- [ ] Click any template preview - PDF shows or "Generating..."
- [ ] Click "Return to Dashboard" - navigates without white screen
- [ ] Add template to company - works
- [ ] Generate PDF with branding - logo/colors appear

### Client Portal

- [ ] Navigate to `/portal/[slug]/claims` - claims list loads
- [ ] Click claim detail - loads without error
- [ ] Navigate to documents - shows empty state if no docs
- [ ] Shared PDF appears when present
- [ ] Expired token shows proper message

### Navigation

- [ ] Dashboard → Templates → Marketplace → Dashboard (no white screen)
- [ ] Claims → Overview → Back to Dashboard (no white screen)
- [ ] Template Preview → Return to Dashboard (no white screen)
- [ ] Billing → Create Checkout → Return (no white screen)

---

## COMMANDS TO RUN

```bash
# Generate missing PDF previews
pnpm exec tsx scripts/generate-missing-template-previews.ts

# Run all audits
pnpm audit:all

# Build check
pnpm build

# Lint check
pnpm lint

# Type check
pnpm exec tsc --noEmit
```

---

## SUCCESS CRITERIA

✅ **Zero white screens** across all navigation paths  
✅ **Zero red error boxes** in Claims Workspace  
✅ **All marketplace templates** show PDF previews  
✅ **All Select components** handle null/empty values  
✅ **Client Portal** loads with incomplete data  
✅ **Documents tab** shows empty state safely  
✅ **Navigation** uses Next.js router exclusively

---

**Last Updated:** December 25, 2025  
**Owner:** Damien  
**Status:** Executing Phase 2-8
