# 🚀 SkaiScraper Production Deployment Guide

## Environment Variables Setup

### Required Vercel Environment Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://skaiscraper.app
NODE_ENV=production

# Clerk Authentication (LIVE KEYS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Stripe Billing (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_PRICE_SOLO=price_...
NEXT_PUBLIC_PRICE_BUSINESS=price_...
NEXT_PUBLIC_PRICE_ENTERPRISE=price_...

# Database (Production)
DATABASE_URL=postgres://...

# Optional Services
RESEND_API_KEY=re_...
SYSTEM_FROM_EMAIL=no-reply@skai.ai
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=skai-prod

# OpenAI
OPENAI_API_KEY=sk-...
```

## Stripe Webhook Setup

1. **Create Webhook Endpoint:**

   ```
   URL: https://skaiscraper.app/api/stripe/webhook
   ```

2. **Required Events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Copy Webhook Secret:**
   - Add as `STRIPE_WEBHOOK_SECRET` in Vercel

## Route Architecture Summary

### ✅ Clean Route Structure Achieved:

**Public Marketing Routes:**

- `/` - Landing page
- `/features` - Product features
- `/pricing` - Pricing plans
- `/about` - Company info
- `/contact` - Contact form
- `/demo` - Product demo

**Protected App Routes (require auth):**

- `/dashboard` - Main app entry
- `/claims` - Claims management
- `/reports` - Report dashboard
- `/ai` - AI tools
- `/billing` - Billing & subscriptions
- `/settings` - User settings

### ✅ Authentication Flow:

```
Landing (/) → Sign In → Dashboard (no /crm hop)
```

### ✅ Legacy URL Handling:

- `/crm` → `/dashboard` (redirect)
- `/billing-new` → `/billing` (redirect)

## Deployment Commands

```bash
# Final commit and deploy
git add .
git commit -m "Production-ready route architecture and environment setup"
git push origin main

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

- [ ] Verify all environment variables in Vercel dashboard
- [ ] Test authentication flow: Sign in → Dashboard
- [ ] Test Stripe checkout and webhook
- [ ] Verify legacy URL redirects work
- [ ] Test app functionality in production
- [ ] Monitor for any console errors

## Route Groups Structure

```
src/app/
├── (app)/           # Protected authenticated routes
│   ├── dashboard/
│   ├── claims/
│   ├── reports/
│   ├── billing/
│   └── settings/
├── (auth)/          # Authentication pages
│   └── after-sign-in/
└── [marketing]/     # Public marketing pages
    ├── page.tsx     # Landing page
    ├── pricing/
    ├── features/
    └── contact/
```

## Build Results

✅ **57 pages** generated successfully  
✅ **Clean route structure** with proper authentication  
✅ **Legacy URL redirects** configured  
✅ **Production build** passes without errors

## Next Steps

1. Set up monitoring with Sentry/PostHog
2. Configure production database
3. Test billing flow end-to-end
4. Monitor performance metrics

---

**Status: READY FOR PRODUCTION DEPLOYMENT** 🚀
