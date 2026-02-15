# 🚀 Production Deployment Checklist — Phase 2 Merge

## ✅ Pre-Merge Checklist (Complete Locally)

### Step 1: Verify Local Test (5 min)

```bash
# Ensure .env.local has NEXT_PUBLIC_SITE_URL
grep "NEXT_PUBLIC_SITE_URL" .env.local
# Should show: NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Start dev server
pnpm dev

# Test in browser
# Visit: http://localhost:3000/test-retail-packet
# Click: "Generate Test Packet with Photos"
# Verify: DOCX downloads and renders 4 photos @ 400×300px in Word/Google Docs
```

**Expected Result**: ✅ DOCX with 4 embedded photos, no Word warnings

### Step 2: Push Branch (if not already pushed)

```bash
git checkout feat/report-builder-v1
git status  # Should show "nothing to commit, working tree clean"
git push origin feat/report-builder-v1
```

**Expected Result**: ✅ Branch pushed to GitHub

---

## 📋 Create Pull Request

### Step 3: Open PR on GitHub (2 min)

Visit: `https://github.com/BuildingWithDamien/PreLossVision/compare/main...feat/report-builder-v1`

**Title:**

```
Phase 2: Report Builder Scaffolding + Image Export Enhancements
```

**Description:** (Copy/paste from PR_PHASE2_SCAFFOLDING.md or use below)

```markdown
## 🎯 What's Included

### Phase 2 Scaffolding

- ✅ 10-table PostgreSQL schema + types + triggers
- ✅ Core UI components (SidebarNav, AIActionsBar, SectionList)
- ✅ 6 AI action stubs with full type signatures
- ✅ Demo page: /report-builder-demo (admin-only)

### Phase 1 Enhancements

- ✅ DOCX image embedding via binary fetch → Buffer → ImageRun
- ✅ Node runtime API: /api/generate-test-docx
- ✅ Test page: /test-retail-packet with comprehensive guide
- ✅ PDF export foundation (route stub + implementation plan)
- ✅ Admin feature-flag middleware

## 🧪 Verification Steps

1. Local test passed: ✅ `/test-retail-packet` generates DOCX with 4 photos
2. TypeScript compilation clean: ✅ No errors
3. Server logs clean: ✅ No runtime errors
4. Documentation complete: ✅ DOCX_PHOTO_TEST_GUIDE.md

## 📊 Changes Summary

- **Files changed**: 15 (11 new, 4 modified)
- **Lines added**: ~2,100
- **Breaking changes**: None
- **New dependencies**: None

## 🔒 Security Notes

- Test routes protected by admin role check
- Feature flag: `NEXT_PUBLIC_REPORT_BUILDER_ENABLED`
- Clerk metadata role validation

## 🚀 Next Steps (After Merge)

1. Run database migration: `db/migrations/20251104_report_builder_schema.sql`
2. Set Vercel env vars (Production/Preview/Development)
3. Grant admin role in Clerk Dashboard
4. Smoke test production: `/test-retail-packet`

## 📝 Follow-up PRs

- [ ] Implement PDF export (LibreOffice converter)
- [ ] Wire Supabase Storage (replace Unsplash)
- [ ] Phase 2.1: PhotoTray + AI auto-captions
```

**Labels**: `enhancement`, `documentation`, `ready-for-review`

**Reviewers**: (Assign yourself or team members)

---

## ⚙️ Vercel Environment Variables Setup

### Step 4: Configure Vercel (CRITICAL — 5 min)

Visit: `https://vercel.com/BuildingWithDamien/preloss-vision/settings/environment-variables`

#### Production Environment

```bash
NEXT_PUBLIC_SITE_URL=https://skaiscrape.com
NEXT_PUBLIC_APP_URL=https://skaiscrape.com
NEXT_PUBLIC_REPORT_BUILDER_ENABLED=true
```

#### Preview Environment

```bash
NEXT_PUBLIC_SITE_URL=https://your-vercel-preview.vercel.app
NEXT_PUBLIC_APP_URL=https://your-vercel-preview.vercel.app
NEXT_PUBLIC_REPORT_BUILDER_ENABLED=true
```

#### Development Environment

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_REPORT_BUILDER_ENABLED=true
```

**Notes:**

- `NEXT_PUBLIC_SITE_URL` is required by validator (now dev/preview-safe)
- `NEXT_PUBLIC_APP_URL` defaults to SITE_URL if not set
- `NEXT_PUBLIC_REPORT_BUILDER_ENABLED` gates demo routes

---

## 🔀 Merge & Deploy

### Step 5: Merge PR (1 min)

After review approval:

1. Click **"Squash and merge"** on GitHub PR
2. Confirm merge commit message
3. Delete `feat/report-builder-v1` branch

**Expected Result**: ✅ Merged to `main` branch

### Step 6: Monitor Deployment (2 min)

Vercel will auto-deploy after merge:

1. Visit: `https://vercel.com/BuildingWithDamien/preloss-vision/deployments`
2. Wait for deployment to complete (~2-3 min)
3. Check for build errors (should be none)

**If deployment fails:**

```bash
# Check build logs in Vercel dashboard
# Most common issue: missing env vars

# Fix: Add missing vars in Vercel settings
# Then trigger redeploy
```

---

## 🧪 Production Smoke Test

### Step 7: Verify Production (5 min)

#### Test 1: Environment Health

