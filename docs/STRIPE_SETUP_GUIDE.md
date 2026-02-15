# 🔵 Stripe Setup Guide — $80/Seat Billing for SkaiScraper

> **One-time setup. ~15 minutes. No coding required.**

---

## 📋 What You'll Do

| Step | What                  | Where            | Time  |
| ---- | --------------------- | ---------------- | ----- |
| 1    | Create Stripe account | stripe.com       | 3 min |
| 2    | Create your Product   | Stripe Dashboard | 2 min |
| 3    | Copy your Price ID    | Stripe Dashboard | 1 min |
| 4    | Set up Webhook        | Stripe Dashboard | 3 min |
| 5    | Add env vars          | Vercel Dashboard | 2 min |
| 6    | Test it               | Your app         | 3 min |

---

## Step 1: Create Your Stripe Account

✅ **You already have this** — your test keys are configured:

```
STRIPE_SECRET_KEY=sk_test_51SNDvD...
STRIPE_WEBHOOK_SECRET=whsec_9TWN...
```

To access your dashboard: **https://dashboard.stripe.com**

> ⚠️ You're in **Test Mode** right now (orange "Test mode" banner).
> Stay in test mode until you're ready to charge real money.

---

## Step 2: Create the Seat Product + Price

This is the core of your billing. You're creating ONE product with ONE price.

### In the Stripe Dashboard:

1. Go to **Products** → Click **"+ Add product"**
2. Fill in:
   - **Name:** `SkaiScraper Seat`
   - **Description:** `Per-seat monthly subscription for SkaiScraper platform`
   - **Image:** Upload your logo (optional)
3. Under **Price information:**
   - **Pricing model:** `Standard pricing`
   - **Price:** `$80.00`
   - **Billing period:** `Monthly`
   - **Usage type:** Leave as `Licensed` (default)
4. Click **"Save product"**

### 📸 What it looks like:

```
Product: SkaiScraper Seat
├── Price: $80.00 / month
│   └── ID: price_1RxxxxxxxxxxxxxxxxxxxxZZ  ← THIS IS YOUR PRICE ID
```

---

## Step 3: Copy Your Price ID

After saving the product:

1. Click into the product you just created
2. Under **Pricing**, you'll see your price listed
3. Click on the price row
4. Look for **Price ID** — it looks like: `price_1RxxxxxxxxxxxxxxxxxxxxZZ`
5. Click the copy icon next to it

**Save this!** You'll need it in Step 5.

> 💡 The Price ID always starts with `price_` in test mode and `price_` in live mode.

---

## Step 4: Set Up the Webhook

The webhook tells your app when payments succeed, subscriptions change, or payments fail.

### In the Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Fill in:
   - **Endpoint URL:** `https://skaiscrape.com/api/webhooks/stripe`
   - **Description:** `SkaiScraper production webhook`
4. Under **"Select events to listen to"**, click **"Select events"**
5. Check these events:

| Event                                  | What It Does                             |
| -------------------------------------- | ---------------------------------------- |
| `checkout.session.completed`           | Customer completed checkout              |
| `customer.subscription.created`        | New subscription started                 |
| `customer.subscription.updated`        | Seats changed or renewal                 |
| `customer.subscription.deleted`        | Subscription canceled                    |
| `invoice.payment_succeeded`            | Monthly payment went through             |
| `invoice.payment_failed`               | Payment failed (triggers dunning email)  |
| `invoice.upcoming`                     | Invoice coming soon (trial ending email) |
| `customer.subscription.trial_will_end` | Trial ending notification                |

1. Click **"Add endpoint"**
2. After creating, click **"Reveal"** next to "Signing secret"
3. Copy the webhook signing secret — it looks like: `whsec_xxxxxxxxxxxxxxxxx`

**Save this!** You'll need it in Step 5.

---

## Step 5: Add Environment Variables

### On Vercel:

1. Go to **https://vercel.com** → Your project → **Settings** → **Environment Variables**
2. Add or update these variables:

