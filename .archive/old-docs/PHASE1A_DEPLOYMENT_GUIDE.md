# Phase 1A Deployment Guide - Report Builder System

## 🎯 Overview

Phase 1A delivers a complete dual-mode report builder system with autosave, resume drafts, and PDF export capabilities.

### Features Delivered

- ✅ **Retail Wizard** (8 steps): Client info, materials, financing, photos, signature
- ✅ **Claims Wizard** (11 steps): Carrier info, damage assessment, roof details, settlement, recommendations
- ✅ **Autosave System**: 2-second debounce, automatic draft creation, beforeunload protection
- ✅ **Resume Drafts**: Banner notification, one-click resume, start fresh option
- ✅ **Hybrid PDF Export**: LibreOffice headless → pdf-lib fallback
- ✅ **List Views**: Projects list (retail), Reports list (claims)
- ✅ **Navigation**: Top nav dropdowns for Generate & Reports menus

---

## 📋 Pre-Deployment Checklist

### 1. Database Migrations

Run these migrations on your **production** Supabase instance:

```bash
# Connect to your production Supabase database
psql "$PRODUCTION_DATABASE_URL"

# Run retail migration
\i db/migrations/2025-11-Phase1A-retail.sql

# Run claims migration
\i db/migrations/2025-11-Phase1A-claims.sql

# Verify tables exist
\dt retail_packets
\dt claim_reports
```

**Expected Output:**

```
CREATE TABLE
CREATE FUNCTION
CREATE TRIGGER
CREATE INDEX
CREATE INDEX
```

### 2. Environment Variables

Add these to your Vercel environment variables:

```bash
# Feature Flags (set to true in production)
FEATURE_RETAIL_WIZARD=true
FEATURE_CLAIMS_WIZARD=true
FEATURE_AUTOSAVE=true
FEATURE_PDF_EXPORT=true

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Auth (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Site URLs (production)
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### 3. Dependencies Check

Ensure all npm dependencies are installed:

```bash
# Check that pdf-lib is installed
npm list pdf-lib
# Expected: pdf-lib@1.17.1 or similar

# If not installed:
npm install pdf-lib@^1.17.1
```

### 4. Build Test

Run a production build locally:

```bash
npm run build
```

**Expected:** No TypeScript errors, successful build

---

## 🚀 Deployment Steps

### Step 1: Merge to Main Branch

```bash
# From feat/report-builder-v1 branch
git checkout main
git pull origin main
git merge feat/report-builder-v1
git push origin main
```

### Step 2: Deploy to Vercel

Vercel will auto-deploy on push to `main`. Monitor the build:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Watch the deployment progress
3. Check for any build errors

**Or deploy manually:**

```bash
vercel --prod
```

### Step 3: Run Database Migrations

```bash
# SSH into production or use Supabase SQL Editor

# Retail migration
\i db/migrations/2025-11-Phase1A-retail.sql

# Claims migration
\i db/migrations/2025-11-Phase1A-claims.sql
```

### Step 4: Enable Feature Flags

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Set these to `true`:
   - `FEATURE_RETAIL_WIZARD`
   - `FEATURE_CLAIMS_WIZARD`
   - `FEATURE_AUTOSAVE`
   - `FEATURE_PDF_EXPORT`
3. Redeploy to apply

---

## 🧪 Smoke Testing

### Test 1: Retail Wizard Flow

1. Navigate to `/retail/generate`
2. Fill in Step 1 (Client & Property)
   - ✅ Should auto-create draft
   - ✅ Should see "Saving..." indicator
3. Click Next → Next → Next
   - ✅ Should autosave each step
4. Refresh page
   - ✅ Should see "Resume Draft" banner
5. Click "Resume Draft"
   - ✅ Should restore data and jump to last step
6. Complete all 8 steps
7. Click "Download PDF"
   - ✅ Should download `retail-packet-{id}.pdf`

### Test 2: Claims Wizard Flow

1. Navigate to `/claims/generate`
2. Fill in Step 1 (Carrier name + Claim number)
   - ✅ Should show StartDraftGate modal
3. Click "Create Draft"
   - ✅ Modal closes, autosave enabled
4. Fill in Step 2, Next to Step 3
   - ✅ Should autosave
5. Refresh page
   - ✅ Should see "Resume Draft" banner
6. Click "Resume Draft"
   - ✅ Should restore all data
7. Complete all 11 steps
8. Click "Download PDF"
   - ✅ Should download `claims-report-{id}.pdf`

### Test 3: List Views

1. Navigate to `/retail/projects`
   - ✅ Should see all retail packets
   - ✅ Should show current step, updated time
   - ✅ "Resume" button should work
2. Navigate to `/claims/reports`
   - ✅ Should see all claims reports
   - ✅ "Resume" button should work

### Test 4: Navigation

1. Click "Generate" in top nav
   - ✅ Should show dropdown: Retail Packet | Claims Report
2. Click "Reports" in top nav
   - ✅ Should show dropdown: All Reports | Retail Packets | Claims Reports
3. Click each option
   - ✅ Should navigate to correct page

---

## 🐛 Troubleshooting

### Issue: "Table does not exist" errors

**Solution:** Run migrations on production database

```bash
psql "$DATABASE_URL" -f db/migrations/2025-11-Phase1A-retail.sql
psql "$DATABASE_URL" -f db/migrations/2025-11-Phase1A-claims.sql
```

### Issue: Autosave not working

**Check:**

1. Feature flag enabled: `FEATURE_AUTOSAVE=true`
2. User is authenticated (Clerk session)
3. Database table exists
4. Console for API errors

### Issue: PDF export fails

**Check:**

1. Feature flag: `FEATURE_PDF_EXPORT=true`
2. pdf-lib installed: `npm list pdf-lib`
3. Console errors (likely LibreOffice missing → should fall back to pdf-lib)

### Issue: Resume draft not showing

**Check:**

1. Drafted packet exists in database
2. User ID matches (Clerk auth)
3. `updated_at` is recent

### Issue: Navigation dropdowns missing

**Solution:** Clear cache, hard refresh (Cmd+Shift+R)

---

## 📊 Monitoring & Analytics

### Key Metrics to Watch

1. **Packet Creation Rate**

   ```sql
   SELECT COUNT(*) FROM retail_packets WHERE created_at > NOW() - INTERVAL '24 hours';
   SELECT COUNT(*) FROM claim_reports WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

