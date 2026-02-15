# PHASE 4 — DEPLOYMENT CHECKLIST ✅

**Date**: November 2, 2024  
**Commit**: `daf8548` (enum fix)  
**Status**: READY FOR PRODUCTION

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Quality

- ✅ **Enum fix compiled** - Changed string "ADMIN" to `Role.ADMIN` enum
- ✅ **TypeScript type check passed** - `npx tsc --noEmit` shows no errors
- ✅ **Prisma Client regenerated** - All Phase 4 fields available
- ✅ **Build completed** - API routes compiled successfully (static page errors are pre-existing, non-blocking)

### Database

- ✅ **Migration applied** - `sentTrialT24` and `sentTrialT1` columns added
- ✅ **Schema updated** - All Phase 4 fields in Org table
- ✅ **No data loss** - Additive changes only (ALTER TABLE ADD COLUMN)

### Configuration Files

- ✅ **vercel.json** - Hourly cron for `/api/cron/trials/sweep` at `0 * * * *`
- ✅ **.env.example** - All Phase 4 env vars documented
- ✅ **PHASE_4_COMPLETE.md** - Deployment guide created

### Code Integration

- ✅ **Stripe webhooks** - 4 new handlers (subscription lifecycle + dunning)
- ✅ **Trial cron sweeper** - Expires trials, sends T-24h/T-1h reminders
- ✅ **Auto-refill helper** - Non-blocking checkout creation
- ✅ **Org creation hook** - Calls `startTrial()` on new orgs
- ✅ **Email templates** - 3 new templates (Trial24Hour, Trial1Hour, PaymentFailed)

---

## 🔧 VERCEL ENVIRONMENT VARIABLES

### Required for Production

**Core Authentication & Database**:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgres://...
SHADOW_DATABASE_URL=postgres://... (for migrations)
```

**Stripe Billing** (CRITICAL for Phase 4):

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SOLO=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_TOPUP_100=price_...
STRIPE_TOPUP_500=price_...
STRIPE_TOPUP_2000=price_...
STRIPE_TOKEN_PACK_PRICE_100=price_... (for auto-refill)
STRIPE_BILLING_PORTAL_RETURN_URL=https://skaiscrape.com/account/billing
```

**Email (Resend)**:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM=SkaiScraper <no-reply@skaiscrape.com>
```

**Cron Security**:

```bash
CRON_SECRET=<generate-random-32-char-secret>
VERCEL_CRON_SECRET=<vercel-auto-generates-this>
```

**Feature Toggles**:

```bash
FREE_BETA=true (enables trial system)
NEXT_PUBLIC_APP_URL=https://skaiscrape.com
```

**Optional (Already Configured)**:

```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_MAPBOX_TOKEN=pk...
FIREBASE_SERVICE_ACCOUNT_KEY={...}
SENTRY_DSN=https://...
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Verify Environment Variables in Vercel Dashboard

Go to: `vercel.com → PreLossVision → Settings → Environment Variables`

**Critical Phase 4 Variables** (check these are set for Production):

- [ ] `STRIPE_BILLING_PORTAL_RETURN_URL`
- [ ] `STRIPE_TOKEN_PACK_PRICE_100`
- [ ] `FREE_BETA=true`
- [ ] `CRON_SECRET`
- [ ] `EMAIL_FROM`

### 2. Deploy to Production

```bash
# Option A: CLI Deploy (recommended for manual control)
cd /Users/admin/Downloads/preloss-vision-main
vercel --prod

# Option B: Merge to main (if auto-deploy configured)
# 1. Create PR from feat/phase3-banner-and-enterprise
# 2. Review changes
# 3. Merge to main → auto-deploys
```

### 3. Configure Stripe Webhooks

**URL**: `https://skaiscrape.com/api/webhooks/stripe`

**Events to send** (add these in Stripe dashboard):

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.upcoming`
- `customer.subscription.trial_will_end`
- `checkout.session.completed`

**Webhook Secret**: Copy to `STRIPE_WEBHOOK_SECRET` env var

---

## 🧪 POST-DEPLOY SMOKE TESTS

### 1. Trial System

```bash
# Create new test account (use incognito/private browsing)
# Go to: https://skaiscrape.com/sign-up

