# ✅ POST-LAUNCH 24-HOUR CHECK

**Purpose**: Verify production is healthy in the first 24 hours after v1.0.0 launch  
**When to Run**: Immediately after launch, then again at 12 hours, and 24 hours  
**Owner**: Platform Owner

---

## ⏱️ IMMEDIATE (First 10 Minutes After Launch)

### 1. Smoke Test

```bash
cd /Users/admin/Downloads/preloss-vision-main
./scripts/smoke-prod.sh
```

**Expected**: All endpoints return 200 or 401 (auth required)

**If failures**:

- [ ] Note which endpoint failed
- [ ] Check Vercel deployment status
- [ ] Review deployment logs
- [ ] Consider rollback if critical

---

### 2. Production Verification Dashboard

**URL**: https://skaiscrape.com/settings/production-verification

**Verify**:

- [ ] Environment shows **"production"**
- [ ] Commit SHA matches deployed version
- [ ] Base URL is **https://skaiscrape.com** (canonical domain)
- [ ] All 5 health checks show **GREEN** (✅)
  - [ ] Build Info API
  - [ ] AI Health
  - [ ] Vendors API
  - [ ] Claims API
  - [ ] Database Health

**If any checks FAIL**:

- [ ] Click "Re-run Checks" to verify it's not transient
- [ ] Check Vercel logs for errors on that endpoint
- [ ] Verify environment variables in Vercel dashboard
- [ ] Consider enabling maintenance mode if critical

---

### 3. Critical Routes Manual Verification

**Test these URLs directly in browser**:

**Public Routes**:

- [ ] https://skaiscrape.com → Homepage loads
- [ ] https://skaiscrape.com/sign-in → Sign-in page loads
- [ ] https://skaiscrape.com/sign-up → Sign-up page loads (if enabled)
- [ ] https://skaiscrape.com/pricing → Pricing page loads

**Authenticated Routes** (after signing in):

- [ ] https://skaiscrape.com/dashboard → Dashboard loads, Getting Started card appears
- [ ] https://skaiscrape.com/claims → Claims list loads
- [ ] https://skaiscrape.com/clients → Clients list loads
- [ ] https://skaiscrape.com/network → Network page loads
- [ ] https://skaiscrape.com/reports → Reports page loads

**If any route fails**:

- [ ] Check browser console for errors
- [ ] Check Vercel logs for server errors
- [ ] Verify Clerk auth is working
- [ ] Check middleware configuration

---

## 🎯 FIRST HOUR (After Initial Checks Pass)

### 4. Complete Full Golden Path

**Create a real claim from scratch**:

**Step 1: Create Client**

- [ ] Navigate to /clients
- [ ] Click "Add Client"
- [ ] Fill in client details
- [ ] Save client
- [ ] Verify client appears in list

**Step 2: Create Claim**

- [ ] Navigate to /claims/new
- [ ] Select client from dropdown
- [ ] Fill in claim details (address, date of loss)
- [ ] Save claim
- [ ] Verify claim appears in /claims list

**Step 3: Upload Photos**

- [ ] Navigate to claim detail page
- [ ] Go to "Photos" or "Uploads" tab
- [ ] Upload 3 photos (various file types: JPEG, PNG)
- [ ] Verify all 3 upload successfully
- [ ] Verify thumbnails display correctly
- [ ] Click photo → verify full-size preview works

**Step 4: Generate AI Estimate**

- [ ] Navigate to "AI" or "Estimate" tab
- [ ] Click "Generate AI Estimate"
- [ ] Wait for generation (should be <10 seconds)
- [ ] Verify AI artifact appears
- [ ] Verify estimates look reasonable (room-by-room breakdown)
- [ ] Verify no errors in console/logs

**Step 5: Export Branded PDF**

- [ ] Navigate to "Reports" or "Export" tab
- [ ] Click "Export PDF"
- [ ] Verify PDF downloads
- [ ] Open PDF → verify:
  - [ ] Company branding appears (logo, colors)
  - [ ] Claim details correct
  - [ ] AI estimate data present
  - [ ] Photos embedded
  - [ ] Professional formatting

**Step 6: View in Claim Documents**