2. **Autosave Success Rate**

   ```sql
   -- Check for packets with data
   SELECT COUNT(*) FROM retail_packets WHERE data::text != '{}';
   ```

3. **Resume Draft Usage**
   ```sql
   -- Packets updated more than once (resumed)
   SELECT COUNT(*) FROM retail_packets WHERE created_at != updated_at;
   ```

### Error Monitoring

Watch Vercel logs for:

- `/api/retail/start` errors
- `/api/retail/save` errors
- `/api/claims/start` errors
- `/api/export/pdf` errors

---

## 🔄 Rollback Plan

If critical issues arise:

```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
# Deployments → Previous Deployment → Promote to Production
```

**Disable features immediately:**

```bash
vercel env rm FEATURE_RETAIL_WIZARD production
vercel env rm FEATURE_CLAIMS_WIZARD production
```

---

## ✅ Post-Deployment Validation

### Checklist

- [ ] Retail wizard creates drafts
- [ ] Claims wizard shows StartDraftGate modal
- [ ] Autosave works (check "Saved at..." indicator)
- [ ] Resume draft banner appears
- [ ] PDF export downloads successfully
- [ ] Navigation dropdowns work
- [ ] List pages show data
- [ ] No console errors
- [ ] Database tables populated

### User Acceptance Testing

1. Ask 2-3 beta users to test
2. Have them create one retail packet
3. Have them create one claims report
4. Collect feedback on:
   - Autosave responsiveness
   - PDF quality
   - Resume draft UX
   - Navigation clarity

---

## 📝 Known Limitations

### Phase 1A Constraints

1. **Photo Upload**: Placeholder UI only (Phase 2: Firebase Storage)
2. **E-Signature**: Placeholder UI only (Phase 2: DocuSign integration)
3. **LibreOffice**: Not available on Vercel → falls back to pdf-lib (basic PDF)
4. **Token System**: Mock UI in admin page (Phase 2: Stripe integration)
5. **PDF Templates**: Basic text layout (Phase 2: Professional templates)

### Expected Behavior

- PDFs will be basic text-based (pdf-lib fallback)
- Photo steps show "Phase 2" messaging
- Signature steps use checkbox instead of drawn signature
- Admin token page shows placeholders

---

## 🎉 Success Criteria

Phase 1A is successful if:

✅ Users can create retail packets end-to-end  
✅ Users can create claims reports end-to-end  
✅ Autosave persists data automatically  
✅ Resume draft recovers work in progress  
✅ PDF export generates downloadable files  
✅ Navigation is intuitive and functional  
✅ No critical bugs in production

---

## 📞 Support

If issues arise:

1. Check Vercel logs first
2. Verify database migrations ran
3. Check feature flags are enabled
4. Review troubleshooting section above
5. Rollback if critical

---

## 🚀 Next Phase

**Phase 1B - Polish & Production Hardening** (1-2 weeks):

- Professional PDF templates with branding
- Firebase photo upload integration
- DocuSign e-signature integration
- Stripe token purchase system
- Advanced validation & error handling
- Performance optimization
- Comprehensive testing suite

**Phase 2 - Advanced Features** (3-4 weeks):

- AI-powered damage assessment
- Multi-user collaboration
- Real-time sync
- Mobile app
- Advanced analytics dashboard

---

## 📄 Files Modified

**Commits:**

- `2f3e48d` - Retail Steps 1-4
- `f16e939` - Retail Steps 5-8
- `c6bc221` - Import fixes
- `b0c0262` - Autosave system (retail)
- `60abbc3` - Resume draft (retail)
- `e31b2d0` - Claims infrastructure
- `53d6f8d` - Hybrid PDF export
- `0e9c2d8` - Route pages (projects/reports lists)
- `1c60ba9` - Claims steps 1-11 + navigation

**Total:** ~6,000 lines of code across 50+ files

---

**End of Deployment Guide** 🎯