Expected:
✅ After sign-up → redirected to /dashboard?beta=true
✅ Trial banner visible with countdown (hh:mm format)
✅ Banner shows green initially
✅ Can navigate to /account/billing
```

### 2. Billing Portal

```bash
# Navigate to: https://skaiscrape.com/account/billing

Expected:
✅ Plan status displays correctly
✅ Trial countdown shows time remaining
✅ "Manage Billing" button opens Stripe Customer Portal
✅ Auto-refill toggle persists when changed
✅ Invoices section loads (may be empty for new accounts)
```

### 3. Cron Endpoint (Manual Test)

```bash
# Get CRON_SECRET from Vercel env vars
curl -X GET "https://skaiscrape.com/api/cron/trials/sweep" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -v

Expected response:
{
  "success": true,
  "timestamp": "2024-11-02T...",
  "results": {
    "markedEnded": 0,
    "sent24h": 0,
    "sent1h": 0,
    "sentEnded": 0,
    "errors": []
  }
}
```

### 4. Stripe Webhook Test

```bash
# In Stripe Dashboard → Webhooks → Your endpoint
# Click "Send test webhook"
# Test event: customer.subscription.updated

Expected:
✅ Webhook returns 200 OK
✅ Check database: Org.subscriptionStatus updated
✅ Check Vercel logs: No errors logged
```

### 5. Trial Reminder Email Test (Advanced)

```sql
-- Temporarily set a trial to end soon (in staging/dev DB only!)
UPDATE "Org"
SET "trialEndsAt" = NOW() + INTERVAL '23 hours 55 minutes',
    "sentTrialT24" = false
WHERE "id" = '<test-org-id>';

-- Wait for hourly cron OR trigger manually
-- Then check: email sent, sentTrialT24=true
```

### 6. Route Navigation

Navigate to each key route and verify no console errors:

- ✅ `/` (homepage) → loads
- ✅ `/pricing` → loads, shows plans
- ✅ `/dashboard` → shows trial banner (if in trial)
- ✅ `/account/billing` → loads billing portal
- ✅ `/trial/ended` → shows upgrade CTA (simulate expired trial)

---

## 📊 OWNER ACCEPTANCE CHECKLIST

**Instructions**: Test each item and mark PASS/FAIL

### Core Functionality

- [ ] **PASS/FAIL**: Enum fix compiled without TypeScript errors
- [ ] **PASS/FAIL**: Build succeeded (ignore static page warnings - pre-existing)
- [ ] **PASS/FAIL**: New org creation starts 72-hour trial automatically
- [ ] **PASS/FAIL**: Dashboard shows trial countdown in hh:mm format
- [ ] **PASS/FAIL**: Trial countdown color changes (green → orange at 24h → red at 1h)
- [ ] **PASS/FAIL**: Expired trial redirects to `/trial/ended` page

### Billing Integration

- [ ] **PASS/FAIL**: `/account/billing` page loads with all sections
- [ ] **PASS/FAIL**: "Manage Billing" button opens Stripe Customer Portal
- [ ] **PASS/FAIL**: Auto-refill toggle persists when changed
- [ ] **PASS/FAIL**: Billing portal callback redirects to `/account/billing`

### Stripe Webhooks

- [ ] **PASS/FAIL**: Subscription created webhook updates Org.subscriptionStatus
- [ ] **PASS/FAIL**: Subscription updated webhook updates Org.planKey
- [ ] **PASS/FAIL**: Payment failed webhook sends dunning email
- [ ] **PASS/FAIL**: Webhooks are idempotent (replay same event → no duplicates)

### Cron & Automation

- [ ] **PASS/FAIL**: Cron endpoint responds with JSON summary
- [ ] **PASS/FAIL**: Expired trials marked as "ended" (check DB after cron run)
- [ ] **PASS/FAIL**: T-24h reminder emails sent (no duplicates via sentTrialT24 flag)
- [ ] **PASS/FAIL**: T-1h reminder emails sent (no duplicates via sentTrialT1 flag)

### User Experience

- [ ] **PASS/FAIL**: No console warnings on key routes (/dashboard, /account/billing)
- [ ] **PASS/FAIL**: Trial banner displays correctly on mobile
- [ ] **PASS/FAIL**: Billing page is responsive
- [ ] **PASS/FAIL**: Email templates render correctly (test in email client)

---

## 🔄 ROLLBACK PLAN

**If deployment causes issues**:

### Option 1: Vercel Dashboard (Fastest)

```bash
1. Go to vercel.com → PreLossVision → Deployments
2. Find last successful deployment before daf8548
3. Click "⋯" menu → "Promote to Production"
```

### Option 2: Git Revert

```bash
git revert daf8548
git push origin feat/phase3-banner-and-enterprise
# Then redeploy via Vercel
```

### Option 3: Disable Cron (If cron causes issues)

```json
// Edit vercel.json - remove trial sweep cron:
"crons": [
  { "path": "/api/wallet/reset-monthly", "schedule": "0 5 1 * *" },
  { "path": "/api/weather/cron-daily", "schedule": "0 9 * * *" }
  // Removed: trial sweep
]
```

Then redeploy.

### Safety Notes

- ✅ **Webhook idempotency**: Safe to replay events (WebhookEvent table prevents duplicates)
- ✅ **Database migrations**: Additive only (no data loss on rollback)
- ✅ **Trial state preserved**: Rolling back code doesn't affect trial data
- ✅ **Email deduplication**: Flags prevent duplicate reminders even after rollback

---

## 📈 MONITORING

### Vercel Logs

```bash
# Watch deployment logs
vercel logs --follow

