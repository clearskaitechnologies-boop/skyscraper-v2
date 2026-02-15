# 🚀 COMPLETE TESTING CHECKLIST - v1.2.0

## PRE-DEPLOYMENT TESTING (Local)

### ✅ Installation & Setup

- [ ] `pnpm install` runs without errors
- [ ] `pnpm run build` completes successfully
- [ ] Database migrations apply cleanly
- [ ] All environment variables set locally

### ✅ Acceptance Receipt System

- [ ] Generate a test report
- [ ] Accept report via `/api/reports/[publicKey]/accept`
- [ ] Verify PDF receipt generated
- [ ] Verify PDF uploaded to Supabase Storage
- [ ] Verify email sent with receipt link
- [ ] Verify event logged in `report_events` table
- [ ] Verify IP and user agent captured
- [ ] Verify signed URL works (30-day expiry)

### ✅ Admin Metrics Dashboard

- [ ] Navigate to `/admin/metrics`
- [ ] Verify KPI cards display (reports, accepted, tokens, avg time)
- [ ] Verify daily breakdown table populates
- [ ] Verify acceptance rate calculated correctly
- [ ] Verify token leaderboard shows top users
- [ ] Test 7/30/90 day filters
- [ ] Verify export to CSV works (if implemented)

### ✅ Stripe Token Seeding

- [ ] Use Stripe CLI to trigger `checkout.session.completed`
- [ ] Verify tokens credited to organization
- [ ] Verify correct amount: Solo (200), Business (1200), Enterprise (4000)
- [ ] Verify entry created in `tokens_ledger`
- [ ] Verify welcome email sent
- [ ] Test subscription update event
- [ ] Test subscription cancellation (grace period)
- [ ] Test payment failure handling

### ✅ Report Detail Page

- [ ] Navigate to `/reports/[id]`
- [ ] Verify report content displays
- [ ] Verify event timeline shows all actions
- [ ] Verify stats cards (views, accepted, emails sent)
- [ ] Click "Resend Email" → verify success toast
- [ ] Click "Regenerate Links" → verify new URLs created
- [ ] Click "Download PDF" → verify PDF downloads
- [ ] Click "View Public Share" → verify share page opens

### ✅ Token Gating

- [ ] Set `aiRemaining = 0` in `token_wallet`
- [ ] Try generating AI report
- [ ] Verify blocked with friendly error message
- [ ] Verify "Buy More Tokens" CTA displayed
- [ ] Verify no report generated
- [ ] Restore tokens, verify report generation works

### ✅ Org Status Guards

- [ ] Set `subscriptionStatus = 'canceled'` in org
- [ ] Try accessing protected routes
- [ ] Verify redirect to `/account/billing?status=suspended`
- [ ] Verify upsell message displayed
- [ ] Restore subscription, verify access granted

### ✅ Feature Flags

- [ ] Test `getFeatureFlags(orgId)`
- [ ] Test per-org flag overrides
- [ ] Test global environment variable flags
- [ ] Test emergency mode (all features disabled)
- [ ] Run `tsx scripts/hotfix/reset-org.ts <org-id>`
- [ ] Verify all features disabled for org
- [ ] Run `tsx scripts/hotfix/enable-features.ts <org-id>`
- [ ] Verify features re-enabled

### ✅ Error Tracking

- [ ] Verify Sentry initialized (check console for DSN)
- [ ] Trigger test error in Stripe webhook
- [ ] Verify error appears in Sentry dashboard
- [ ] Verify error context includes tags and metadata
- [ ] Test PDF generation error capture
- [ ] Test email sending error capture

---

## PRODUCTION DEPLOYMENT

### ✅ Environment Variables (Vercel)

```bash
# Clerk
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SOLO=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=PreLoss Vision <noreply@skaiscrape.com>

# Supabase
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Sentry
SENTRY_DSN=https://...@....ingest.sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=skaiscraper
SENTRY_PROJECT=preloss-vision
```

- [ ] All variables set in Vercel production
- [ ] Verify no test keys in production
- [ ] Verify webhook secrets match Stripe dashboard

### ✅ Database Migrations

```bash
psql "$PRODUCTION_DATABASE_URL" -f ./db/migrations/20241103_report_events_table.sql
```

- [ ] Migration applied successfully
- [ ] Verify `report_events` table exists
- [ ] Verify indexes created
- [ ] Verify RLS policies enabled
- [ ] Verify helper function works

### ✅ Stripe Webhook Setup

- [ ] Add webhook endpoint: `https://skaiscrape.com/api/webhooks/stripe`
- [ ] Select events: checkout.session.completed, customer.subscription._, invoice._
- [ ] Copy signing secret to Vercel
- [ ] Send test webhook from dashboard
- [ ] Verify webhook received in Vercel logs

### ✅ Deployment Script

```bash
./scripts/deploy-production.sh
```

- [ ] Pre-flight checks pass
- [ ] Environment variables validated
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Migrations applied
- [ ] Deployment to Vercel succeeds
- [ ] Health checks pass

---

## POST-DEPLOYMENT VERIFICATION

### ✅ Smoke Tests

```bash
./scripts/smoke-test.sh https://skaiscrape.com
```

- [ ] Liveness probe: `/api/health/live` returns 200
- [ ] Readiness probe: `/api/health/ready` returns 200
- [ ] Homepage loads
- [ ] Sign in page loads
- [ ] Protected routes require auth

