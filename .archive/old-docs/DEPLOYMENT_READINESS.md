# 🚀 DEPLOYMENT READINESS CHECKLIST

**Branch:** feat/phase3-banner-and-enterprise  
**Target:** Production (Vercel)  
**Version:** v1.2.0-clean-slate  
**Date:** November 3, 2025

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code & Build

- [x] All TypeScript errors resolved
- [x] Build passes locally (`npm run build`)
- [x] All changes committed to Git
- [x] Changes pushed to GitHub
- [ ] Vercel build completes successfully
- [ ] No console errors in production build

### Database

- [ ] DATABASE_URL configured in Vercel
- [ ] Run migrations: `./scripts/run-all-migrations.sh`
- [ ] Verify report_events table exists
- [ ] Test Prisma Client generation

### Environment Variables (Vercel)

- [ ] CLERK_PUBLISHABLE_KEY
- [ ] CLERK_SECRET_KEY
- [ ] DATABASE_URL (PostgreSQL)
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] STRIPE_PRICE_SOLO
- [ ] STRIPE_PRICE_BUSINESS
- [ ] STRIPE_PRICE_ENTERPRISE
- [ ] RESEND_API_KEY
- [ ] NEXT_PUBLIC_APP_URL
- [ ] SENTRY_DSN (if using Sentry)

### Stripe Configuration

- [ ] Webhook endpoint configured: `https://your-domain.com/api/webhooks/stripe`
- [ ] Webhook events enabled:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed
- [ ] Test mode vs Production mode configured
- [ ] Price IDs match environment variables

### Email (Resend)

- [ ] RESEND_API_KEY configured
- [ ] Domain verified (or using Resend's test domain)
- [ ] Sender email configured
- [ ] Test email sending works

---

## 🧪 POST-DEPLOYMENT TESTS

### Automated Tests

- [ ] Run smoke tests: `./scripts/smoke-test.sh`
- [ ] All critical routes return 200 or expected status
- [ ] Static assets load correctly

### Manual Verification

#### Authentication Flow

- [ ] Sign up new user works
- [ ] Sign in existing user works
- [ ] Sign out works
- [ ] Organization selection works

#### Core Features

- [ ] Dashboard loads
- [ ] Create new report
- [ ] View existing reports
- [ ] Generate AI report (if tokens available)

#### New Features (v1.2.0)

- [ ] Admin Metrics page loads (`/admin/metrics`)
- [ ] Metrics API returns data (`/api/admin/metrics`)
- [ ] Report detail page loads (`/reports/[id]`)
- [ ] Send report email works
- [ ] Accept report flow (public) works
- [ ] Decline report flow (public) works
- [ ] Acceptance receipt PDF generates
- [ ] Acceptance receipt email sends

#### Token System

- [ ] Token balance displays correctly
- [ ] Token consumption works
- [ ] Token purchase flow works
- [ ] Stripe webhook seeds tokens on subscription
- [ ] Low token warnings appear

#### Error Handling

- [ ] 404 page shows for invalid routes
- [ ] 500 error page shows for server errors
- [ ] Sentry captures errors (if configured)
- [ ] Error boundaries catch React errors

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Build Fails on Vercel**

```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Verify all environment variables are set
- Check for TypeScript errors
- Ensure all dependencies are in package.json
```

**Database Connection Fails**

```bash
# Verify DATABASE_URL format
postgresql://user:password@host:5432/database?sslmode=require

# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"
```

**Stripe Webhook Not Working**

```bash
# Verify webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{}'

# Check Stripe dashboard > Webhooks > Attempts
```

**Emails Not Sending**

```bash
# Test Resend API key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

---

## 📝 ROLLBACK PLAN

If deployment fails or critical bugs found:

1. **Immediate Rollback**

   ```bash
   # In Vercel dashboard:
   - Go to Deployments
   - Find previous stable deployment
   - Click "⋮" menu > "Promote to Production"
   ```

2. **Git Rollback**

   ```bash
   git revert HEAD
   git push origin feat/phase3-banner-and-enterprise
   ```

3. **Database Rollback**
   ```bash
   # Drop report_events table if causing issues
   psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS report_events CASCADE;"
   ```

---

## 🎯 SUCCESS CRITERIA

Deployment is considered successful when:

- ✅ All smoke tests pass
- ✅ No critical errors in Sentry
- ✅ All new features accessible
- ✅ Authentication works
- ✅ Database queries execute
- ✅ Emails send successfully
- ✅ Stripe webhooks process correctly
- ✅ Performance metrics acceptable (< 3s page load)

---

## 📞 SUPPORT CONTACTS

**If Issues Arise:**

- Vercel Support: https://vercel.com/support
- Stripe Support: https://support.stripe.com
- Sentry: https://sentry.io
- Database Provider: [Your provider]

---

## ✅ SIGN-OFF

- [ ] Pre-deployment checklist complete
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Post-deployment tests passed
- [ ] Monitoring enabled
- [ ] Team notified of deployment

**Deployed by:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***  
**Time:** **\*\*\*\***\_**\*\*\*\***  
**Deployment URL:** **\*\*\*\***\_**\*\*\*\***

---

**Next Steps After Successful Deployment:**

1. Monitor Vercel deployment logs for 1 hour
2. Check Sentry for any new errors
3. Monitor Stripe webhook attempts
4. Test with real users/orgs
5. Update documentation with production URLs
6. Create GitHub release tag: `v1.2.0-clean-slate`