| Variable                | Value                              | Example              |
| ----------------------- | ---------------------------------- | -------------------- |
| `STRIPE_SECRET_KEY`     | Your secret key                    | `sk_test_51SNDvD...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Step 4 | `whsec_xxxxxxxxx`    |
| `STRIPE_PRICE_ID`       | ⭐ **NEW** — Price ID from Step 3  | `price_1Rxxxxxx`     |

1. Make sure all three are set for **Production**, **Preview**, AND **Development**
2. Click **Save**
3. **Redeploy** your app (Settings → Deployments → Redeploy)

### For local development (.env.local):

Add this line to your `.env.local`:

```
STRIPE_PRICE_ID=price_1RxxxxxxxxxxxxxxxxxxxxZZ
```

---

## Step 6: Test the Flow

### Local Testing with Stripe CLI:

1. Install the Stripe CLI:

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:

   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:

   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

   This gives you a **local webhook secret** — use it as `STRIPE_WEBHOOK_SECRET` in `.env.local`

4. Start your dev server:

   ```bash
   pnpm dev
   ```

5. Go to **http://localhost:3000/settings/billing**

6. Select seats → Click **Subscribe**

7. Use Stripe's test card:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/34`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP:** Any 5 digits (e.g., `85001`)

8. Watch the terminal — you should see webhook events flowing in

---

## 🔄 Going Live (When You're Ready)

When you're ready to charge real money:

1. **Stripe Dashboard** → Click **"Activate payments"** (top banner)
2. Complete Stripe's verification (business info, bank account)
3. **Create the same Product + Price in Live mode** (Stripe keeps test and live separate)
4. Copy the **Live** keys:
   - `sk_live_...` (Secret key)
   - New webhook with `whsec_...` (create webhook for live mode too)
   - `price_...` (Live price ID)
5. Update all three env vars on Vercel with the **Live** values
6. Redeploy

> ⚠️ Test mode and Live mode are completely separate in Stripe.
> Test subscriptions, customers, and payments only exist in test mode.
> You must create the product again in live mode.

---

## 📊 Quick Reference

| What          | Where to Find It                      |
| ------------- | ------------------------------------- |
| Dashboard     | https://dashboard.stripe.com          |
| API Keys      | Dashboard → Developers → API Keys     |
| Products      | Dashboard → Products                  |
| Webhooks      | Dashboard → Developers → Webhooks     |
| Customers     | Dashboard → Customers                 |
| Subscriptions | Dashboard → Billing → Subscriptions   |
| Invoices      | Dashboard → Billing → Invoices        |
| Test Cards    | https://docs.stripe.com/testing#cards |
| Logs          | Dashboard → Developers → Logs         |

---

## 🚨 Troubleshooting

| Problem                          | Fix                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| "STRIPE_PRICE_ID not configured" | Add `STRIPE_PRICE_ID` env var (Step 5)                                                          |
| "Stripe not configured"          | Add `STRIPE_SECRET_KEY` env var                                                                 |
| "Invalid signature" on webhook   | Webhook secret doesn't match — recopy from Stripe                                               |
| Webhook events not arriving      | Check endpoint URL is correct in Stripe Dashboard                                               |
| "Payments disabled during beta"  | The old checkout route has a beta gate — use the new `/api/billing/create-subscription` instead |
| Subscription shows "incomplete"  | Customer hasn't completed payment — check Stripe Dashboard                                      |

---

## 🏗 Architecture Summary

```
User clicks "Subscribe" in /settings/billing
  ↓
POST /api/billing/create-subscription
  ↓ Creates Stripe Customer (if needed)
  ↓ Creates Stripe Subscription (quantity = seatCount)
  ↓ Saves to local Subscription table
  ↓ Returns clientSecret for payment

Stripe processes payment
  ↓
POST /api/webhooks/stripe (webhook)
  ↓ invoice.payment_succeeded → confirms subscription
  ↓ customer.subscription.updated → syncs seat count
  ↓ customer.subscription.deleted → marks canceled

Admin changes seats in /settings/billing
  ↓
POST /api/billing/update-seats
  ↓ Updates Stripe subscription quantity
  ↓ Stripe auto-prorates
  ↓ Updates local Subscription table
```

---

_Last updated: July 2025_