### ✅ End-to-End Flow

1. **Create Test Organization**
   - [ ] Sign up new user
   - [ ] Verify org created
   - [ ] Verify token wallet initialized

2. **Purchase Subscription**
   - [ ] Go to billing page
   - [ ] Select Solo plan ($49/month)
   - [ ] Complete Stripe checkout
   - [ ] Verify webhook received
   - [ ] Verify 200 tokens credited
   - [ ] Verify welcome email sent
   - [ ] Check `tokens_ledger` for transaction

3. **Generate Report**
   - [ ] Generate AI damage report
   - [ ] Verify tokens deducted
   - [ ] Verify report saved to database
   - [ ] Verify PDF generated

4. **Send Report**
   - [ ] Send report to client email
   - [ ] Verify email received
   - [ ] Verify event logged (kind: 'sent')

5. **Client Accepts Report**
   - [ ] Client clicks acceptance link
   - [ ] Client enters name/email
   - [ ] Client accepts report
   - [ ] Verify acceptance receipt PDF generated
   - [ ] Verify receipt uploaded to Supabase
   - [ ] Verify receipt email sent
   - [ ] Verify event logged (kind: 'accepted')
   - [ ] Verify IP and user agent recorded

6. **View Admin Metrics**
   - [ ] Navigate to `/admin/metrics`
   - [ ] Verify report counted
   - [ ] Verify acceptance counted
   - [ ] Verify acceptance rate calculated
   - [ ] Verify token usage displayed

7. **View Report Detail**
   - [ ] Navigate to `/reports/[id]`
   - [ ] Verify all events shown in timeline
   - [ ] Resend email to client
   - [ ] Regenerate share links
   - [ ] Download acceptance receipt

---

## MONITORING (First 24 Hours)

### ✅ Vercel Logs

```bash
vercel logs --follow
```

- [ ] Monitor for errors
- [ ] Check function execution times
- [ ] Verify no infinite loops
- [ ] Check memory usage

### ✅ Sentry Dashboard

- [ ] Check error rate (<1%)
- [ ] Review error grouping
- [ ] Verify source maps working
- [ ] Set up alerts for critical errors

### ✅ Stripe Dashboard

- [ ] Webhook delivery success rate (>99%)
- [ ] Review failed webhooks
- [ ] Monitor subscription events
- [ ] Check payment success rate

### ✅ Database Queries

```sql
-- Check recent report events
SELECT * FROM report_events
ORDER BY created_at DESC
LIMIT 20;

-- Check token transactions
SELECT * FROM tokens_ledger
ORDER BY created_at DESC
LIMIT 20;

-- Check token balances
SELECT org_id, aiRemaining FROM token_wallet
ORDER BY aiRemaining DESC;

-- Check webhook events
SELECT * FROM webhook_events
ORDER BY created_at DESC
LIMIT 20;

-- Check acceptance rate
SELECT
  COUNT(*) FILTER (WHERE status = 'accepted') * 100.0 / COUNT(*) as acceptance_rate
FROM ai_report
WHERE created_at > NOW() - INTERVAL '7 days';
```

### ✅ KPI Targets

- [ ] Report generation success rate: >95%
- [ ] PDF generation time: <2s average
- [ ] Email delivery rate: >98%
- [ ] Acceptance receipt generation: 100% success
- [ ] Stripe webhook success: >99%
- [ ] Page load time (p95): <2s
- [ ] API response time (p95): <500ms

---

## ROLLBACK PLAN (If Issues Found)

### Option 1: Feature Flags (Soft Rollback)

```bash
# Disable acceptance receipts for all orgs
export ACCEPTANCE_RECEIPTS_ENABLED=false
vercel env add ACCEPTANCE_RECEIPTS_ENABLED production

# Disable for specific org
tsx scripts/hotfix/reset-org.ts <org-id>
```

### Option 2: Vercel Rollback (Hard Rollback)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Option 3: Git Revert

```bash
# Revert to previous commit
git revert HEAD
git push origin feat/phase3-banner-and-enterprise

# Redeploy
vercel --prod
```

---

## SIGN-OFF CRITERIA

### ✅ Technical

- [ ] All smoke tests pass
- [ ] End-to-end flow works
- [ ] No critical errors in Sentry
- [ ] Webhook success rate >99%
- [ ] Page load times acceptable
- [ ] Database migrations stable

### ✅ Business

- [ ] Token seeding works correctly
- [ ] Billing integration functional
- [ ] Acceptance receipts generate
- [ ] Admin metrics accurate
- [ ] Email delivery reliable

### ✅ Security

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] Webhook signature verification working
- [ ] RLS policies active
- [ ] Error logs sanitized

### ✅ Documentation

- [ ] README updated
- [ ] API docs current
- [ ] Deployment guide complete
- [ ] Troubleshooting guide ready
- [ ] Runbook prepared

---

## GO-LIVE APPROVAL

**Approved by:**

- [ ] Tech Lead: **\*\***\_\_\_**\*\*** Date: **\_\_\_**
- [ ] Product Manager: **\*\***\_\_\_**\*\*** Date: **\_\_\_**
- [ ] DevOps: **\*\***\_\_\_**\*\*** Date: **\_\_\_**

**Production Release: v1.2.0-clean-slate**
**Release Date: \*\*\*\***\_\_\_**\*\*\*\***

🎉 **READY FOR PRODUCTION!**
