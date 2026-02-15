# Full Access Stripe Setup Guide

This guide walks through creating the Full Access subscription product in Stripe.

## Prerequisites

- Stripe account with API keys configured
- Access to Stripe Dashboard

## Step 1: Create Product in Stripe Dashboard

### Test Mode

1. Go to **Products** → **Add product**
2. Fill in details:
   - **Name**: `Full Access - Trades Network`
   - **Description**: `Unlimited messaging on the Trades Network. Post job opportunities, send unlimited messages without token costs. AI tools still use tokens.`
   - **Pricing model**: `Standard pricing`
   - **Price**: `$9.99 USD`
   - **Billing period**: `Monthly`
   - **Recurring**: `Yes`
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)
5. Add to `.env` or environment variables:
   ```bash
   STRIPE_FULL_ACCESS_PRICE_ID=price_1234567890abcdef
   ```

### Production Mode

Repeat the above steps in **Production mode** when ready to go live.

## Step 2: Configure Webhook

The existing Stripe webhook handler has been updated to handle Full Access subscriptions.

### Webhook Events

Ensure your webhook endpoint (`/api/webhooks/stripe`) is configured to receive:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `checkout.session.completed`

### Webhook URL

- **Test**: `https://your-domain.com/api/webhooks/stripe`
- **Production**: `https://your-production-domain.com/api/webhooks/stripe`

## Step 3: Database Migration

Run the Trades Network migration to create the `tn_memberships` table:

```bash
psql "$DATABASE_URL" -f ./db/migrations/20241103_trades_network_complete.sql
```

Or copy/paste the SQL directly in your Supabase SQL Editor.

## Step 4: Test Subscription Flow

### Test Checkout

1. Navigate to `/billing` on your app
2. Click "Get Full Access" in the Full Access card
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout

### Verify Webhook Processing

Check your application logs for:

```
[FULL_ACCESS] customer.subscription.created - User <userId>: ACTIVE until <date>
```

### Verify Database

Query the database to confirm membership:

```sql
SELECT * FROM tn_memberships WHERE user_id = '<userId>';
```

Expected result:

- `full_access`: `true`
- `expires_at`: `<current_period_end>`
- `stripe_subscription_id`: `sub_1234567890abcdef`

### Test Messaging Features

1. Navigate to `/network/opportunities`
2. Apply to an opportunity
3. Verify **no token cost** message appears
4. Send a message
5. Confirm no tokens were deducted

## Step 5: Test Cancellation Flow

1. Navigate to `/billing`
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Check webhook logs:
   ```
   [FULL_ACCESS] Subscription deleted - User <userId>: DEACTIVATED
   ```

## Step 6: Production Deployment

1. Switch Stripe to **Production mode**
2. Create production Full Access product (same as test)
3. Update environment variables:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_FULL_ACCESS_PRICE_ID=price_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```
4. Configure production webhook endpoint
5. Test with real payment method

## API Endpoints

### Subscribe to Full Access

```bash
POST /api/trades/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "ok": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Get Membership Status

```bash
GET /api/trades/membership

Response:
{
  "ok": true,
  "hasFullAccess": true,
  "expiresAt": "2024-12-03T12:00:00Z",
  "stripeSubscriptionId": "sub_1234567890"
}
```

### Cancel Subscription

```bash
POST /api/trades/cancel-subscription

Response:
{
  "ok": true,
  "message": "Subscription will cancel at end of billing period"
}
```

## Webhook Handler Logic

The webhook handler (`/api/webhooks/stripe`) processes these events:

### `customer.subscription.created` / `updated`

```typescript
// Checks metadata.product === "full_access"
// Upserts tn_memberships record:
INSERT INTO tn_memberships (user_id, full_access, expires_at, stripe_subscription_id)
VALUES (...) ON CONFLICT (user_id) DO UPDATE ...
```

### `customer.subscription.deleted`

```typescript
// Sets full_access = false
UPDATE tn_memberships SET full_access = false, expires_at = NOW() WHERE user_id = ...
```

## Troubleshooting

### Subscription not activating

1. Check webhook logs in Stripe Dashboard → Developers → Webhooks
2. Verify event has `metadata.product = "full_access"` and `metadata.userId`
3. Check application logs for `[FULL_ACCESS]` entries
4. Query database: `SELECT * FROM tn_memberships WHERE user_id = '<userId>'`

### Token still being deducted

1. Verify `has_full_access()` function returns `true`:
   ```sql
   SELECT has_full_access('<userId>');
   ```
2. Check `expires_at` is in the future
3. Verify API routes are calling `has_full_access()` before token deduction

### Webhook signature verification failing

1. Verify `STRIPE_WEBHOOK_SECRET` is correct for the environment (test vs prod)
2. Check webhook endpoint is receiving raw request body (not parsed JSON)
3. Stripe Dashboard → Webhooks → Click webhook → View recent deliveries

## Environment Variables

Required:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FULL_ACCESS_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://...
```

## Testing Checklist

- [ ] Product created in Stripe
- [ ] Price ID added to environment
- [ ] Webhook configured and receiving events
- [ ] Database migration applied
- [ ] Test checkout flow completes
- [ ] Webhook creates membership record
- [ ] Messaging features don't charge tokens
- [ ] Cancel subscription works
- [ ] Production product created (when ready)
- [ ] Production webhook configured (when ready)

## Support

If you encounter issues:

1. Check Stripe Dashboard → Logs
2. Check application logs for `[FULL_ACCESS]` entries
3. Verify database state: `SELECT * FROM tn_memberships`
4. Test `has_full_access()` function directly in SQL

## Pricing Strategy

Current pricing: **$9.99/month**

Considerations:

- Messaging costs 1 token ($1) per first message
- Heavy users (10+ messages/month) save money
- Unlimited opportunity posting is premium feature
- AI tools still cost tokens (keeps AI usage sustainable)

## Future Enhancements

- Annual plan with discount ($99/year = 17% off)
- Team plans (shared Full Access for organizations)
- Free trial (7 days)
- Promo codes for early adopters
- Affiliate program for contractors
