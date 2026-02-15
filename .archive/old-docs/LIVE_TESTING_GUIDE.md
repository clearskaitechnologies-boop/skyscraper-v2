# 🧪 SkaiScraper Production Testing Suite

## Live Stripe Testing Checklist

### 1. Stripe Checkout Flow ✅

```bash
# Test Solo plan checkout
curl -X POST https://skaiscraper.app/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_solo_monthly", "mode": "subscription"}'

# Expected: Redirect to Stripe checkout
# On completion: webhook should fire and update org plan + tokens
```

### 2. Webhook Verification ✅

```bash
# Check webhook was processed
curl https://skaiscraper.app/api/org/status \
  -H "Authorization: Bearer CLERK_USER_TOKEN"

# Expected Response:
{
  "plan": "Solo",
  "tokensRemaining": {
    "ai": 10,
    "dolCheck": 5,
    "dolFull": 2
  },
  "walletBalance": "$0.00"
}
```

### 3. Token Pack Purchase ✅

```bash
# Test $25 top-up with 5% bonus
curl -X POST https://skaiscraper.app/api/billing/token-pack/checkout \
  -H "Content-Type: application/json" \
  -d '{"packSlug": "pack_25", "amountCents": 2500}'

# Expected: $26.25 credited to wallet (5% bonus)
```

### 4. Token Enforcement Testing ✅

```bash
# Test AI mockup (should work 1-3 times on Solo)
curl -X POST https://skaiscraper.app/api/wallet/spend \
  -H "Content-Type: application/json" \
  -d '{"action": "aiMockup", "correlationId": "test_1"}'

# Expected: success for first 3, then 402 error
```

### 5. Low Balance Warning ✅

```bash
# Set wallet to low amount
curl -X POST https://skaiscraper.app/api/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{"amountCents": 300, "grantBonus": false}'

# Check dashboard shows warning
curl https://skaiscraper.app/api/wallet/balance

# Expected:
{
  "balanceCents": 300,
  "balanceDollars": "3.00",
  "showLowBalanceWarning": true
}
```

## Customer Portal Testing ✅

### Plan Changes

1. Go to `/billing`
2. Click "Manage Subscription"
3. Upgrade Solo → Business
4. Verify: webhook updates plan + quota refresh

### Subscription Cancellation

1. Cancel subscription in portal
2. Verify: `customer.subscription.deleted` webhook
3. Plan should downgrade to Free tier

## Production Monitoring Setup

### Error Tracking

```typescript
// Add to app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics Events

```typescript
// Add to lib/analytics.ts
import { PostHog } from "posthog-node";

export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: "https://app.posthog.com",
});

// Track key events:
posthog.capture("subscription_activated", { plan, userId });
posthog.capture("wallet_topup", { amount, bonus, userId });
posthog.capture("action_blocked_low_balance", { action, balance });
```

## Health Checks

### API Endpoints

```bash
# Database connectivity
curl https://skaiscraper.app/api/health

# Stripe connection
curl https://skaiscraper.app/api/health/stripe

# Full system check
curl https://skaiscraper.app/api/health/summary
```

### Uptime Monitoring

```yaml
# Set up with UptimeRobot/BetterStack
monitors:
  - url: https://skaiscraper.app/api/health/live
    interval: 1m
    timeout: 30s
  - url: https://skaiscraper.app/api/health/ready
    interval: 5m
```

## Backup & Recovery

### Database Backups

```sql
-- Set up daily snapshots via Supabase/Vercel Postgres
-- Retention: 30 days for daily, 90 days for weekly
```

### File Storage Lifecycle

```yaml
# R2/S3 lifecycle policy
rules:
  - transition_days: 30
    storage_class: IA
  - expiration_days: 90
    delete: true
```

## Production Deployment

### Environment Variables

```bash
# Core App
NEXT_PUBLIC_APP_URL=https://skaiscraper.app
NODE_ENV=production

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
CRON_SECRET=random_secure_string

# Database
DATABASE_URL=postgres://...
```

### Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/wallet/reset-monthly",
      "schedule": "5 0 1 * *"
    },
    {
      "path": "/api/health/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Testing Commands

### Manual Testing Sequence

```bash
# 1. Test checkout flow
open https://skaiscraper.app/pricing

# 2. Complete Solo subscription
# 3. Test AI mockup generation (3x)
curl -X POST /api/wallet/spend -d '{"action":"aiMockup"}'

# 4. Test 402 on 4th attempt
# 5. Purchase $25 top-up pack
# 6. Test wallet balance shows bonus
curl /api/wallet/balance

# 7. Test weather report ($8.99 deduction)
curl -X POST /api/wallet/spend -d '{"action":"weatherReport"}'

# 8. Verify low balance warning at <$5
```

### Automated Testing

```typescript
// tests/billing.test.ts
describe("Billing Integration", () => {
  it("processes Solo subscription correctly", async () => {
    // Mock Stripe webhook
    // Verify org plan update
    // Check token allocation
  });

  it("enforces spending limits", async () => {
    // Set low balance
    // Attempt expensive action
    // Expect 402 response
  });
});
```

## Success Metrics

✅ **Checkout Conversion**: >85% complete Stripe flow  
✅ **Webhook Reliability**: >99.5% successful processing  
✅ **Token Enforcement**: 0% unauthorized spending  
✅ **Low Balance UX**: >60% top-up after warning  
✅ **System Uptime**: >99.9% availability

---

**Status: READY FOR LIVE TESTING** 🚀
