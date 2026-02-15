# Production Shakedown - Quick Action Checklist

**Date**: October 31, 2025  
**Status**: 🟡 In Progress (Hotfix Deployed)

---

## ✅ Completed

- [x] **Deploy verification**: GitHub Actions green, production live
- [x] **Smoke tests (public)**: Homepage, pricing, sign-in all 200 OK
- [x] **CSP headers**: Present with nonce on all routes
- [x] **Bundle analysis**: All routes under budget (90.8 KB marketing shared)
- [x] **Critical bug found**: Rate limiting async/await issue
- [x] **Hotfix deployed**: Commit `3c9ccb1` fixing rate limiting
- [x] **Documentation**: SHAKEDOWN_REPORT.md created

---

## ⏳ In Progress (Auto-Deploying)

**Hotfix Commit**: `3c9ccb1`  
**Status**: GitHub Actions deploying to Vercel  
**ETA**: ~2-3 minutes

**Wait for deployment**, then:

- [ ] Re-test rate limiting with 15 rapid requests to `/api/ai/*` endpoint
- [ ] Verify 429 response after 10 requests
- [ ] Check for `X-RateLimit-Limit` and `X-RateLimit-Window` headers

---

## 🔴 Critical - Test After Hotfix Deploy

### Rate Limiting Verification (5 min)

```bash
# Test with actual rate-limited endpoint (requires auth or use IP-based)
for i in {1..15}; do
  echo "Request $i:"
  curl -s -i "https://skaiscrape.com/api/ai/ping" \
    -H "Content-Type: application/json" \
    | grep -E "HTTP/|X-RateLimit|error" \
    | head -3
  sleep 0.5
done
```

**Expected**:

- Requests 1-10: HTTP 200 (or 401 if auth required)
- Requests 11-15: HTTP 429 with `X-RateLimit-Limit: 10`

**If 429 not triggered**:

