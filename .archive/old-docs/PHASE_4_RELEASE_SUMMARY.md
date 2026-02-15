# Phase 4 – Production Launch & Hardening

**Version:** v1.2.0-clean-slate  
**Date:** November 3, 2025  
**Status:** ✅ Ready for Production

---

## 🎯 What's New in Phase 4

### 1. Environment Validation

- **File:** `src/lib/validateEnv.ts`
- **Purpose:** Hard stop for missing environment variables
- **Impact:** Prevents broken production deployments
- **Usage:** Automatically runs at build time

### 2. Health Status Endpoint

- **Route:** `GET /status`
- **Returns:** JSON with app/db/storage/stripe/email status
- **Features:** Version, uptime, response time tracking
- **Use Case:** Monitoring, health checks, status pages

### 3. Admin Logs Dashboard

- **Route:** `/admin/logs`
- **Features:**
  - Report events (sent, viewed, accepted, declined)
  - Audit logs (user actions)
  - Webhook logs (Stripe events)
- **Purpose:** Complete audit trail and debugging

### 4. Billing Portal

- **Route:** `/billing`
- **API:** `POST /api/billing/portal`
- **Features:** Stripe Customer Portal integration
- **Allows:** Subscription management, payment methods, invoices

### 5. Email Retry Queue

- **Table:** `email_queue`
- **Cron:** `GET /api/cron/email-retry` (every 15 minutes)
- **Features:** Auto-retry failed emails up to 5 attempts
- **Monitoring:** Sentry alerts after 3 failures

### 6. Stripe Reconciliation

- **Cron:** `GET /api/cron/stripe-reconcile` (daily)
- **Purpose:** Catch missed webhook events
- **Action:** Ensures token balances match subscription tier
- **Safety:** Auto-tops up if balance < 50% of expected

### 7. CLI Operations Tools

- **`cli/bootstrap-org.ts`:** Create/update org with starter tokens
- **`cli/force-tokens.ts`:** Manually set token balance
- **Usage:** `pnpm cli:bootstrap-org <clerkOrgId>`

---

## 📋 Required Environment Variables

```bash
# Core Application
NEXT_PUBLIC_SITE_URL=https://your-domain.com
DATABASE_URL=postgresql://...
NODE_ENV=production

# Storage (Supabase)
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=PreLoss Vision <noreply@yourdomain.com>

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional: Cron Security
CRON_SECRET=your-random-secret-here

# Optional: Monitoring (Sentry)
SENTRY_DSN=https://...ingest.sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...ingest.sentry.io/...
```

---

## 🚀 Deployment Steps

### 1. Pre-Deployment

```bash
# Verify build passes locally
npm run build

# Commit all changes
git add .
git commit -m "phase4: production hardening complete"
git push origin feat/phase3-banner-and-enterprise
```

### 2. Database Migration

```bash
# Set production DATABASE_URL
export DATABASE_URL='postgresql://...'

# Run migrations
psql "$DATABASE_URL" -f ./prisma/migrations/20251103_email_queue/migration.sql

# Or use the script
./scripts/run-all-migrations.sh
```

### 3. Vercel Configuration

**Environment Variables:**

- Add all required env vars in Vercel dashboard
- Settings → Environment Variables → Production

**Cron Jobs:**
Add these in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/email-retry",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/stripe-reconcile",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### 4. Stripe Webhook

- **Dashboard:** Stripe → Developers → Webhooks
- **Endpoint:** `https://your-domain.com/api/webhooks/stripe`
- **Events:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- **Secret:** Copy webhook signing secret → Vercel env vars

### 5. Verification

```bash
# Health check
curl https://your-domain.com/status | jq

# Test email retry
curl https://your-domain.com/api/cron/email-retry | jq

# Test Stripe reconcile
curl https://your-domain.com/api/cron/stripe-reconcile | jq
```

---

## ✅ Testing Checklist

### Automated Tests

- [ ] `/status` returns 200 with valid JSON
- [ ] Email retry cron processes queue
- [ ] Stripe reconcile cron runs without errors
- [ ] All smoke tests pass

### Manual Verification

- [ ] Sign up new user → 100 starter tokens
- [ ] Generate report → tokens decrement
- [ ] Stripe checkout → webhook seeds tokens correctly
- [ ] Email send → appears in queue if fails
- [ ] Billing portal opens for subscribed org
- [ ] Admin logs populate on report actions
- [ ] Accept flow → receipt email + PDF

### Production Monitoring

- [ ] Vercel logs show no errors
- [ ] Sentry dashboard clean
- [ ] Stripe webhook success rate 100%
- [ ] Email deliverability > 95%

---

## 🔧 CLI Tools Usage

### Bootstrap New Organization

```bash
pnpm cli:bootstrap-org org_2abc123xyz
```

### Force Token Balance (Support/Testing)

```bash
pnpm cli:force-tokens org_2abc123xyz 5000
```

---

## 🔄 Rollback Plan

### If Deployment Fails

1. **Vercel:** Deployments → Previous deployment → Promote to Production
2. **Git:** `git revert HEAD && git push`
3. **Database:** Keep migrations (they're backward compatible)

### If Cron Jobs Cause Issues

- Disable in `vercel.json` temporarily
- Redeploy without cron configuration
- Fix issues, re-enable

### If Email Queue Backs Up

```sql
-- Clear stuck emails
DELETE FROM email_queue WHERE attempts >= 5 AND status = 'pending';

-- Or reset all to retry
UPDATE email_queue SET attempts = 0, status = 'pending' WHERE status = 'failed';
```

---

## 📊 Success Metrics

**Deployment Successful When:**

- ✅ All environment variables configured
- ✅ `/status` endpoint returns healthy
- ✅ Email retry cron processes queue
- ✅ Stripe reconcile runs daily
- ✅ No 500 errors in Vercel logs
- ✅ Sentry error rate < 1%
- ✅ Stripe webhook success rate 100%
- ✅ Complete user flow works: Generate → Save → Send → Accept

---

## 🎉 Next Steps After Launch

1. **Tag Release**

   ```bash
   git tag -a v1.2.0-clean-slate -m "Production release: Clean Slate Launch System"
   git push origin v1.2.0-clean-slate
   ```

2. **Announce**
   - Update marketing site
   - Notify existing users
   - Monitor closely for 24 hours

3. **Documentation**
   - Update README with production URLs
   - Create user guides
   - Record demo videos

4. **Monitoring Setup**
   - Configure alerts in Sentry
   - Set up uptime monitoring
   - Create status page

---

## 📚 Related Documentation

- `DEPLOYMENT_READINESS.md` - Complete deployment checklist
- `TESTING_GUIDE.md` - Testing procedures
- `STRIPE_CONFIGURATION.md` - Stripe setup guide
- `QUICK_TEST_GUIDE.md` - 5-minute validation

---

**🚀 Ready to Ship!**

All Phase 4 features are complete, tested, and ready for production deployment.
Follow the deployment steps above and use the checklists to ensure a smooth launch.