```bash
# Visit production site
https://skaiscrape.com

# Check for console errors (none expected)
# Verify app loads normally
```

#### Test 2: Test Page (Admin-Only)

```bash
# Visit test route
https://skaiscrape.com/test-retail-packet

# Expected behavior:
# - If not admin: 403 Forbidden (correct!)
# - If admin: Test page loads
```

#### Test 3: DOCX Generation (Admin-Only)

```bash
# As admin user:
# 1. Visit /test-retail-packet
# 2. Click "Generate Test Packet with Photos"
# 3. Download DOCX
# 4. Open in Word/Google Docs
# 5. Verify 4 photos render @ 400×300px
```

**Expected Result**: ✅ All tests pass

#### Test 4: Check Logs

```bash
# Vercel Dashboard → Logs
# Filter by: Last 1 hour
# Look for:
# - [env] Profile: production
# - [CLAIM_PACKET] Generating retail packet
# - [TEST_DOCX] Generation successful

# Should NOT see:
# - ❌ Missing required environment variables
# - [CLAIM_PACKET] Failed to fetch image
```

---

## 🔐 Post-Deployment Security

### Step 8: Admin Role Setup (2 min)

Grant admin role to your account:

1. Visit: `https://dashboard.clerk.com/apps/[your-app-id]/users`
2. Select your user
3. Click **"Public Metadata"**
4. Add JSON:

```json
{
  "role": "admin"
}
```

5. Save

**Test:** Refresh `/test-retail-packet` — should load successfully

---

## 🔄 Database Migration (Optional — Phase 2.1)

### Step 9: Apply Schema (When Ready for Full Report Builder)

```bash
# Connect to production database
psql "$DATABASE_URL" -f db/migrations/20251104_report_builder_schema.sql

# Expected output:
# CREATE TABLE projects
# CREATE TABLE photos
# CREATE TABLE reports
# ... (10 tables total)
# CREATE TRIGGER
```

**Note:** Migration is optional for Phase 2 merge. Only required when enabling full Report Builder UI.

---

## 📊 Rollback Plan (If Needed)

### Emergency Rollback (< 5 min)

If production breaks:

#### Option A: Revert PR on GitHub

```bash
# Visit merged PR
# Click "Revert"
# Confirm revert
# Vercel auto-deploys previous stable commit
```

#### Option B: Disable Feature Flags

```bash
# Vercel → Environment Variables
# Set: NEXT_PUBLIC_REPORT_BUILDER_ENABLED=false
# Click "Redeploy" button
```

#### Option C: Manual Rollback

```bash
git checkout main
git revert HEAD
git push origin main
```

---

## ✅ Success Criteria

### Required (Before Marking Complete)

- [ ] Local test passed (DOCX with 4 photos)
- [ ] PR created and merged to main
- [ ] Vercel env vars set (Production/Preview/Dev)
- [ ] Production deployment successful
- [ ] Production smoke test passed
- [ ] Admin role granted in Clerk
- [ ] No errors in Vercel logs

### Optional (Phase 2.1)

- [ ] Database migration applied
- [ ] Supabase Storage configured
- [ ] Real customer photos tested
- [ ] PDF export implemented

---

## 🎯 Next Phase Roadmap

### Phase 2.1 (Weeks 1-2)

- [ ] PhotoTray component (upload, grid, filters)
- [ ] Supabase Storage integration
- [ ] AI auto-captioning (OpenAI Vision)

### Phase 2.2 (Weeks 3-4)

- [ ] Report persistence (PostgreSQL)
- [ ] SectionEditor (inline markdown/rich-text)
- [ ] PDF export (LibreOffice converter)

### Phase 2.3 (Week 5)

- [ ] Mobile responsive design
- [ ] E2E tests (Playwright)
- [ ] User acceptance testing

---

## 📚 References

- **PR Description**: `PR_PHASE2_SCAFFOLDING.md`
- **Test Guide**: `DOCX_PHOTO_TEST_GUIDE.md`
- **Deployment Summary**: `DEPLOYMENT_SUMMARY_PHASE1_PHASE2.md`
- **Migration SQL**: `db/migrations/20251104_report_builder_schema.sql`

---

## 🚨 Troubleshooting

### Issue: Build fails with "Missing required environment variables"

**Solution:**

```bash
# Vercel → Settings → Environment Variables
# Add: NEXT_PUBLIC_SITE_URL
# Production: https://skaiscrape.com
# Preview: https://your-preview.vercel.app
# Development: http://localhost:3000
# Click "Redeploy"
```

### Issue: 403 Forbidden on /test-retail-packet

**Solution:**

```bash
# Clerk Dashboard → Users → Your User
# Public Metadata → Add: { "role": "admin" }
# Refresh page
```

### Issue: Images show as empty boxes in DOCX

**Solution:**

```bash
# Check server logs for fetch errors
# Unsplash may block requests
# Fix: Use local images or Supabase Storage
# See DOCX_PHOTO_TEST_GUIDE.md § Troubleshooting
```

### Issue: "Failed to collect page data for /\_not-found"

**Solution:**

```bash
# This means validator threw during build
# Check: validateEnv.ts runs server-side only
# Ensure: No client components import validator
# Fix: Move validator import to layout.tsx (server component)
```

---

**Status**: 🟢 Ready for production deployment  
**Last Updated**: November 4, 2025  
**Current Branch**: feat/report-builder-v1 (commit 53781e3)  
**Target Branch**: main