- [ ] Navigate back to claim detail
- [ ] Go to "Documents" tab
- [ ] Verify exported PDF appears in list
- [ ] Click to preview → verify PDF loads

**If any step fails**:

- [ ] Document exact failure point
- [ ] Check Vercel logs for errors
- [ ] Note if issue is UI or backend
- [ ] Decide: Fix forward or rollback?

---

### 5. Client Portal Verification

**Test client-side access**:

**Step 1: Get Client Portal Link**

- [ ] From claim detail, click "Share with Client" (or equivalent)
- [ ] Copy client portal link

**Step 2: Access as Client** (use incognito/private window)

- [ ] Paste client portal link
- [ ] Verify portal loads
- [ ] Verify claim details visible
- [ ] Verify photos visible
- [ ] Verify status updates visible (if any)
- [ ] Verify client can upload photos (if enabled)

**If client portal fails**:

- [ ] Check if route is protected correctly
- [ ] Verify sharing token generation works
- [ ] Check database for portal permissions
- [ ] Review client portal middleware

---

### 6. Trades/Vendor Onboarding

**If trades/vendor features are live**:

**Step 1: Access Network Page**

- [ ] Navigate to /network
- [ ] Verify trades list loads
- [ ] Verify vendor cards display

**Step 2: Onboard New Vendor** (if applicable)

- [ ] Click "Add Vendor" (or equivalent)
- [ ] Fill in vendor details
- [ ] Invite vendor (if email enabled)
- [ ] Verify vendor added to list

**If trades features fail**:

- [ ] Check if feature flag enabled
- [ ] Verify database schema for vendors/trades
- [ ] Check API endpoints for errors

---

## 📊 12-HOUR CHECK (Midday/Evening)

### 7. Error Log Review

**Vercel Logs Dashboard**:

**Filter 1: All Errors (Last 12 Hours)**

```
level:error
```

**Healthy State**:

- [ ] <10 total errors in 12 hours
- [ ] No repeated patterns (same error many times)
- [ ] Errors are isolated user issues (e.g., invalid input)

**Unhealthy State**:

- [ ] > 50 errors in 12 hours
- [ ] Same error repeated >10 times
- [ ] Database timeout patterns
- [ ] AI endpoint failures

**Filter 2: AI Success Rate**

```
event:"ai_estimate_success" OR event:"ai_estimate_failed"
```

**Calculate**:

- Total AI attempts = success + failed
- Success rate = (success / total) \* 100%

**Expected**: >90% success rate

**If low success rate**:

- [ ] Check OpenAI status: https://status.openai.com
- [ ] Check OpenAI usage dashboard (credits remaining)
- [ ] Review failure reasons in logs

**Filter 3: Upload Health**

```
/api/claims/files/upload OR /api/claims/document/upload
```

**Check**:

- [ ] Upload success rate >95%
- [ ] No CORS errors
- [ ] No "file too large" errors (unless expected)

---

### 8. System Metrics

**Vercel Analytics** (if enabled):

- [ ] Check page load times (<3 seconds average)
- [ ] Check most visited pages
- [ ] Check error rate trends

**Database** (if accessible):

- [ ] Connection pool usage normal (<80%)
- [ ] No slow queries (>5 seconds)
- [ ] Database size within expected range

**Upstash Redis** (console):

- [ ] Command count normal
- [ ] Rate limit hit rate <5%
- [ ] No connection errors

---

## 🌙 24-HOUR CHECK (End of First Day)

### 9. Full Day Error Summary

**Vercel Logs Filter**:

```
level:error
```

**Review Last 24 Hours**:

- [ ] Total error count: **\_** (expected <20)
- [ ] Unique error types: **\_** (document patterns)
- [ ] Top 3 most common errors:
  1. ***
  2. ***
  3. ***

**Action Items**:

- [ ] Create GitHub issues for top 3 errors
- [ ] Prioritize fixes for next deploy
- [ ] Update documentation if errors are expected

---

### 10. User Activity Summary

**Check Dashboard/Analytics**:

