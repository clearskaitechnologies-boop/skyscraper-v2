# 🚀 PHASE 4 — PRODUCTION CUTOVER CHECKLIST

**Status**: ✅ **ALL CODE COMPLETE & BUILD PASSING**  
**Latest Commit**: `6d7d7ba`  
**Branch**: `feat/phase3-banner-and-enterprise`  
**Build**: ✅ `✓ Compiled successfully`  
**Ready**: YES - Execute steps below in order

---

## ✅ PRODUCTION CUTOVER STEPS

### 1️⃣ Set Environment Variables in Vercel → Production 🔴 **BLOCKER**

**Dashboard**: https://vercel.com → PreLossVision → Settings → Environment Variables → Production

**Add/Update These** (use your real keys/IDs):

```bash
# Core
FREE_BETA=true
NEXT_PUBLIC_SITE_URL=https://skaiscrape.com
CRON_SECRET=<make-a-long-random-string>

# Stripe (CRITICAL)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get after webhook setup in Step 3
STRIPE_PRICE_SOLO=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_TOPUP_100=price_...
STRIPE_TOPUP_500=price_...
STRIPE_TOPUP_2000=price_...
STRIPE_BILLING_PORTAL_RETURN_URL=https://skaiscrape.com/account/billing

# Email (NEW - Required)
RESEND_API_KEY=re_...
EMAIL_FROM=SkaiScraper <no-reply@skaiscrape.com>

# Database
DATABASE_URL=postgres://USER:PASS@HOST:5432/postgres?sslmode=require&schema=app
SHADOW_DATABASE_URL=postgres://USER:PASS@HOST:5432/postgres?sslmode=require&schema=shadow

# Supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# AI & Firebase
OPENAI_API_KEY=sk-...
FIREBASE_SERVICE_ACCOUNT_KEY=<json-string>

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**Tip**: If you use `NEXT_PUBLIC_*` price IDs in the UI, mirror them as public env vars too.

**Status**: ⬜ NOT STARTED  
**Time**: 10 minutes

---

### 2️⃣ Deploy to Production

```bash
cd /Users/admin/Downloads/preloss-vision-main
vercel --prod
```

**Expected Output**:

- ✅ Build starts
- ✅ `✓ Compiled successfully`
- ✅ Deployment URL: `https://skaiscrape.com`
- ⚠️ Static page warnings are OK (non-blocking)
- ⚠️ Firebase/OpenAI warnings during build are OK (lazy-loaded)

**Status**: ⬜ NOT STARTED  
**Time**: 3-5 minutes

---

### 3️⃣ Configure Stripe Webhooks (LIVE MODE)

**Stripe Dashboard** → Developers → Webhooks → **Add endpoint**

1. **URL**: `https://skaiscrape.com/api/webhooks/stripe`
2. **Description**: "SkaiScraper Production Webhooks"
3. **Select Events** (4 total):
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
4. **Create endpoint**
5. **Copy Webhook Signing Secret** (whsec\_...)
6. **Add to Vercel**:
   - Go to Vercel → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_...` (Production)
7. **Redeploy**:
   ```bash
   vercel --prod
   ```

**Status**: ⬜ NOT STARTED  
**Time**: 3 minutes

---

### 4️⃣ Kick Cron Once (Verify)

**Test cron endpoint manually**:

```bash
# Replace $CRON_SECRET with actual value from Vercel
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  https://skaiscrape.com/api/cron/trials/sweep | jq .
```

**Expected Response**:

```json
{
  "success": true,
  "results": {
    "markedEnded": 0,
    "sent24h": 0,
    "sent1h": 0,
    "errors": []
  }
}
```

**Verify Hourly Execution**:

- Vercel → Functions → Logs
- Look for `CRON:TRIAL` entries every hour

**Common Issues**:

- `401 Unauthorized`: Check `CRON_SECRET` matches
- `500 Error`: Check Vercel logs for details
- `404 Not Found`: Deployment may not have finished

**Status**: ⬜ NOT STARTED  
**Time**: 1 minute

---

### 5️⃣ Smoke Tests (Production)

#### Test 1: Trial Sign-Up Flow (5 min)

**Action**: Incognito browser → https://skaiscrape.com/pricing → Pick any plan

**Expected**:

- ✅ Stripe checkout opens (or redirects to dashboard if FREE_BETA=true)
- ✅ After signup/payment: lands on `/dashboard?beta=true`
- ✅ Trial banner visible at top (green background)
- ✅ Shows "Trial: 71h 59m 30s" (countdown ticks down)
- ✅ Can access features (Quick DOL, Weather)

**Status**: ⬜ NOT STARTED

---

#### Test 2: Billing Portal (3 min)

**Action**: Navigate to https://skaiscrape.com/account/billing

**Expected**:

- ✅ Trial status card displays
- ✅ Countdown timer matches dashboard banner
- ✅ "Manage Billing" button present
- ✅ Click "Manage Billing" → Stripe portal opens
- ✅ Portal shows plan details
- ✅ Close portal → returns to `/account/billing` (NOT 404)
- ✅ Auto-refill toggle works (on/off persists)

**Status**: ⬜ NOT STARTED

---

#### Test 3: Email Sending (5 min)

**A. Feedback Form**:

1. Navigate to https://skaiscrape.com/feedback
2. Fill out form with test data
3. Submit
4. ✅ Form returns success
5. ✅ Check ops@skaiscrape.com → Email arrives

**B. Trial Reminder Emails** (force via DB):

```sql
-- Force T-24h reminder
UPDATE "Organization"
SET "trialEndsAt" = NOW() + INTERVAL '23 hours',
    "sentTrialT24" = false
