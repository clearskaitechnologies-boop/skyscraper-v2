# Production Cutover Checklist

**Date**: October 31, 2025  
**Target**: v1.1.0 Production Release

---

## Step-by-Step Instructions

### ✅ Step 1: Create Clerk Production Instance

Run this command (replace `sk_test_YOUR_DEV_KEY` with your actual dev key):

```bash
export CLERK_SECRET_KEY="sk_test_YOUR_DEV_KEY"

curl -s -X POST "https://api.clerk.com/v1/instances/production_from_dev" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  | tee clerk_prod_create.json
```

**Expected**: JSON response with `"id": "prod_..."`

**If Error**: Paste the JSON output for troubleshooting.

---

### ⏳ Step 2: Configure Clerk Production Domains

1. Go to **Clerk Dashboard** → **Production** → **Settings** → **Domains & URLs**
2. Add these domains:
   - `https://skaiscrape.com`
   - `https://skaiscrape.com/sign-in`
   - `https://skaiscrape.com/sign-up`
   - `https://skaiscrape.com/sso-callback`
3. Click **Save**

---

### ⏳ Step 3: Update Vercel Production Environment Variables

**Get Live Keys from Clerk**:

1. Go to **Clerk Dashboard** → **Production** → **API Keys**
2. Copy:
   - `pk_live_...` (Publishable Key)
   - `sk_live_...` (Secret Key)

**Set in Vercel** (Option A - CLI):

```bash
cd /Users/admin/Downloads/preloss-vision-main

# Add/update production keys
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste pk_live_... when prompted

vercel env rm CLERK_SECRET_KEY production
vercel env add CLERK_SECRET_KEY production
# Paste sk_live_... when prompted
```

**Set in Vercel** (Option B - Dashboard):

1. Go to **Vercel** → **Project** → **Settings** → **Environment Variables**
2. Filter by **Production**
3. Delete any `pk_test_*` or `sk_test_*` entries
4. Add/Update:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...`
   - `CLERK_SECRET_KEY` = `sk_live_...`

**Verify Upstash Keys** (for rate limiting):

```bash
vercel env ls production | grep UPSTASH
```

Should show:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**If missing, add them**:

```bash
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

---

### ⏳ Step 4: Redeploy Production

```bash
cd /Users/admin/Downloads/preloss-vision-main
vercel deploy --prod
```

Wait for deployment to complete (~2-3 minutes).

---

### ⏳ Step 5: Smoke Test (Incognito/Private Window)

Open a **Private/Incognito window** and test:

1. **Pricing Page**:
   - Visit: `https://skaiscrape.com/pricing`
   - ✅ Should show: $29.99 / $139.99 / $399.99

2. **Sign Up Flow**:
   - Visit: `https://skaiscrape.com/sign-up`
   - Complete sign-up with a new test account
   - ✅ Should auto-redirect to `https://skaiscrape.com/dashboard`

3. **Dashboard**:
   - ✅ Page should render (not blank)
   - ✅ Should show plan/tokens UI

**If Dashboard is Blank**:

- Double-check Step 2 (domains set in Clerk Production)
- Double-check Step 3 (correct `pk_live`/`sk_live` keys)
- Check browser console for errors

---

### ⏳ Step 6: Enable Vercel Alerts

1. Go to **Vercel** → **Project** → **Settings** → **Alerts**
2. Enable:
   - ✅ **Build Failure**
   - ✅ **Function Error Rate** (5xx spike)
   - ✅ **Function Latency Spike**
3. Set notification email
4. (Optional) Add Slack webhook later

---

### ⏳ Step 7: Add GitHub Secrets for CI

1. Go to **GitHub** → **Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

| Secret Name                         | Value                        |
| ----------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from Step 3)  |
| `CLERK_SECRET_KEY`                  | `sk_live_...` (from Step 3)  |
| `TEST_USER_EMAIL`                   | Email of a test user account |
| `TEST_USER_PASSWORD`                | Password for test user       |
| `DATABASE_URL`                      | Production database URL      |

**Note**: E2E workflow already created in `.github/workflows/e2e.yml`

---

### ⏳ Step 8: Verify Rate Limiting

Test rate limiting on a protected endpoint:

```bash
# Replace with an actual rate-limited endpoint
ENDPOINT="https://skaiscrape.com/api/ai/chat"

for i in {1..15}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"test": true}')
  echo "Request $i -> HTTP $code"
  sleep 0.5
done
```

**Expected**:

- Requests 1-10: HTTP `200` or `401` (if auth required)
- Requests 11-15: HTTP `429` (Too Many Requests)

**If No 429s**:

1. Verify Upstash env vars are set (Step 3)
2. Check middleware.ts has rate limiting logic
3. Redeploy and retest

---

### ⏳ Step 9: Tag v1.1.0 Release

**After all steps are ✅**:

```bash
cd /Users/admin/Downloads/preloss-vision-main

git tag -a v1.1.0 -m "Production cutover + alerts + CI + rate limit verified

- Clerk Production instance with live keys
- Vercel Alerts enabled (build, 5xx, latency)
- CI E2E tests on PR/main
- Rate limiting verified functional
- CSP headers with nonce
- Secure cookies enforced
- Bundle analyzer with budgets
- Database migration workflow"

git push origin v1.1.0
```

**Create GitHub Release**:

1. Go to https://github.com/BuildingWithDamien/PreLossVision/releases
2. Click **Draft a new release**
3. Choose tag: `v1.1.0`
4. Release title: `v1.1.0 - Production Hardening & Cutover`
5. Description: Copy from DEPLOYMENT_HARDENING.md
6. Publish

---

## Rollback Plan

**If anything breaks**:

```bash
cd /Users/admin/Downloads/preloss-vision-main

# Option 1: Revert last commit
git revert HEAD
git push origin main

# Option 2: Revert to v1.0.1
git reset --hard b8676b3
git push --force origin main

# Option 3: Vercel Dashboard
# Go to Deployments → Find b8676b3 → Promote to Production
```

---

## Quick Status Check

Run this to verify current state:

```bash
# Check latest commit
git log --oneline -3

# Check Vercel env vars
vercel env ls production | grep -E "CLERK|UPSTASH"

# Test health endpoint
curl -s https://skaiscrape.com/api/health/live | python3 -m json.tool

# Check if deployment is live
curl -sI https://skaiscrape.com/ | grep -i "x-vercel"
```

---

## Completion Checklist

- [ ] **Step 1**: Clerk Production instance created via API
- [ ] **Step 2**: Domains/redirects configured in Clerk Production
- [ ] **Step 3**: Vercel Production uses `pk_live`/`sk_live`
- [ ] **Step 4**: Production redeployed successfully
- [ ] **Step 5**: Smoke test passed (pricing, sign-up, dashboard)
- [ ] **Step 6**: Vercel Alerts enabled
- [ ] **Step 7**: GitHub secrets added for CI
- [ ] **Step 8**: Rate limiting returns 429 after threshold
- [ ] **Step 9**: v1.1.0 tag created and pushed

---

**Next Action**: Start with Step 1 (create Clerk Production instance) and work through sequentially.

**Report Issues**: If any step fails, note which step and the error message for immediate troubleshooting.