- [ ] Total sign-ups (first 24 hours): **\_**
- [ ] Active users (logged in): **\_**
- [ ] Claims created: **\_**
- [ ] AI estimates generated: **\_**
- [ ] PDFs exported: **\_**
- [ ] Photos uploaded: **\_**

**Health Indicators**:

- [ ] > 50% of users created at least one claim ✅
- [ ] > 70% of claims have AI estimate ✅
- [ ] > 50% of claims have exported PDF ✅

---

### 11. Cost Tracking

**Vercel Dashboard**:

- [ ] Bandwidth usage (first 24 hours): **\_** GB
- [ ] Serverless function executions: **\_**
- [ ] Projected monthly cost: $**\_**

**OpenAI Dashboard**:

- [ ] API calls (first 24 hours): **\_**
- [ ] Total tokens used: **\_**
- [ ] Projected monthly cost: $**\_**

**Vercel Blob**:

- [ ] Storage used: **\_** MB/GB
- [ ] Bandwidth: **\_** GB
- [ ] Projected monthly cost: $**\_**

**Action Items**:

- [ ] Compare costs to budget
- [ ] If over budget, adjust rate limits
- [ ] If under budget, consider loosening rate limits

---

## ✅ FINAL 24-HOUR SIGN-OFF

**All checks complete?**

- [ ] Smoke test passes
- [ ] Production verification all green
- [ ] Golden path works end-to-end
- [ ] Client portal accessible
- [ ] Error count <20 in 24 hours
- [ ] No critical patterns in errors
- [ ] User activity healthy (>50% creating claims)
- [ ] Costs within budget

**If all checked**:
✅ **v1.0.0 STABLE IN PRODUCTION**

**If any unchecked**:

- [ ] Document issues in GitHub
- [ ] Create hotfix branch if critical
- [ ] Consider rollback if multiple critical issues
- [ ] Update stakeholders on status

---

## 🚨 ROLLBACK CRITERIA (IMMEDIATE)

**Roll back if ANY of these occur in first 24 hours**:

1. **Critical Feature Completely Broken**
   - Sign-in broken for >50% of users
   - All AI estimates failing (>90% failure rate)
   - Database connection failures
   - Payment processing broken (if live)

2. **Data Loss or Corruption**
   - Users' claims disappearing
   - Photos not being saved
   - Database integrity issues

3. **Security Vulnerability Discovered**
   - Unauthorized access to data
   - Authentication bypass
   - Data exposure

4. **Cost Runaway**
   - Unexpected $100+ charge in 24 hours
   - AI costs exceeding $500/day
   - Storage costs spiking uncontrollably

**Rollback Procedure**:

```bash
# See OPERATOR_PLAYBOOK.md for full rollback steps
git checkout v1.0.0
pnpm install
npx prisma generate
pnpm build
vercel --prod
```

---

## 📝 POST-CHECK NOTES

**Date**: ******\_\_\_******  
**Time**: ******\_\_\_******  
**Checked By**: ******\_\_\_******

**Summary**:

- Overall Status: ✅ Healthy / ⚠️ Issues / ❌ Critical
- Total Errors (24hr): **\_**
- User Sign-ups: **\_**
- Claims Created: **\_**
- Notable Issues:
  1. ***
  2. ***
  3. ***

**Next Actions**:

- [ ] ***
- [ ] ***
- [ ] ***

---

**Checklist Complete**: ******\_\_\_******  
**Sign-off**: ******\_\_\_******  
**Next Review**: ******\_\_\_******

---

## 🔗 RELATED DOCUMENTATION

- [OPERATOR_PLAYBOOK.md](OPERATOR_PLAYBOOK.md) - Ongoing operations
- [RUNTIME_TOGGLES.md](RUNTIME_TOGGLES.md) - Emergency kill switches
- [VERCEL_LOGS_PLAYBOOK.md](VERCEL_LOGS_PLAYBOOK.md) - Log debugging
- [RELEASE_QA_CHECKLIST.md](RELEASE_QA_CHECKLIST.md) - Pre-launch QA
- [RELEASE_BASELINE.md](RELEASE_BASELINE.md) - v1.0.0 reference

---

**Last Updated**: December 20, 2025  
**Owner**: Platform Owner  
**Status**: ✅ Ready for v1.0.0 launch