WHERE "clerkOrgId" = '<test-org-id>';
```

Then trigger cron:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://skaiscrape.com/api/cron/trials/sweep
```

**Expected**:

- ✅ Vercel logs show "✅ Email sent via Resend"
- ✅ Email arrives at owner's inbox

**C. Check Logs**:

- Vercel → Logs → Filter by `[mail]`
- ✅ See "✅ Email sent via Resend" or "skipping email" (both OK)

**Status**: ⬜ NOT STARTED

---

#### Test 4: Webhook Processing (3 min)

**Action**: Stripe Dashboard → Webhooks → Select production endpoint → Send test webhook

**Events to Test**:

1. **customer.subscription.updated**:
   - ✅ Returns `200 OK`
   - ✅ Vercel logs show "WEBHOOK:STRIPE customer.subscription.updated processed"
   - ✅ Check database: subscription status updated

2. **invoice.payment_failed**:
   - ✅ Returns `200 OK`
   - ✅ Dunning email triggered (check Vercel logs)
   - ✅ Database: subscription status = `past_due`

**Status**: ⬜ NOT STARTED

---

#### Test 5: Token Purchases (3 min)

**Action**:

1. Navigate to https://skaiscrape.com/pricing (or topup page)
2. Click "Buy 100 Tokens"
3. Complete Stripe checkout:
   - **Test Mode**: Card `4242 4242 4242 4242`
   - **Live Mode**: Use real card (small test purchase)

**Expected**:

- ✅ Stripe checkout completes
- ✅ Redirects to success page
- ✅ Check database:
  ```sql
  SELECT "tokenBalance" FROM "Organization" WHERE "clerkOrgId" = '<org-id>';
  ```
  Balance increased by 100
- ✅ Stripe Dashboard → Payments → Shows transaction

**Status**: ⬜ NOT STARTED

---

#### Test 6: Cron Trial Reminders (Optional - Can Test Later)

**Action**: Create test org, set trial to expire soon, verify sweeper marks ended trials

**Commands**:

```sql
-- Force trial to expire in 10 minutes
UPDATE "Organization"
SET "trialEndsAt" = NOW() + INTERVAL '10 minutes'
WHERE "clerkOrgId" = '<test-org-id>';
```

Wait for hourly cron, then:

```sql
-- Verify flags set
SELECT "trialEndsAt", "sentTrialT24", "sentTrialT1", "trialEnded"
FROM "Organization"
WHERE "clerkOrgId" = '<test-org-id>';
```

**Expected**:

- ✅ `sentTrialT1` = true (if < 1h remaining)
- ✅ `sentTrialT24` = true (if < 24h remaining)
- ✅ `trialEnded` = true (if expired)
- ✅ T-1h reminder email sent

**Status**: ⬜ NOT STARTED (can defer to post-launch)

---

### 6️⃣ Monitor & Document

#### Monitor (First 24 Hours)

**Check Every 6 Hours**:

- **Vercel Logs**: Dashboard → Functions → Logs
  - Filter for `[ERROR]` (5xx responses)
  - Filter for `WEBHOOK:STRIPE` (webhook processing)
  - Filter for `CRON:TRIAL` (hourly execution)
  - Filter for `[mail]` (email send attempts)

**Key Metrics**:

- ✅ Cron runs every hour (no skipped runs)
- ✅ No build-time errors
- ✅ Emails send successfully (or log "skipping" if no key)
- ✅ Webhooks return 200 OK
- ✅ No Prisma connection errors

**Stripe Webhooks**:

- Dashboard → Webhooks → Select endpoint
- ✅ All events show green checkmarks
- ❌ Any red X's = investigate in Vercel logs

