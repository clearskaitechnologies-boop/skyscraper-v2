# 🚀 Final Production Activation Guide

**Status**: Ready for Manual Execution  
**Script**: `skaiscrape_cutover.sh` (one-shot production cutover)  
**Time Required**: 15-20 minutes

---

## Pre-Flight Checklist

Before running the cutover script, ensure you have:

- [ ] Vercel CLI logged in (`vercel login`)
- [ ] Vercel project linked (`vercel link`)
- [ ] Upstash account credentials ready (or 2 minutes to create one)
- [ ] Clerk dashboard access
- [ ] Private/Incognito browser window ready for testing

---

## 🎯 STEP 1: Run the One-Shot Cutover Script

```bash
cd /Users/admin/Downloads/preloss-vision-main
./skaiscrape_cutover.sh
```

### What the Script Does

1. **Pulls current production env vars** from Vercel
2. **Prompts for**:
   - Production domain (default: https://skaiscrape.com)
   - Clerk live keys (pk*live*, sk*live*) - **optional, can skip for now**
   - Upstash Redis credentials (REST URL + Token)
   - Pricing values (default: $29.99 / $139.99 / $399.99)
3. **Updates .env.production.local** with all values
4. **Pushes env vars** to Vercel Production environment
5. **Deploys to production** (`vercel deploy --prod --force`)
6. **Runs health checks** on /api/health/live and /api/health/ready
7. **Tests rate limiting** with 15 rapid requests (expect 429s if Upstash configured)
8. **Displays Clerk redirect URLs** you need to configure

### Interactive Prompts

When script asks for:

**Domain**: Just press Enter (uses https://skaiscrape.com)

**Clerk keys**:

- **If you have pk_live/sk_live**: Paste them
- **If not yet**: Just press Enter (keeps current dev keys, you can re-run later)

**Upstash Redis**:

- **If you have it**: Paste REST URL and Token
- **If you don't**:
  1. Open https://console.upstash.com/
  2. Click "Create Database"
  3. Name: `preloss-vision-prod`
  4. Region: `us-east-1` (or closest to users)
  5. Type: Regional (free tier)
  6. Copy "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"
  7. Paste into script prompts

**Pricing**: Just press Enter to keep current values

---

## 🎯 STEP 2: Create Clerk Production Instance

**Only if you didn't enter live keys in Step 1**

1. Go to **Clerk Dashboard**
2. Click the **Development** badge (top-right)
3. Select **Create Production Instance**
4. Choose **Clone Development**
5. Wait for clone to complete (~30 seconds)

**Configure Production Instance**:

1. In **Production** instance → **Settings** → **Domains & URLs**
2. Add:
   - Allowed origin: `https://skaiscrape.com`
   - Sign-in URL: `https://skaiscrape.com/sign-in`
   - Sign-up URL: `https://skaiscrape.com/sign-up`
   - After sign-in URL: `https://skaiscrape.com/dashboard`
   - After sign-up URL: `https://skaiscrape.com/dashboard`
3. **Save**

**Get Live Keys**:

1. **Production** → **API Keys**
2. Copy:
   - `pk_live_...` (Publishable Key)
   - `sk_live_...` (Secret Key)

**Update Vercel**:

```bash
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "YOUR_pk_live_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

vercel env rm CLERK_SECRET_KEY production
echo "YOUR_sk_live_KEY" | vercel env add CLERK_SECRET_KEY production

vercel deploy --prod
```

---

## 🎯 STEP 3: Smoke Test in Private Window

Open **Private/Incognito window** and test:

### Test 1: Pricing Page

- Visit: `https://skaiscrape.com/pricing`
- ✅ Should display: **$29.99** / **$139.99** / **$399.99**
- ✅ No errors in browser console

### Test 2: Sign Up Flow

- Visit: `https://skaiscrape.com/sign-up`
- Create new account (use temp email)
- ✅ Email verification code arrives
- ✅ After verification → auto-redirect to `/dashboard`
- ✅ Dashboard page renders (not blank)
- ✅ No "Development Mode" watermark on Clerk UI

### Test 3: Dashboard

- ✅ Plan/tokens UI visible
- ✅ Navigation works
- ✅ No console errors

### Test 4: Rate Limiting

- Open DevTools → Network tab
- Rapidly refresh page 15 times
- ✅ Should see some `429` responses after ~10 requests
- ✅ Response headers include `X-RateLimit-Limit: 10`

---

## 🎯 STEP 4: Enable Vercel Alerts

1. Go to **Vercel Dashboard** → **Project** → **Settings** → **Alerts**
2. Enable:
   - ✅ **Build Failed** → Notify on email
   - ✅ **Function Error Rate** (5xx spike) → Notify on email
   - ✅ **Function Latency Spike** → Notify on email
3. Click **Save**

**Optional**: Add Slack webhook for team notifications

---

## 🎯 STEP 5: Add GitHub Secrets for CI

1. Go to **GitHub** → **Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

| Secret Name                         | Value                   | Notes                  |
| ----------------------------------- | ----------------------- | ---------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...`           | From Clerk Production  |
| `CLERK_SECRET_KEY`                  | `sk_live_...`           | From Clerk Production  |
| `TEST_USER_EMAIL`                   | `test@yourdomain.com`   | Test account email     |
| `TEST_USER_PASSWORD`                | `SecurePassword123!`    | Test account password  |
| `DATABASE_URL`                      | `postgresql://...`      | Production DB URL      |
| `UPSTASH_REDIS_REST_URL`            | `https://...upstash.io` | From Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN`          | `AXX...`                | From Upstash dashboard |

**Verify CI Workflow**:

```bash
# Make a small change to trigger CI
echo "# v1.1.0" >> README.md
git add README.md
git commit -m "test: trigger CI workflow"
git push origin main
```

Then check **GitHub Actions** tab for green ✅

---

## 🎯 STEP 6: Tag v1.1.0 Release

**Only after all tests pass**

```bash
cd /Users/admin/Downloads/preloss-vision-main

git tag -a v1.1.0 -m "Production Hardening & Cutover - v1.1.0

✅ Clerk Production instance with live keys
✅ Upstash Redis rate limiting
✅ Vercel Alerts enabled
✅ CI E2E tests on PR/main
✅ CSP headers with nonce
✅ Secure cookies enforced
✅ Bundle analyzer with budgets
✅ Database migration workflow
✅ Production smoke tests passed

Changes:
- Rate limiting middleware fixed (async/await bug)
- Sentry source maps integration
- Comprehensive monitoring documentation
- Authenticated E2E test suite
- Helper scripts for production cutover

Deployments:
- Production: https://skaiscrape.com
- Health: https://skaiscrape.com/api/health/live

See DEPLOYMENT_HARDENING.md for full details."

git push origin v1.1.0
```

**Create GitHub Release**:

1. Go to https://github.com/BuildingWithDamien/PreLossVision/releases
2. Click **Draft a new release**
3. Choose tag: `v1.1.0`
4. Release title: `v1.1.0 - Production Hardening & Live Cutover`
5. Description:

   ```markdown
   ## 🚀 Production Hardening & Live Cutover

   This release marks the official production launch with enterprise-grade hardening.

   ### ✅ Features

   - **Live Clerk Authentication** with pk_live/sk_live keys
   - **Upstash Redis Rate Limiting** (10 req/min on expensive endpoints)
   - **Sentry Source Maps** for production error tracking
   - **CI/CD E2E Tests** on every PR/push
   - **Vercel Alerts** for build failures and 5xx errors
   - **CSP Headers** with nonce support
   - **Secure Cookies** (HttpOnly, Secure, SameSite=Lax)
   - **Bundle Analyzer** with performance budgets
   - **Database Migration Workflow** with auto-backup

   ### 📊 Performance

   - Marketing pages: 90.8 KB (under 220 KB budget)
   - Dashboard: 101-146 KB (under 300 KB budget)
   - All routes passing Core Web Vitals targets

   ### 🔒 Security

   - Content Security Policy enforced
   - Rate limiting on /api/generate-pdf and /api/ai/\*
   - Secure cookie flags on all authenticated routes

   ### 📝 Documentation

   - DEPLOYMENT_HARDENING.md - Full deployment guide
   - PRODUCTION_CUTOVER.md - Step-by-step cutover instructions
   - SHAKEDOWN_REPORT.md - Production verification results
   - QUICK_REFERENCE.md - One-page cheat sheet

   **Production URL**: https://skaiscrape.com  
   **Health Check**: https://skaiscrape.com/api/health/live
   ```

6. Click **Publish release**

---

## 🎯 STEP 7: Final Verification

Run this comprehensive check:

```bash
cd /Users/admin/Downloads/preloss-vision-main

echo "🔍 Final Production Verification"
echo "================================="
echo

echo "1️⃣ Health Endpoints:"
curl -s https://skaiscrape.com/api/health/live | python3 -m json.tool
echo

echo "2️⃣ CSP Headers:"
curl -sI https://skaiscrape.com/ | grep -i content-security-policy
echo

echo "3️⃣ Rate Limiting Test:"
for i in {1..15}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" https://skaiscrape.com/api/health/live)
  echo "Request $i -> $code"
  sleep 0.5
done
echo

echo "4️⃣ Git Status:"
git log --oneline -5
git tag -l "v1.*"
echo

echo "5️⃣ Vercel Env Vars:"
vercel env ls production | grep -E "CLERK|UPSTASH|PRICE"
echo

echo "✅ Verification Complete"
```

---

## 🚨 Troubleshooting

### Issue: Dashboard Blank After Sign-In

**Cause**: Clerk redirect URLs not configured

**Fix**:

1. Clerk → Production → Settings → Domains & URLs
2. Verify all URLs match exactly:
   - After sign-in: `https://skaiscrape.com/dashboard`
   - After sign-up: `https://skaiscrape.com/dashboard`
3. Save and test again

### Issue: Rate Limiting Returns All 200s (No 429s)

**Cause**: Upstash credentials not set

**Fix**:

```bash
# Verify Upstash vars exist
vercel env ls production | grep UPSTASH

# If missing, add them
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# Redeploy
vercel deploy --prod
```

### Issue: Clerk Shows "Upgrade Plan" Modal

**Cause**: Production instance trying to use Pro features

**Fix**:

1. Clerk → Production → Settings
2. Disable:
   - Multi-factor authentication
   - Custom roles/permissions
   - Any features marked "Pro"
3. Keep only basic email/password authentication

### Issue: Build Fails with Missing Env Var

**Cause**: Required env var not set in Vercel

**Fix**:

```bash
# Check what's missing in error message
# Then add it
vercel env add MISSING_VAR_NAME production

# Redeploy
vercel deploy --prod
```

---

## ✅ Success Criteria

You're done when all these are ✅:

- [ ] `./skaiscrape_cutover.sh` runs without errors
- [ ] Upstash Redis configured (429s appear in rate limit test)
- [ ] Clerk Production instance created
- [ ] Live keys (pk_live/sk_live) set in Vercel
- [ ] Production deployed successfully
- [ ] Smoke test passes (pricing, sign-up, dashboard)
- [ ] Vercel Alerts enabled (3 alerts)
- [ ] GitHub secrets added (7 secrets)
- [ ] CI workflow runs and passes
- [ ] v1.1.0 tag created and pushed
- [ ] GitHub release published

---

## 🎉 Post-Launch

**Monitor for 24 hours**:

- Check Vercel Analytics for traffic
- Monitor Sentry for errors
- Verify Vercel Alerts are working
- Test rate limiting with real usage

**Week 1 Tasks**:

- Set up external uptime monitoring (UptimeRobot)
- Add status page with health checks
- Enable Sentry Performance Monitoring
- Review bundle analyzer for optimization opportunities

**Next Sprint**:

- Implement database backup automation
- Add Lighthouse CI budget enforcement
- Create custom Sentry dashboards
- Plan feature flag system

---

**Script Location**: `./skaiscrape_cutover.sh`  
**Documentation**: See PRODUCTION_CUTOVER.md for detailed instructions  
**Support**: All issues documented in SHAKEDOWN_REPORT.md

**Ready to launch!** 🚀
