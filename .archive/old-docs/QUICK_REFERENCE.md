# Production Cutover - Quick Reference

**Commit**: `0e0a74a`  
**Status**: 🟡 Ready for Manual Steps  
**Target**: v1.1.0

---

## Current Status ✅

- ✅ **Hotfix deployed**: Rate limiting async bug fixed (commit `3c9ccb1`)
- ✅ **CI workflow added**: `.github/workflows/e2e.yml` for automated E2E tests
- ✅ **Documentation**: PRODUCTION_CUTOVER.md with step-by-step guide
- ✅ **Helper scripts**: production-cutover.sh and setup-upstash.sh
- ✅ **Production live**: https://skaiscrape.com returning 200 OK
- ✅ **CSP headers**: Active with rotating nonce
- ✅ **Pricing configured**: $29.99 / $139.99 / $399.99

---

## Critical Missing Items 🔴

### 1. Upstash Redis (for Rate Limiting)

**Status**: ⚠️ **MISSING** - Rate limiting uses in-memory fallback (not production-safe)

**Quick Setup**:

```bash
./scripts/setup-upstash.sh
```

Or manually:

1. Go to https://upstash.com → Create database
2. Copy REST URL and Token
3. Run:

```bash
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel deploy --prod
```

---

### 2. Clerk Production Instance

**Status**: ⏳ Needs creation (currently using test keys)

**Quick Command**:

```bash
# Get your current CLERK_SECRET_KEY from Vercel
vercel env pull .env.production.local --environment=production

# Load it
source .env.production.local

# Create Production instance
curl -s -X POST "https://api.clerk.com/v1/instances/production_from_dev" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  | tee clerk_prod_create.json
```

Then:

1. Go to Clerk Dashboard → Production → API Keys
2. Copy `pk_live_...` and `sk_live_...`
3. Update Vercel:

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

---

### 3. GitHub Secrets for CI

**Status**: ⏳ E2E workflow exists but needs secrets

**Add these in GitHub → Settings → Secrets**:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk*live*...)
- `CLERK_SECRET_KEY` (sk*live*...)
- `TEST_USER_EMAIL` (test account email)
- `TEST_USER_PASSWORD` (test account password)
- `DATABASE_URL` (production database)

---

### 4. Vercel Alerts

**Status**: ⏳ Not enabled

**Quick Enable**:

1. Vercel Dashboard → Project → Settings → Alerts
2. Enable:
   - Build Failure
   - Function Error Rate (5xx)
   - Function Latency Spike
3. Add notification email

---

## Quick Check Commands

```bash
# Check current config
./scripts/production-cutover.sh

# Test health
curl -s https://skaiscrape.com/api/health/live | python3 -m json.tool

# Check deployment
curl -sI https://skaiscrape.com/ | grep x-vercel

# Test rate limiting (after Upstash setup)
for i in {1..15}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://skaiscrape.com/api/ai/ping" -H "Content-Type: application/json")
  echo "Request $i -> $code"
  sleep 0.5
done
# Expected: 200s then 429 after 10 requests
```

---

## Manual Steps Remaining

Follow **PRODUCTION_CUTOVER.md** for detailed instructions:

1. ⏳ Create Clerk Production instance
2. ⏳ Configure Clerk domains (skaiscrape.com)
3. ⏳ Update Vercel with live Clerk keys
4. 🔴 **CRITICAL**: Set up Upstash Redis
5. ⏳ Redeploy production
6. ⏳ Smoke test (pricing, sign-up, dashboard)
7. ⏳ Enable Vercel Alerts
8. ⏳ Add GitHub secrets
9. ⏳ Verify rate limiting works
10. ⏳ Tag v1.1.0

---

## Priority Order

**Today** (30 minutes):

1. 🔴 Setup Upstash Redis (`./scripts/setup-upstash.sh`)
2. 🟡 Create Clerk Production instance
3. 🟡 Update Vercel with live keys
4. 🟡 Redeploy & smoke test

**Tomorrow** (15 minutes):

1. Enable Vercel Alerts
2. Add GitHub secrets
3. Test rate limiting
4. Tag v1.1.0 release

---

## Help Commands

```bash
# Run full production check
./scripts/production-cutover.sh

# Setup Upstash Redis (interactive)
./scripts/setup-upstash.sh

# View cutover guide
cat PRODUCTION_CUTOVER.md

# View shakedown report
cat SHAKEDOWN_REPORT.md

# Check git log
git log --oneline -5

# Check Vercel env vars
vercel env ls production
```

---

## Rollback (If Needed)

```bash
# Revert to last stable
git revert HEAD
git push origin main

# Or revert to v1.0.1
git reset --hard b8676b3
git push --force origin main

# Or use Vercel Dashboard
# Deployments → Find b8676b3 → Promote to Production
```

---

## Files Reference

| File                            | Purpose                           |
| ------------------------------- | --------------------------------- |
| `PRODUCTION_CUTOVER.md`         | Step-by-step cutover instructions |
| `SHAKEDOWN_REPORT.md`           | Production verification results   |
| `SHAKEDOWN_CHECKLIST.md`        | Quick action checklist            |
| `DEPLOYMENT_HARDENING.md`       | Full deployment documentation     |
| `scripts/production-cutover.sh` | Quick status check                |
| `scripts/setup-upstash.sh`      | Upstash Redis setup helper        |
| `.github/workflows/e2e.yml`     | CI E2E test workflow              |

---

**Next Action**: Run `./scripts/setup-upstash.sh` to fix rate limiting, then follow PRODUCTION_CUTOVER.md steps 1-3.

**Updated**: October 31, 2025 - Commit `0e0a74a`
