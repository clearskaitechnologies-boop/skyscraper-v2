# 🧪 AI ARTIFACTS QUALITY ASSURANCE CHECKLIST

**Phase D - AI Artifacts Persistence**  
**Date:** December 19, 2025

---

## 📋 MANUAL QA CHECKLIST

### 1️⃣ Create Claim

- [ ] Navigate to `/claims` and create a new claim
- [ ] Record claim ID: `____________________`
- [ ] Verify claim appears in list

### 2️⃣ Run AI Estimate

- [ ] Navigate to `/ai` or AI tools section
- [ ] Run AI Estimate tool for the claim created in step 1
- [ ] **Expected**: Artifact is automatically saved to database
- [ ] Verify success message appears
- [ ] Artifact ID: `____________________`

### 3️⃣ View in Reports Tab

- [ ] Navigate to `/claims/[claimId]/reports`
- [ ] Click "AI Artifacts" tab
- [ ] **Expected**: AI Estimate artifact appears in list
- [ ] Verify correct title, type badge, and timestamps
- [ ] Verify status shows "DRAFT"

### 4️⃣ View Artifact Details

- [ ] Click "View" button on artifact
- [ ] **Expected**: Content is readable and well-formatted
- [ ] Verify no raw JSON visible (unless intentional)
- [ ] Verify branding elements if applicable

### 5️⃣ Edit Artifact

- [ ] Click "Edit" button on artifact
- [ ] Make changes to title or content
- [ ] Click "Save"
- [ ] Refresh page
- [ ] **Expected**: Changes persist after refresh
- [ ] Verify "Updated" timestamp changed

### 6️⃣ Export to PDF

- [ ] Click "Export PDF" button on artifact
- [ ] **Expected**: Success message appears
- [ ] **Expected**: Artifact status changes to "FINAL"
- [ ] **Expected**: PDF appears in claim documents
- [ ] Navigate to `/claims/[claimId]/documents`
- [ ] Verify PDF is listed
- [ ] Document ID: `____________________`

### 7️⃣ Download PDF

- [ ] Click download button on PDF document
- [ ] **Expected**: PDF downloads or opens in new tab
- [ ] Verify PDF contains:
  - [ ] Org logo/branding
  - [ ] Claim property address
  - [ ] Artifact title and type
  - [ ] Artifact content formatted cleanly
  - [ ] Timestamp

### 8️⃣ Cross-Org Security Test

- [ ] Log out
- [ ] Log in as different org user
- [ ] Try to access artifact directly via URL: `/api/claims/[claimId]/artifacts/[artifactId]`
- [ ] **Expected**: 403 Forbidden error
- [ ] **Expected**: Cannot see artifact in UI

### 9️⃣ Delete Artifact

- [ ] Log back in as original user
- [ ] Navigate to `/claims/[claimId]/reports` → AI Artifacts tab
- [ ] Click delete button on artifact
- [ ] Confirm deletion
- [ ] **Expected**: Artifact removed from list immediately
- [ ] Refresh page
- [ ] **Expected**: Artifact still deleted (persisted)

### 🔟 Run Multiple AI Tools

- [ ] Run AI Supplement tool
- [ ] Run AI Depreciation tool
- [ ] Run AI Rebuttal tool (if available)
- [ ] Navigate to Reports → AI Artifacts
- [ ] **Expected**: All 3+ artifacts appear in list
- [ ] **Expected**: Each has correct type badge
- [ ] **Expected**: Sorted by creation date (newest first)

---

## ⚠️ KNOWN LIMITATIONS (Phase D)

1. **PDF Generation**: Currently creates document record only. Full PDF generation with org branding will be completed in Phase E.
2. **Artifact View/Edit Pages**: Placeholder routes created. Full rich editor UI coming in Phase D5 (Raven UI pass).
3. **AI Tool Integration**: Must be manually wired in each AI tool endpoint. See Phase D2 implementation notes.

---

## ✅ PASS CRITERIA

Phase D is considered COMPLETE when:

- [ ] All API routes return proper status codes
- [ ] Artifacts save to database automatically when AI tools run
- [ ] Reports tab displays artifacts correctly
- [ ] Edit/delete operations work without errors
- [ ] Export PDF creates document record (even if PDF placeholder)
- [ ] Cross-org access properly denied (403)
- [ ] No console errors during any operation
- [ ] Build completes without errors
- [ ] Prisma validation passes

---

## 🚨 BLOCKER ISSUES

If any of these occur, Phase D is NOT complete:

- ❌ Artifacts don't persist to database
- ❌ Reports tab crashes or shows errors
- ❌ 500 errors on any CRUD operation
- ❌ Cross-org security bypass
- ❌ Build fails
- ❌ Database schema errors

---

## 📝 TESTING NOTES

**Tester Name:** `____________________`  
**Date Tested:** `____________________`  
**Browser:** `____________________`  
**Environment:** `____________________`

### Issues Found:

1. `____________________`
2. `____________________`
3. `____________________`

### Additional Observations:

`____________________`

---

**Phase D Status:** ⬜ PASS | ⬜ FAIL | ⬜ NEEDS WORK