**Alert Conditions** (Immediate Action Required):

- 🚨 Cron fails 2+ consecutive hours
- 🚨 Webhook returns 500
- 🚨 Database connection timeouts
- 🚨 Trial countdown not decrementing
- 🚨 Billing portal redirect fails (404)

---

#### Document Results

**After All Tests Pass**, create `PRODUCTION_DEPLOYMENT_PHASE4_COMPLETE.md`:

```markdown
# Phase 4 Production Deployment - COMPLETE

**Deployment Date**: [Date/Time]
**Deployed By**: [Your Name]
**Commit**: 6d7d7ba
**Deployment URL**: https://skaiscrape.com

## Environment Variables Set

- ✅ FREE_BETA=true
- ✅ STRIPE_SECRET_KEY (live)
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ All STRIPE*PRICE*\* vars
- ✅ RESEND_API_KEY
- ✅ EMAIL_FROM
- ✅ CRON_SECRET
- ✅ DATABASE_URL
- ✅ All other core vars

## Smoke Test Results

- ✅ Trial signup flow: PASSED
- ✅ Billing portal: PASSED
- ✅ Email sending: PASSED
- ✅ Webhook processing: PASSED
- ✅ Token purchases: PASSED
- ✅ Cron execution: PASSED

## Known Issues

[None / List any non-blocking issues]

## Monitoring

- Vercel Logs: [Link]
- Stripe Webhooks: [Link]
- First 24h: All systems nominal

## Next Steps

- Continue monitoring for 24h
- Plan Phase 5 kickoff
- Schedule "FREE_BETA=false" flip (future)
```

**Commit & Push**:

```bash
git add PRODUCTION_DEPLOYMENT_PHASE4_COMPLETE.md
git commit -m "docs: Phase 4 production deployment complete - all smoke tests passing"
git push origin feat/phase3-banner-and-enterprise
```

**Status**: ⬜ NOT STARTED  
**Time**: 10 minutes

---

## ✅ SUCCESS CRITERIA

**Phase 4 is LIVE when ALL boxes checked**:

- [ ] All env vars present in Vercel (Production)
- [ ] `vercel --prod` succeeded
- [ ] Stripe webhooks returning 200 OK
- [ ] Cron runs hourly (manual kick worked)
- [ ] All 6 smoke tests passed
- [ ] No critical errors in first 24h
- [ ] Final deployment document created

---

## 🚨 ROLLBACK PLAN (Emergency Only)

**If Critical Issues Arise**:

### Immediate Rollback

```bash
cd /Users/admin/Downloads/preloss-vision-main

# Revert to last known good commit (before Phase 4)
git checkout 1979078  # "feat: Final launch cutover"

# Redeploy
vercel --prod
```

### Partial Rollback (Disable Feature)

**If only trials are broken**:

1. Set `FREE_BETA=false` in Vercel → disables trial auto-start
2. Manually update affected orgs in database
3. Redeploy current code (no git revert needed)

### Database Rollback (LAST RESORT)

**Only if database corruption**:

1. Stop all cron jobs
2. Restore database from latest backup (before migrations)
3. Re-run migrations manually
4. Verify data integrity

---

## 📚 REFERENCE DOCUMENTATION

**Comprehensive Guides**:

- `PHASE_4_PRODUCTION_DEPLOYMENT_MASTER.md` - Full 608-line deployment guide
- `PHASE_4_READY_TO_DEPLOY.md` - Quick-start guide
- `PHASE_4_COMPLETE.md` - Implementation summary

**Key Features Deployed**:

- 72h trial system (countdown, lock page, middleware)
- Billing portal (Stripe integration, invoices, auto-refill)
- Stripe webhooks (subscription lifecycle + dunning)
- Cron sweeper (hourly trial automation + reminders)
- Email lazy-loading (safeSendEmail - never crashes builds)
- Database migrations (sentTrialT24/T1 dedupe flags)

**Build Status**:

- TypeScript: 0 errors
- Build: ✓ Compiled successfully
- All lazy-loading fixes applied (Resend, OpenAI, Firebase)

---

## 🎯 FINAL CHECKLIST

**Before You Start**:

- ✅ All code committed and pushed (6d7d7ba)
- ✅ Build passing locally
- ✅ Documentation complete
- ✅ Rollback plan ready

**Ready to Execute**:

1. Set env vars (10 min) 🔴 **START HERE**
2. Deploy (5 min)
3. Configure webhooks (3 min)
4. Test cron (1 min)
5. Run smoke tests (25 min)
6. Monitor & document (ongoing)

**Total Time**: ~45 minutes + 24h monitoring

---

**🚀 READY TO LAUNCH - Execute steps in order above!**
