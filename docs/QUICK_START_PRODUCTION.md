# ⚡ QUICK START GUIDE - Production Ready Checklist

**PreLoss Vision / SkaiScraper**  
**Last Updated:** November 17, 2025

---

## 🎯 YOUR MISSION: 4.5 Hours to Production

### ✅ Phase 28.1-31 COMPLETE

- [x] Dominus AI bug/UX sweep with 402/401 handling
- [x] Adjuster packet public page
- [x] Real video access gating
- [x] VIDEO_REAL_ENABLED flag set
- [x] Database migration applied

### 📋 Audit COMPLETE

- [x] System health report generated (85/100 score)
- [x] 15 prioritized fixes documented
- [x] Local test plan created
- [x] Database health check SQL ready

---

## 🔴 CRITICAL FIXES (Do These First - 2.5 Hours)

### 1️⃣ Fix Weather Table Name (30 min)

```bash
# Search and replace weather_reports → weather_results
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/weather_reports/weather_results/g' {} +

# Verify no references remain
grep -r "weather_reports" src/ --include="*.ts" --include="*.tsx"
# Should return: (no results)
```

### 2️⃣ Fix Model Names to Plural (1 hour)

**Manually search and replace:**

- `prisma.lead.` → `prisma.leads.`
- `prisma.claim.` → `prisma.claims.`
- `prisma.property.` → `prisma.properties.`
- `prisma.contact.` → `prisma.contacts.`

**Files likely affected:**

- `src/app/(app)/leads/[id]/page.tsx`
- `src/app/(app)/claims/[claimId]/page.tsx`
- `src/app/api/leads/**/*.ts`
- `src/app/api/claims/**/*.ts`

### 3️⃣ Fix Property Profiles (30 min)

```bash
# Search for camelCase references
grep -rn "propertyProfile" src/ --include="*.ts" --include="*.tsx"
grep -rn "PropertyProfile" src/ --include="*.ts" --include="*.tsx"

# Replace with snake_case
# propertyProfile → property_profiles
```

### 4️⃣ Build Validation (30 min)

```bash
# Regenerate Prisma client
npx prisma generate

# Run build
pnpm run build 2>&1 | tee build-output.log

# Check for errors
grep -i "error" build-output.log

# Fix any errors and repeat until clean
```

---

## ✅ VERIFICATION TESTS (2 Hours)

### Test 1: Database Health (5 min)

```bash
cd /Users/admin/Downloads/preloss-vision-main
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -f db/scripts/health_check.sql
```

**Expected:** All tables show counts, 0 orphaned records

### Test 2: Start Dev Server (2 min)

```bash
pnpm dev
# Should start without errors on http://localhost:3000
```

### Test 3: Auth & Org Setup (10 min)

1. Visit `http://localhost:3000`
2. Sign up with Clerk
3. Create organization "Test Roofing Co"
4. Enable video:

```bash
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "UPDATE \"Org\" SET \"videoEnabled\" = true, \"videoPlanTier\" = 'beta' WHERE \"clerkOrgId\" = 'org_YOUR_ID';"
```

### Test 4: Create Lead (10 min)

1. Go to `/leads`
2. Click "New Lead"
3. Fill in: John Doe, john@example.com, (555) 123-4567, 123 Main St, Austin, TX 78701
4. Save and view detail page

### Test 5: Dominus AI (10 min)

1. From lead detail, click "Run AI Analysis"
2. Verify:
   - Button shows "Analyzing..." during processing
   - AI summary appears
   - If token error: Shows user-friendly "Out of AI tokens" message
   - NO stack traces in UI

### Test 6: Video Report (15 min)

1. From lead detail, locate "Dominus Video AI" panel
2. Check badge shows "REAL VIDEO (BETA)" or mock mode message
3. Click "Generate Script & Storyboard"
4. Review script
5. Click "Generate Video Report"
6. Verify token check happens first

### Test 7: Adjuster Packet (10 min)

1. After video generated, click "Generate Share Link"
2. Copy packet link
3. Open in incognito window
4. Verify:
   - Loads without auth
   - Shows property info, AI summary, video, findings
   - Professional appearance

### Test 8: Create Claim (10 min)

1. Go to `/claims`
2. Click "New Claim"
3. Fill in: TEST-2024-001, Jane Smith, [recent date], State Farm
4. Save and view detail
5. Click through tabs (Overview, Weather, Reports, etc.)

### Test 9: Weather Verification (15 min)

1. Go to `/weather`
2. Click "Quick DOL Analysis"
3. Enter: 123 Main St, Austin, TX 78701
4. Generate weather report
5. Verify data loads (temp, wind, precipitation)

