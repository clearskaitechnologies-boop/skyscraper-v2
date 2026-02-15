/\*\*

- Stripe Configuration Guide
-
- Complete setup instructions for Stripe integration in production
  \*/

# Stripe Production Configuration

## 1. Webhook Endpoint Setup

### In Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://skaiscrape.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.upcoming`

5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### In Vercel:

```bash
# Add webhook secret
echo -n 'whsec_...' | vercel env add STRIPE_WEBHOOK_SECRET production
```

## 2. Environment Variables

### Required Variables:

```bash
# Stripe API Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook Secret (from webhook endpoint setup above)
STRIPE_WEBHOOK_SECRET=whsec_...

# Plan Price IDs (from https://dashboard.stripe.com/products)
STRIPE_PRICE_SOLO=price_...     # Solo plan monthly price ID
STRIPE_PRICE_BUSINESS=price_... # Business plan monthly price ID
STRIPE_PRICE_ENTERPRISE=price_... # Enterprise plan monthly price ID
```

### Add to Vercel:

```bash
# API Keys
echo -n 'sk_live_...' | vercel env add STRIPE_SECRET_KEY production
echo -n 'pk_live_...' | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production

# Price IDs (after creating products)
echo -n 'price_...' | vercel env add STRIPE_PRICE_SOLO production
echo -n 'price_...' | vercel env add STRIPE_PRICE_BUSINESS production
echo -n 'price_...' | vercel env add STRIPE_PRICE_ENTERPRISE production
```

## 3. Create Stripe Products

### Solo Plan:

- Name: "Solo Plan"
- Price: $49/month (or your pricing)
- Metadata:
  - `plan_key`: `solo`
  - `tokens`: `200`

### Business Plan:

- Name: "Business Plan"
- Price: $199/month
- Metadata:
  - `plan_key`: `business`
  - `tokens`: `1200`

### Enterprise Plan:

- Name: "Enterprise Plan"
- Price: $499/month
- Metadata:
  - `plan_key`: `enterprise`
  - `tokens`: `4000`

## 4. Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

## 5. Verify Production Setup

### Check webhook is receiving events:

1. Go to: https://dashboard.stripe.com/webhooks
2. Find your production endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Check Vercel logs for processing confirmation

### Check token seeding:

```sql
-- After successful checkout, verify tokens were credited
SELECT org_id, aiRemaining FROM token_wallet;

-- Check ledger for transaction record
SELECT * FROM tokens_ledger
WHERE kind = 'subscription_activated'
ORDER BY created_at DESC
LIMIT 5;
```

## 6. Monitoring

### Stripe Dashboard:

- Monitor webhook delivery success rate
- Set up alerts for failed deliveries
- Review event logs regularly

### Vercel Logs:

```bash
vercel logs --follow
```

Look for:

- `[STRIPE:WEBHOOK] Processing event: evt_...`
- `[TOKENS] Credited X tokens to org Y`
- `[EMAIL] Sent welcome email to Z`

### Database Queries:

```sql
-- Check recent webhook events
SELECT * FROM webhook_events
ORDER BY created_at DESC
LIMIT 10;

-- Check token transactions
SELECT
  tl.*,
  tw.aiRemaining as current_balance
FROM tokens_ledger tl
JOIN token_wallet tw ON tl.org_id = tw.org_id
ORDER BY tl.created_at DESC
LIMIT 20;
```

## 7. Troubleshooting

### Webhook failures:

- Check Stripe dashboard for error messages
- Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
- Check Vercel deployment logs
- Ensure webhook endpoint is publicly accessible

### Token not crediting:

- Check Stripe event metadata includes `plan_key`
- Verify product metadata is correct
- Check `tokens_ledger` table for failed transactions
- Review Sentry for errors

### Email not sending:

- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for delivery logs
- Review email templates for errors
- Check Vercel function logs

## 8. Security Checklist

- [ ] Webhook secret configured
- [ ] API keys are `live_` not `test_`
- [ ] Webhook signature verification enabled
- [ ] Idempotency checking in place
- [ ] Error tracking configured (Sentry)
- [ ] Rate limiting on webhook endpoint (optional)
- [ ] Database transactions for token credits
- [ ] Audit logging for all token changes

## 9. Go-Live Checklist

- [ ] All environment variables set in production
- [ ] Webhook endpoint added to Stripe dashboard
- [ ] Products created with correct metadata
- [ ] Test checkout flow end-to-end
- [ ] Verify token seeding works
- [ ] Verify welcome emails send
- [ ] Monitor webhook success rate > 99%
- [ ] Set up alerts for payment failures
- [ ] Document subscription cancellation flow
- [ ] Train support team on common issues

## 10. Post-Launch Monitoring

### Week 1:

- Check webhook success rate daily
- Monitor token balance accuracy
- Review customer feedback
- Check email delivery rates

### Ongoing:

- Review failed webhooks weekly
- Monitor token consumption patterns
- Adjust limits based on usage
- Update plan pricing as needed

---

**Resources:**

- Stripe Webhooks: https://stripe.com/docs/webhooks
- Stripe Products: https://stripe.com/docs/products-prices/overview
- Testing: https://stripe.com/docs/testing
- Dashboard: https://dashboard.stripe.com
