# 🚀 Production Deployment Checklist

## Pre-Deploy Setup

### 1. Domain Authentication (Resend)

- [ ] Add domain in Resend dashboard
- [ ] Add DNS records:
  - [ ] SPF: `v=spf1 include:_spf.resend.com ~all`
  - [ ] DKIM: (provided by Resend)
  - [ ] DMARC: `v=DMARC1; p=none; rua=mailto:postmaster@your-domain.com`
- [ ] Verify domain shows "Verified" status in Resend

### 2. Vercel Environment Variables

Copy from `.env.production.template` and update:

- [ ] `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- [ ] `STRIPE_SECRET_KEY=sk_live_...` (LIVE mode)
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...` (from step 3)
- [ ] `RESEND_API_KEY=re_...`
- [ ] `EMAIL_FROM="Your Brand <no-reply@your-domain.com>"`

### 3. Stripe Production Webhook

- [ ] Stripe Dashboard → Developers → Webhooks → Add endpoint
- [ ] URL: `https://your-domain.com/api/webhooks/stripe`
- [ ] Events:
  - [ ] `invoice.upcoming`
  - [ ] `customer.subscription.trial_will_end`
  - [ ] `checkout.session.completed`
- [ ] Copy Signing Secret → Update `STRIPE_WEBHOOK_SECRET` in Vercel

## Deploy

### 4. Database Migration

```bash
# Apply any pending Prisma migrations
npx prisma db push
```

### 5. Deploy to Production

```bash
# Deploy to Vercel
vercel --prod
```

## Post-Deploy Validation (5-minute check)

### 6. Health Checks

- [ ] Run VS Code task: "Production: Health Check"
- [ ] Run VS Code task: "Production: Test Webhook" (should return 400 - confirms endpoint live)
- [ ] Verify webhook endpoint in Stripe shows recent 200 responses

### 7. Email Testing

- [ ] Create test customer with your email in Stripe LIVE mode
- [ ] Complete checkout with trial
- [ ] Manually trigger `invoice.upcoming` from Stripe webhook logs
- [ ] Verify emails:
  - [ ] Welcome email received and renders correctly
  - [ ] Trial ending email received and renders correctly
  - [ ] Links work (billing, dashboard)

### 8. Monitoring Setup

- [ ] Vercel → Functions → Alerts: Set alert on non-200 responses for `/api/webhooks/stripe`
- [ ] Stripe → Webhooks → Settings: Enable email alerts on repeated failures
- [ ] Resend → Settings: Configure bounce/complaint forwarding

### 9. Email Deliverability

- [ ] Test emails in Gmail, iOS Mail, Outlook
- [ ] Check spam folder (should not be there)
- [ ] Verify DMARC reports arrive at postmaster@your-domain.com

## Week 1 Follow-up

### 10. DMARC Hardening

After 7 days of 0% issues:

- [ ] Update DMARC policy: `p=quarantine` or `p=reject`
- [ ] Monitor DMARC reports for any legitimate mail being affected

### 11. Observability Review

- [ ] Review webhook success rates in Stripe dashboard
- [ ] Check Vercel function logs for any [EMAIL:*] errors
- [ ] Verify no bounce/complaint notifications in ops inbox

## Nice-to-Have Improvements

### 12. Enhanced Features

- [ ] Add email settings page (marketing vs transactional opt-ins)
- [ ] Add per-tenant branding (logo from org profile)
- [ ] Add UTM parameters to email links for analytics
- [ ] Set up Stripe Customer Portal integration for billing links

---

## Emergency Rollback Plan

If issues arise:

1. Disable webhook in Stripe Dashboard (stops new email triggers)
2. Revert to previous Vercel deployment
3. Check logs: `vercel logs --production`
4. Test locally: Use `/dev/email-preview` to debug templates
