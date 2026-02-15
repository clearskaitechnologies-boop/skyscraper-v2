# 🔥 PRODUCTION VERIFICATION CHECKLIST

**Created**: December 2024  
**Purpose**: Actual browser testing to verify features work in production  
**Status**: READY FOR TESTING

---

## ✅ CODE VERIFICATION COMPLETE

All code has been verified to exist and be defensive:

### 1. Client Portal Navigation ✅

- **File**: `src/app/(client-portal)/portal/layout.tsx`
- **Line 72**: `<ClientPortalNav />` is rendered in header
- **Component**: `src/components/portal/ClientPortalNav.tsx`
- **Tabs**: 9 tabs defined (My Claims, Community, Shared, Messages, New Request, Find Pro, My Pros, Activity, Profile)
- **Status**: CODE EXISTS ✅

### 2. Claims Overview Editable Fields ✅

- **File**: `src/app/(app)/claims/[claimId]/overview/page.tsx`
- **Lines 206-267**: 9 EditableField components
- **Fields**:
  - insured_name (Client Name)
  - homeowner_email (Email)
  - carrier (Insurance Carrier)
  - policy_number (Policy Number)
  - dateOfLoss (Date of Loss)
  - propertyAddress (Property Address)
  - adjusterName (Adjuster Name)
  - adjusterPhone (Adjuster Phone)
  - adjusterEmail (Adjuster Email)
- **Autosave**: 2s debounce via saveQueueRef
- **Status**: CODE EXISTS ✅

### 3. Documents Tab Error Handling ✅

- **File**: `src/app/(app)/claims/[claimId]/documents/page.tsx`
- **Lines 50-69**: Defensive fetchDocuments with try/catch
- **Error States**:
  - 404 → Shows empty state with "No documents yet"
  - 401/403 → Shows "Permission denied"
  - 500+ → Shows "Server error" with retry button
- **Empty State**: FileText icon + "Generate Documents" button
- **Status**: CODE EXISTS ✅

### 4. Reports Tab Error Handling ✅

- **File**: `src/app/(app)/claims/[claimId]/reports/page.tsx`
- **Lines 50-95**: Defensive fetchReports and fetchArtifacts
- **Error States**:
  - 404 → Empty array returned
  - 401 → "Please sign in"
  - 403 → "Permission denied"
  - 500+ → "Failed to fetch reports"
- **Status**: CODE EXISTS ✅

### 5. Template PDF Preview Rendering ✅

- **File**: `src/app/(public)/reports/templates/[templateId]/preview/page.tsx`
- **Lines 283-290**: `<object>` tag with `<iframe>` fallback
- **Features**:
  - Download button (line 247)
  - Open in New Tab button (line 262)
  - Safari-safe rendering with multiple fallbacks
- **Status**: CODE EXISTS ✅

### 6. Trades Onboarding Flow ✅

- **File**: `src/app/(app)/trades/onboarding/page.tsx`
- **Line 520**: Button text = "Continue to Link Company"
- **Line 198**: Helper text added about personal profile
- **Line 180**: Posts to `/api/trades/onboarding` then navigates to `/trades/onboarding/link-company`
- **Status**: CODE EXISTS ✅

---

## 🧪 BROWSER TESTING REQUIRED

Now test these features **IN YOUR BROWSER** to verify they actually work:

### Test 1: Template Marketplace PDFs

**Goal**: Verify PDFs render in the marketplace preview

**Steps**:

1. Go to https://skaiscrape.com/reports/templates/marketplace
2. Click any template card's "Preview" button
3. Wait for preview page to load
4. **VERIFY**:
   - [ ] PDF preview shows in the iframe (not blank white box)
   - [ ] Download button works
   - [ ] "Open in New Tab" button opens PDF in new tab
   - [ ] PDF content is readable (not corrupt/blank)

**Expected Issues**:

- If blank: Check browser console for CORS errors
- If "Failed to load": Check if previewPdfUrl is valid signed URL
- If blocked: Browser PDF viewer may be disabled

**Screenshot Required**: YES - show PDF rendering in iframe

---

### Test 2: Trades Profile Completion

**Goal**: Verify trades onboarding flow completes without errors

**Steps**:

1. Sign in as a trades user OR create new account
2. Go to https://skaiscrape.com/trades/onboarding
3. Fill out all required fields:
   - Upload professional photo
   - Enter first name, last name, email, phone
   - Select trade type (e.g., "Roofing")
   - Enter job title
   - Write bio
   - Add specialties (e.g., "Asphalt shingles, Metal roofing")
   - Enter years of experience
   - Select looking for options
   - Add work history
4. Click "Continue to Link Company"
5. **VERIFY**:
   - [ ] Button says "Continue to Link Company" (NOT "Continue to Company Setup")
   - [ ] Helper text shows: "You're setting up your personal trades profile..."
   - [ ] No validation errors on submit
   - [ ] Successfully navigates to `/trades/onboarding/link-company`
   - [ ] Profile data is saved (check network tab for 200 response)

**Expected Issues**:

- If stuck: Check network tab for API errors
- If 500 error: Check Vercel logs for stack trace
- If validation fails: Check required field validation

**Screenshot Required**: YES - show link-company page loading

---

### Test 3: Client Portal Navigation

**Goal**: Verify client portal shows full navigation on sign-in

**Steps**:

1. Go to https://skaiscrape.com/client/sign-in
2. Sign in as a client user
3. Should redirect to `/portal/[your-slug]`
4. **VERIFY**:
   - [ ] Top navigation bar shows ALL 9 tabs:
     - My Claims
     - Community
     - Shared
     - Messages
     - New Request
     - Find Pro
     - My Pros
     - Activity
     - Profile
   - [ ] Company logo OR "SkaiScraper Portal" text shows in header
   - [ ] User button (profile icon) shows in top right
   - [ ] Clicking tabs navigates to correct pages
   - [ ] Active tab has blue bottom border

**Expected Issues**:

- If no tabs show: Check if ClientPortalNav is imported in layout
- If 404: Check if client has valid slug in database
- If white screen: Check browser console for React errors

**Screenshot Required**: YES - show full portal with navigation tabs

---

### Test 4: Claims Overview Editable Fields

**Goal**: Verify claim details can be edited and autosaved

**Steps**:

1. Sign in as pro user
2. Go to any claim's Overview tab (e.g., `/claims/[claimId]/overview`)
3. **VERIFY**:
   - [ ] All 9 fields are editable (pencil icon appears on hover):
     - Client Name
     - Email
     - Insurance Carrier
     - Policy Number
     - Date of Loss
     - Property Address
     - Adjuster Name
     - Adjuster Phone
     - Adjuster Email
   - [ ] Click a field to edit
   - [ ] Change the value
   - [ ] Click outside the field
   - [ ] See "Saving..." indicator
   - [ ] See success checkmark after 2 seconds
   - [ ] Refresh page - change should persist

**Expected Issues**:

- If not editable: Check if handleFieldUpdate function exists
- If save fails: Check network tab for API errors
- If doesn't persist: Check database write permissions

**Screenshot Required**: YES - show editing a field with save indicator

---

### Test 5: Documents Tab (No Server Error)

**Goal**: Verify Documents tab loads without "Server error"

**Steps**:

1. Sign in as pro user
2. Go to any claim's Documents tab (e.g., `/claims/[claimId]/documents`)
3. **VERIFY**:
   - [ ] Page loads without error
   - [ ] If no documents: Shows "No documents yet" with FileText icon
   - [ ] If has documents: Shows document list
   - [ ] Upload button works
   - [ ] NO "Server error" message appears
   - [ ] Generate Documents button visible

**Expected Issues**:

- If server error: Check Vercel logs for API failure
- If blank: Check network tab for 500 response
- If permission error: Check user has access to this claim

**Screenshot Required**: YES - show Documents tab loaded (empty or with docs)

---

### Test 6: Reports Tab (No Server Error)

**Goal**: Verify Reports tab loads without "Server error"

**Steps**:

1. Sign in as pro user
2. Go to any claim's Reports tab (e.g., `/claims/[claimId]/reports`)
3. **VERIFY**:
   - [ ] Page loads without error
   - [ ] "Reports" and "AI Artifacts" sub-tabs visible
   - [ ] If no reports: Shows empty state (not error)
   - [ ] If has reports: Shows report list
   - [ ] NO "Server error" message appears
   - [ ] Can switch between Reports/AI Artifacts tabs

**Expected Issues**:

- If server error: Check Vercel logs for API failure
- If blank: Check network tab for 500 response
- If loading forever: Check if fetchReports is stuck

**Screenshot Required**: YES - show Reports tab loaded (empty or with reports)

---

## 📋 TEST RESULTS TEMPLATE

Copy this and fill it out after testing:

```
## TEST RESULTS - [DATE/TIME]

### Test 1: Template PDFs
- Status: ❌ FAIL / ✅ PASS
- Issues: [describe any issues]
- Screenshot: [attach]

### Test 2: Trades Profile
- Status: ❌ FAIL / ✅ PASS
- Issues: [describe any issues]
- Screenshot: [attach]

### Test 3: Client Portal Nav
- Status: ❌ FAIL / ✅ PASS
- Issues: [describe any issues]
- Screenshot: [attach]

### Test 4: Claims Overview Edit
- Status: ❌ FAIL / ✅ PASS
- Issues: [describe any issues]
- Screenshot: [attach]

### Test 5: Documents Tab
- Status: ❌ FAIL / ✅ PASS
- Issues: [describe any issues]
- Screenshot: [attach]

### Test 6: Reports Tab
- Status: ❌ FAIL / ✅ PASS
- Issues: [describe any issues]
- Screenshot: [attach]
```

---

## 🐛 DEBUGGING COMMANDS

If any test fails, run these to debug:

### Check Vercel Production Logs

```bash
vercel logs --prod
```

### Check Database for Template Preview URLs

```bash
psql "$DATABASE_URL" -c "SELECT id, name, slug, \"previewPdfUrl\" FROM templates LIMIT 10;"
```

### Check Client Portal Slugs

```bash
psql "$DATABASE_URL" -c "SELECT id, email, \"publicMetadata\" FROM users WHERE \"publicMetadata\"::text LIKE '%client%' LIMIT 5;"
```

### Test Template Preview API

```bash
curl -s https://skaiscrape.com/api/reports/templates/standard-estimate | jq .
```

### Check Trades API

```bash
curl -X POST https://skaiscrape.com/api/trades/onboarding \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}' | jq .
```

---

## ✅ ACCEPTANCE CRITERIA

All 6 tests must PASS with screenshots to consider production ready:

1. ✅ Template PDFs render in browser iframe
2. ✅ Trades profile completes and navigates to link-company
3. ✅ Client portal shows all 9 navigation tabs
4. ✅ Claims Overview fields are editable with autosave
5. ✅ Documents tab loads without server error
6. ✅ Reports tab loads without server error

**Next Steps After Testing**:

- If all PASS → Mark as production ready
- If any FAIL → Provide screenshots and error details for debugging