### Test 10: PDF Export (10 min)

1. Go to `/reports`
2. Create new report
3. Select claim and type
4. Generate report
5. Click "Export PDF"
6. Verify PDF downloads and opens correctly

---

## 📊 SUCCESS CRITERIA

### Build & Deploy Ready

- [ ] `pnpm run build` succeeds with 0 errors
- [ ] No TypeScript compilation errors
- [ ] All imports resolve correctly
- [ ] Prisma client generates without warnings

### Core Features Working

- [ ] Can sign up and create org
- [ ] Can create leads
- [ ] Can create claims
- [ ] Dominus AI analysis works
- [ ] Video generation works (or gracefully falls back)
- [ ] Adjuster packet loads publicly
- [ ] Weather verification works
- [ ] Reports generate and export

### Error Handling (Phase 28.1 ✅)

- [ ] 402 token errors show user-friendly messages
- [ ] 401 auth errors handled gracefully
- [ ] No stack traces visible to users
- [ ] Loading states work correctly
- [ ] Buttons disable during operations

### Phase 31 Video Features ✅

- [ ] Badge shows correct video status
- [ ] VIDEO_REAL_ENABLED flag works
- [ ] Org video settings respected
- [ ] Graceful fallback to mock
- [ ] API endpoint returns correct data

---

## 🚨 IF SOMETHING BREAKS

### "Database connection failed"

```bash
# Check DATABASE_URL
grep DATABASE_URL .env

# Test connection
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT 1;"
```

### "Prisma Client not found"

```bash
npx prisma generate
```

### "Type errors in build"

Check `build-output.log` for specific file/line, fix, and re-run `pnpm run build`

### "OpenAI API error"

```bash
# Verify key
grep OPENAI_API_KEY .env

# Test key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### "Weather data not loading"

Check `VISUAL_CROSSING_API_KEY` or `WEATHERSTACK_API_KEY` in .env

### "Video generation fails"

1. Check `VIDEO_REAL_ENABLED=true` in .env
2. Check org: `SELECT "videoEnabled", "videoPlanTier" FROM "Org"`
3. Should gracefully fall back to mock

---

## 📚 DETAILED DOCUMENTATION

**For comprehensive instructions, see:**

- 🏥 **Health Report:** `docs/SYSTEM_HEALTH_REPORT.md`
- 🔧 **Fix Checklist:** `docs/TODO_FIX_CHECKLIST.md` (15 items)
- 🧪 **Test Plan:** `docs/LOCAL_TEST_PLAN.md` (10 tests)
- 📋 **Master TODO:** `docs/COMPREHENSIVE_MASTER_TODO.md`
- 🎉 **Summary:** `docs/COMPREHENSIVE_AUDIT_SUMMARY.md`

---

## ⏱️ TIME BREAKDOWN

| Task                    | Duration      |
| ----------------------- | ------------- |
| Critical Fixes          | 2.5 hours     |
| Testing                 | 2 hours       |
| **TOTAL TO PRODUCTION** | **4.5 hours** |

---

## 🎯 FINAL CHECKLIST

### Pre-Deploy

- [ ] All critical fixes applied
- [ ] Build succeeds (0 errors)
- [ ] Database health check passes
- [ ] Test org created
- [ ] All 10 feature tests pass

### Environment Variables

- [ ] DATABASE_URL set
- [ ] OPENAI_API_KEY set
- [ ] Clerk keys set
- [ ] Supabase keys set
- [ ] Stripe keys set
- [ ] RESEND_API_KEY set
- [ ] VIDEO_REAL_ENABLED=true

### Deployment

- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Run health check on production
- [ ] Test critical flows in production
- [ ] Monitor error logs for 24 hours

---

## 🚀 LAUNCH COMMAND

```bash
# After all fixes and tests pass:
git add .
git commit -m "fix: resolve critical schema mismatches, production ready"
git push origin main

# Deploy via Vercel CLI or GitHub integration
vercel --prod

# Or use the task:
pnpm run build && vercel --prod
```

---

## 🎉 YOU'RE READY!

**Current Status:** 🟢 **85/100** - Production Ready (after fixes)

**Phases Complete:**

- ✅ 28.1: Dominus AI UX polish
- ✅ 30: Adjuster packets
- ✅ 31: Real video gating
- ✅ 0-5: Comprehensive audit

**Next Milestone:** 🚀 **PRODUCTION DEPLOYMENT**

---

**Generated:** November 17, 2025  
**Quick Ref Version:** 1.0  
**Let's ship it! 🚀**