# Filter for cron executions
vercel logs | grep "CRON:TRIAL"

# Filter for webhook events
vercel logs | grep "WEBHOOK:STRIPE"
```

### Sentry (Error Tracking)

```bash
# Check for runtime errors at:
https://sentry.io/organizations/<your-org>/issues/

# Key searches:
- "trial" errors
- "stripe webhook" errors
- "cron" errors
```

### Database Monitoring

```sql
-- Check trial status distribution
SELECT "trialStatus", COUNT(*) as count
FROM "Org"
WHERE "trialStatus" IS NOT NULL
GROUP BY "trialStatus";

-- Check reminder email flags
SELECT
  COUNT(*) FILTER (WHERE "sentTrialT24" = true) as "sent_24h",
  COUNT(*) FILTER (WHERE "sentTrialT1" = true) as "sent_1h"
FROM "Org"
WHERE "trialStatus" = 'active';

-- Check subscription statuses
SELECT "subscriptionStatus", COUNT(*) as count
FROM "Org"
WHERE "subscriptionStatus" IS NOT NULL
GROUP BY "subscriptionStatus";
```

---

## 🎉 COMPLETION CRITERIA

**Phase 4 is fully deployed when**:

- ✅ All acceptance checklist items marked PASS
- ✅ Cron executes hourly without errors (check Vercel logs)
- ✅ Stripe webhooks update database correctly (test via Stripe dashboard)
- ✅ Trial reminders sent at correct times (verify via email)
- ✅ No Sentry errors related to Phase 4 code
- ✅ 24 hours of production monitoring with no issues

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue**: Cron not executing

- **Check**: Vercel Deployments → Crons tab → verify schedule
- **Fix**: Ensure `CRON_SECRET` env var is set, redeploy if needed

**Issue**: Webhooks returning 401/403

- **Check**: Stripe webhook secret matches `STRIPE_WEBHOOK_SECRET` env var
- **Fix**: Regenerate webhook secret in Stripe, update env var

**Issue**: Emails not sending

- **Check**: Resend dashboard for delivery status
- **Fix**: Verify `RESEND_API_KEY` and `EMAIL_FROM` env vars

**Issue**: Trial not starting on org creation

- **Check**: Vercel logs for "TRIAL" keyword
- **Fix**: Ensure `FREE_BETA=true` in env vars

### Documentation References

- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Vercel Crons**: https://vercel.com/docs/cron-jobs
- **Resend Emails**: https://resend.com/docs
- **Prisma Client**: https://www.prisma.io/docs/concepts/components/prisma-client

---

**END OF CHECKLIST** — Ready for production deployment! 🚀