- Check Upstash env vars in Vercel (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
- Verify middleware is deployed (check Network tab → Response headers for CSP nonce change)

---

## 🟡 Medium Priority - Today

### 1. Vercel Environment Variables (10 min)

**Go to**: Vercel Dashboard → preloss-vision → Settings → Environment Variables → Production

**Verify Present**:

- [ ] `SENTRY_AUTH_TOKEN` (for source map upload)
- [ ] `UPSTASH_REDIS_REST_URL` (for rate limiting)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (for rate limiting)
- [ ] `DATABASE_URL` (Postgres connection)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (already confirmed)
- [ ] `CLERK_SECRET_KEY` (already confirmed)

**If missing Upstash vars**:

1. Go to https://upstash.com → Create Redis database
2. Copy REST URL and token
3. Add to Vercel → Save
4. Re-deploy (or wait for automatic deploy)

### 2. Enable Vercel Alerts (5 min)

**Go to**: Vercel Dashboard → preloss-vision → Settings → Alerts

**Enable**:

- [ ] Build Failed (notify on build failures)
- [ ] Function Error Surge (> 1% error rate)
- [ ] Elevated Latency (p95 > 2s)

**Notification Channel**: Add Slack webhook or email per `docs/alerts.md`

### 3. Sentry Verification (2 min)

**Option A - Staging** (if available):

```bash
curl https://staging.skaiscrape.com/api/dev/throw
```

**Option B - Local**:

```bash
# In .env.local, set VERCEL_ENV=staging
curl http://localhost:3000/api/dev/throw
```

**Then**: Check sentry.io → Issues → Verify source maps show original TypeScript

---

## 🟢 Low Priority - Tomorrow

### 1. CI Gate for PRs (30 min)

**File**: `.github/workflows/pr-checks.yml`

```yaml
name: PR Checks
on: pull_request

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:e2e
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

### 2. External Uptime Monitoring (15 min)

**Service**: UptimeRobot (free tier)

**Steps**:

1. Sign up at https://uptimerobot.com
2. Add monitor: `https://skaiscrape.com/api/health/live`
3. Interval: 5 minutes
4. Alert contacts: Email/SMS
5. Add to `docs/alerts.md` for team reference

### 3. Manual Authenticated Smoke Test (10 min)

**Requires**: Test user account

**Checklist**:

- [ ] Sign in at https://skaiscrape.com/sign-in
- [ ] Navigate to /dashboard → verify plan/tokens display
- [ ] Navigate to /settings/branding → verify form renders
- [ ] Trigger API call (upload file, generate PDF, etc.)
- [ ] Check Network tab for cookies: HttpOnly, Secure, SameSite=Lax
- [ ] Sign out → verify redirect to homepage

---

## 📊 Launch Readiness (After Hotfix)

| Category         | Pre-Hotfix | Post-Hotfix | Target |
| ---------------- | ---------- | ----------- | ------ |
| Build/Deploy     | 🟢 PASS    | 🟢 PASS     | 🟢     |
| Security Headers | 🟢 PASS    | 🟢 PASS     | 🟢     |
| Rate Limiting    | 🔴 FAIL    | ⏳ TESTING  | 🟢     |
| Observability    | 🟡 PARTIAL | 🟡 PARTIAL  | 🟢     |
| Auth E2E         | 🟡 PARTIAL | 🟡 PARTIAL  | 🟢     |
| Perf Budgets     | 🟢 PASS    | 🟢 PASS     | 🟢     |
| Rollback Plan    | 🟢 READY   | 🟢 READY    | 🟢     |

**Current Score**: 5/7 green (71%)  
**Target Score**: 7/7 green (100%)  
**ETA to Target**: End of day (after alerts + env vars verified)

---

## 🏷️ Release Tag (After All Green)

**When**: All checklist items complete + rate limiting verified

**Command**:

```bash
git tag -a v1.1.0 -m "Production Hardening Release

- Sentry source maps integration
- Comprehensive alerts documentation
- Authenticated E2E test suite
- Database migrations workflow with auto-backup
- Bundle analyzer with performance budgets
- CSP headers with nonce support
- Secure cookies enforcement
- Redis-based rate limiting (FIXED in 3c9ccb1)

See DEPLOYMENT_HARDENING.md for full details."

git push origin v1.1.0
```

**GitHub Release**:

1. Go to https://github.com/BuildingWithDamien/PreLossVision/releases
2. Click "Draft a new release"
3. Tag: v1.1.0
4. Title: "v1.1.0 - Production Hardening"
5. Description: Copy from DEPLOYMENT_HARDENING.md summary
6. Attach SHAKEDOWN_REPORT.md as release notes
7. Publish

---

## 🚨 If Something Breaks

**Rollback Options**:

**Option 1 - Revert Hotfix**:

```bash
git revert 3c9ccb1
git push origin main
```

**Option 2 - Revert to v1.0.1**:

```bash
git reset --hard b8676b3
git push --force origin main
```

**Option 3 - Vercel Dashboard**:

1. Go to Vercel → Deployments
2. Find previous deployment (970bcad or b8676b3)
3. Click "Promote to Production"

---

## ⏱️ Time Budget

| Task                       | Estimated  | Priority    |
| -------------------------- | ---------- | ----------- |
| Wait for hotfix deploy     | 3 min      | 🔴 Critical |
| Test rate limiting         | 5 min      | 🔴 Critical |
| Verify env vars            | 10 min     | 🟡 High     |
| Enable Vercel Alerts       | 5 min      | 🟡 High     |
| Sentry verification        | 2 min      | 🟡 Medium   |
| External uptime monitoring | 15 min     | 🟢 Low      |
| Manual auth smoke test     | 10 min     | 🟢 Low      |
| CI gate setup              | 30 min     | 🟢 Low      |
| **Total**                  | **80 min** |             |

**Today's Focus**: Critical + High priority items (25 min)  
**Tomorrow**: Low priority items (55 min)

---

**Next Action**: Wait 3 minutes for deployment, then test rate limiting with 15 rapid requests to `/api/ai/*` endpoint.

**Report Updated**: October 31, 2025 - Post-Hotfix Deploy
