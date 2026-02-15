# Billing Price Map — Stripe Price IDs

This document maps Stripe price IDs to SkaiScraper plans, quotas, and token packs.

## Subscription Plans

### SOLO — $29.99/month

- **Stripe Product ID**: `prod_solo` (set in Stripe Dashboard)
- **Stripe Price ID**: `price_solo_monthly` (set as `NEXT_PUBLIC_PRICE_SOLO`)
- **Quotas**:
  - 1 seat
  - 3 AI Mockups/month
  - 3 Quick DOL Pulls/month
  - 2 Weather Verification Reports/month
- **Overage**:
  - AI Mockup: +$0.99
  - DOL Pull: +$0.99
  - Weather Report: +$8.99

### BUSINESS — $139.99/month (Most Popular)

- **Stripe Product ID**: `prod_business`
- **Stripe Price ID**: `price_business_monthly` (set as `NEXT_PUBLIC_PRICE_BUSINESS`)
- **Quotas**:
  - 10 seats
  - 10 AI Mockups/month
  - 10 Quick DOL Pulls/month
  - 7 Weather Verification Reports/user/month
- **Overage**: Same as SOLO

### ENTERPRISE — $399/month

- **Stripe Product ID**: `prod_enterprise`
- **Stripe Price ID**: `price_enterprise_monthly` (set as `NEXT_PUBLIC_PRICE_ENTERPRISE`)
- **Quotas**:
  - 25 seats
  - 25 AI Mockups/month
  - 25 Quick DOL Pulls/month
  - 15 Weather Verification Reports/user/month
- **Overage**: Same as SOLO
- **Custom**: Contact sales for unlimited plans

---

## Token Packs (One-Time Purchase)

### Starter Pack — $9.99

- **Tokens**: 10
- **Stripe Product ID**: `prod_token_pack_starter`
- **Stripe Price ID**: `price_token_pack_starter` (set as `NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID`)

### Pro Pack — $39.99

- **Tokens**: 50
- **Stripe Product ID**: `prod_token_pack_pro`
- **Stripe Price ID**: `price_token_pack_pro` (set as `NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID`)

### Enterprise Pack — $149.99

- **Tokens**: 200
- **Stripe Product ID**: `prod_token_pack_enterprise`
- **Stripe Price ID**: `price_token_pack_enterprise` (set as `NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID`)

---

## Webhook Price ID Mapping

When processing `checkout.session.completed` events, map `price_id` to token credits:

```typescript
const PRICE_ID_TO_TOKENS: Record<string, number> = {
  [process.env.NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID!]: 10,
  [process.env.NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID!]: 50,
  [process.env.NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID!]: 200,
};
```

---

## Trial Configuration

### 3-Day Free Trial

- **Trial Period**: 3 days (`trial_period_days=3` in Stripe checkout)
- **Starter Tokens**: 5 tokens granted on trial start
- **Conversion**: After 3 days, billing begins automatically
- **Cancellation**: User keeps data but loses premium features

### Subscription Status Mapping

- `trialing` → Trial active, grant starter tokens
- `active` → Paid subscription, full quotas
- `past_due` → Grace period, notify user
- `canceled` → Retain data, restrict features
- `incomplete` → Payment failed, retry

---

## Environment Variables (Production)

Add these to Vercel → Settings → Environment Variables → Production:

```bash
# Subscription Plans
NEXT_PUBLIC_PRICE_SOLO=price_XXX
NEXT_PUBLIC_PRICE_BUSINESS=price_XXX
NEXT_PUBLIC_PRICE_ENTERPRISE=price_XXX

# Token Packs
NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID=price_XXX
NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID=price_XXX
NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID=price_XXX

# Stripe Keys
STRIPE_SECRET_KEY=sk_live_XXX
STRIPE_WEBHOOK_SECRET=whsec_XXX
```

---

## Testing (Test Mode)

Use Stripe test price IDs during development:

- Test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## Quota Reset

Quotas reset on the billing cycle anniversary (monthly):

- Solo/Business/Enterprise: Reset on the day of the month subscription started
- Example: Subscribed on Jan 15 → quotas reset on Feb 15, Mar 15, etc.
- No rollover of unused quotas

---

## Token Balance

Tokens purchased via packs:

- **Never expire**
- **Do not reset monthly**
- **Shared across organization**
- **Used when quota is exhausted**

Formula:

```
Available = Monthly Quota + Token Balance
```

If user has 2 Weather Reports (quota) + 10 tokens:

- First 2 WVRs use quota
- 3rd WVR uses 1 token (consumes from balance)
- Tokens remain until used

---

_Last Updated: October 31, 2025_
