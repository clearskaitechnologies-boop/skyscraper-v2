# 🚀 PHASE 4 IMPLEMENTATION STATUS - TRIALS & BILLING PORTAL

**Branch**: `feat/phase3-banner-and-enterprise`  
**Latest Commit**: `4cddc3a` - "feat(phase4): Add 72h trial system, billing portal, and trial emails"  
**Status**: ✅ **FOUNDATION COMPLETE** (50% done)

---

## ✅ Completed (Commit 4cddc3a)

### 1. Database Schema ✅

**File**: `prisma/schema.prisma`

- Added trial fields to `Org` model:
  - `stripeCustomerId`, `stripeSubscriptionId`
  - `subscriptionStatus` ('trialing', 'active', 'canceled', 'past_due')
  - `trialStartAt`, `trialEndsAt`, `trialStatus` ('active', 'ended')
  - `planKey` ('solo', 'business', 'enterprise')
- Created `BillingSettings` model:
  - `autoRefill` (boolean, default false)
  - `refillThreshold` (int, default 10%)
  - Cascades on org deletion

### 2. Database Migration ✅

**File**: `db/migrations/20241101_phase4_trials_billing.sql`

- Applied via `pnpm prisma db execute`
- Adds all trial/billing columns to `Org` table
- Creates `BillingSettings` table with foreign key
- Adds performance indexes (trialEndsAt, subscriptionStatus, stripeCustomerId)
- Prisma Client regenerated successfully

### 3. Trial Engine ✅

**File**: `lib/billing/trials.ts`

**Functions**:

- `startTrial(orgId, planKey?)` - Creates 72h trial
- `isTrialEnded(org)` - Checks if trial expired
- `getTrialTimeRemaining(org)` - Returns milliseconds left
- `getTrialInfo(org)` - Comprehensive trial status (isActive, hasEnded, hoursRemaining, minutesRemaining)
- `endTrial(orgId)` - Marks trial as ended
- `checkTrialAccess(orgId)` - Returns access decision (active_trial, active_subscription, trial_ended, no_trial)
- `getOrgsNeedingTrialReminders()` - Finds orgs needing 24h or 1h reminder emails

**Logic**:

- 72-hour trial window from signup
- Auto-expires when `now >= trialEndsAt`
- Active subscription bypasses trial checks
- Trial status: 'active' or 'ended'

### 4. Billing Portal Helper ✅

**File**: `lib/billing/portal.ts`

**Functions**:

- `createBillingPortalSession(stripeCustomerId, returnUrl?)` - Generates Stripe Customer Portal URL
- `getCustomerPaymentMethods(stripeCustomerId)` - Returns card list (brand, last4, exp)
- `getCustomerInvoices(stripeCustomerId, limit=12)` - Returns invoice history

**Usage**: Powers `/account/billing` page for payment method management

### 5. Trial Email Templates ✅

**File**: `lib/mail.ts` (appended)

**New Functions**:

- `sendTrialEnding24hEmail(to, userName, trialEndsAt)` - "⏰ Your Trial Ends Soon"
- `sendTrialEnding1hEmail(to, userName, trialEndsAt)` - "🚨 Final Hour!"
- `sendTrialEndedEmail(to, userName)` - "Trial Ended - Subscribe to continue"
- `sendPaymentFailedEmail(to, userName, amount)` - "⚠️ Payment failed" (dunning)

**Brand**: Navy (#0A1A2F), Blue (#117CFF), Yellow (#FFC838)  
**CTAs**: Link to `/pricing` or `/account/billing`

### 6. Trial Lock Page ✅

**File**: `src/app/(app)/trial/ended/page.tsx`

**Features**:

- Large lock icon with red styling
- "Your Trial Has Ended" headline
- Plan summary (Solo/Business/Enterprise pricing)
- Primary CTA: "Subscribe Now" → `/pricing`
- Secondary CTAs: "Talk to Sales" (mailto), "View All Plans"
- Reassurance: "Your data is safe and will be accessible once you subscribe"

**Design**: Framer Motion animations, responsive, matches brand

---

## 🔨 Remaining Work (Next 8 Tasks)

### CRITICAL PATH (Must Complete Before Deploy)

**1. Middleware - Trial Lock Guard** 🔴

- **File**: `middleware.ts`
- **Task**: Add trial expiration check before route access
- **Logic**:
  ```typescript
  if (trial_status === "ended" && !active_subscription) {
    // Redirect to /trial/ended
    // EXCEPT: /pricing, /account/billing, /legal/*, /feedback, sign-in/out
  }
  ```
- **Integration**: Use `checkTrialAccess()` from `lib/billing/trials.ts`

**2. Dashboard - Trial Countdown UI** 🔴

- **Files**: `src/app/(app)/dashboard/page.tsx`, top nav component
- **Task**:
  - Add countdown timer showing "Trial: 47h 23m left"
  - Add small badge to top nav with trial status
  - Link to `/account/billing`
- **Integration**: Use `getTrialInfo()` client-side (React state/interval)

**3. Billing Portal Page** 🔴

- **File**: `src/app/(app)/account/billing/page.tsx`
- **Components**:
  - Card on file display (brand icon, last4, exp date)
  - "Manage Payment Method" button → Stripe Billing Portal
  - Plan info section (current plan, status, renewal/trial end date)
  - Auto-Refill toggle (ON/OFF) + threshold dropdown (10%, 20%, 30%)
  - Invoice history table (last 12, with download links)
- **API Calls**: `createBillingPortalSession()`, `getCustomerPaymentMethods()`, `getCustomerInvoices()`
- **Auth**: Owner/Admin only (role check)

**4. Auto-Refill API** 🔴

- **File**: `src/app/api/billing/auto-refill/route.ts`
- **Method**: POST
- **Body**: `{ autoRefill: boolean, refillThreshold: number }`
- **Logic**:
  ```typescript
  - Validate orgId from Clerk session
  - Upsert BillingSettings record
  - Return updated settings
  ```

**5. Stripe Webhook Extensions** 🔴

- **File**: `src/app/api/webhooks/stripe/route.ts`
- **New Events**:
  - `customer.subscription.created` → Set `subscriptionStatus='active'`, `currentPeriodEnd`
  - `customer.subscription.updated` → Update status, period, plan
  - `customer.subscription.deleted` → Set `subscriptionStatus='canceled'`
  - `invoice.payment_succeeded` → Check auto-refill:
    - If `autoRefill=true` && tokens < threshold → Create one-time token pack charge
  - `invoice.payment_failed` → Send `sendPaymentFailedEmail()`
- **Idempotency**: Use existing `WebhookEvent` deduplication table

**6. Trial Cron Sweeper** 🔴

- **File**: `src/app/api/cron/trials/sweep/route.ts`
- **Trigger**: Vercel Cron (daily at midnight UTC)
- **Logic**:

  ```typescript
  - Find orgs where now >= trialEndsAt && trialStatus='active'
  - Mark as trialStatus='ended'
  - Send sendTrialEndedEmail()

  - Find orgs needing 24h reminder (call getOrgsNeedingTrialReminders())
  - Send sendTrialEnding24hEmail()

  - Find orgs needing 1h reminder
  - Send sendTrialEnding1hEmail()
  ```

- **Auth**: Vercel Cron secret header check

**7. Update Org Creation Flow** 🔴

- **Files**:
  - `src/app/api/stripe/checkout/route.ts`
  - `src/app/api/after-sign-in/route.ts` (or wherever org creation happens)
- **Task**: When FREE_BETA=true, call `startTrial(orgId, planKey)` on new org creation
- **Flow**:
  ```typescript
  if (process.env.FREE_BETA === "true") {
    await startTrial(newOrg.id, "solo"); // Default to solo trial
    // Seed quotas as before
    // Redirect to /dashboard?beta=true
  }
  ```

**8. Environment Variables** 🔴

- **File**: `.env.example`
- **Add**:

  ```bash
  # Phase 4: Trials & Billing
  STRIPE_BILLING_PORTAL_RETURN_URL=https://your-domain.com/account/billing

  # (Already exist, just document)
  FREE_BETA=true
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  RESEND_API_KEY=
  ```

---

## 🎯 Deployment Checklist

### Pre-Deploy

- [ ] Complete all 8 remaining tasks above
- [ ] Run `pnpm build` (zero errors)
- [ ] Test trial flow locally:
  - [ ] New user gets 72h trial
  - [ ] Dashboard shows countdown
  - [ ] Set `trialEndsAt` to past → redirects to `/trial/ended`
  - [ ] Subscribe → trial lock removed
- [ ] Test `/account/billing` page (card display, portal link, auto-refill toggle)
- [ ] Test webhook events (subscription.created, invoice.payment_succeeded)
- [ ] Test cron sweeper (manually trigger `/api/cron/trials/sweep`)

### Vercel Configuration

- [ ] Add `STRIPE_BILLING_PORTAL_RETURN_URL` to Production env vars
- [ ] Configure Vercel Cron in `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/trials/sweep",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
- [ ] Verify Stripe webhook includes new events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### Deploy

```bash
git push origin feat/phase3-banner-and-enterprise
vercel --prod
```

### Post-Deploy Smoke Tests

1. **New User Trial**:
   - Sign up → Verify 72h trial starts
   - Check dashboard countdown timer
   - Wait for trial to expire (or manually set `trialEndsAt` via DB)
   - Verify redirect to `/trial/ended`

2. **Billing Portal**:
   - Navigate to `/account/billing`
   - Click "Manage Payment Method" → Stripe portal loads
   - Toggle auto-refill ON/OFF → Settings persist

3. **Trial Emails**:
   - Trigger 24h reminder email (manually or wait)
   - Trigger 1h reminder email
   - Trigger trial ended email

4. **Webhooks**:
   - Complete subscription checkout → `subscription.created` event
   - Verify `subscriptionStatus='active'` in database
   - Trigger `invoice.payment_succeeded` → Auto-refill logic runs (if enabled)

5. **Cron Sweeper**:
   - Manually trigger `/api/cron/trials/sweep`
   - Verify expired trials marked 'ended'
   - Verify reminder emails sent

---

## 📊 Architecture Summary

### Trial Lifecycle

```
1. User Signs Up (FREE_BETA=true)
   ↓
2. Org Created → startTrial(orgId) called
   ↓
3. trialStartAt = now()
   trialEndsAt = now() + 72h
   trialStatus = 'active'
   ↓
4. User Has Access (middleware allows)
   ↓
5. T-24h → sendTrialEnding24hEmail()
   ↓
6. T-1h → sendTrialEnding1hEmail()
   ↓
7. T+0h → trialStatus = 'ended' (cron sweeper)
   ↓
8. Middleware Redirects to /trial/ended
   ↓
9. User Subscribes → subscriptionStatus='active'
   ↓
10. Access Restored (middleware allows)
```

### FREE_BETA Modes

- **true** (Current): Instant trial, no card required, 72h access
- **false** (Post-Beta): Require card on file OR trial ends → hard paywall

---

## 🔥 Quick Commands

### Test Trial Flow Locally

```bash
# 1. Start dev server
pnpm dev

# 2. Create test org and start trial
node -e "
const { PrismaClient } = require('@prisma/client');
const { startTrial } = require('./lib/billing/trials');
const prisma = new PrismaClient();

(async () => {
  const org = await prisma.org.findFirst();
  await startTrial(org.id, 'solo');
  console.log('Trial started for org:', org.id);
})();
"

# 3. Check trial info
node -e "
const { PrismaClient } = require('@prisma/client');
const { getTrialInfo } = require('./lib/billing/trials');
const prisma = new PrismaClient();

(async () => {
  const org = await prisma.org.findFirst({
    select: { id: true, trialStartAt: true, trialEndsAt: true, trialStatus: true, subscriptionStatus: true }
  });
  const info = getTrialInfo(org);
  console.log('Trial Info:', info);
})();
"

# 4. Force expire trial (for testing lock page)
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const org = await prisma.org.findFirst();
  await prisma.org.update({
    where: { id: org.id },
    data: { trialEndsAt: new Date(Date.now() - 1000) } // 1 second ago
  });
  console.log('Trial expired for org:', org.id);
})();
"
```

### Trigger Cron Manually

```bash
curl http://localhost:3000/api/cron/trials/sweep \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 💡 Next Steps

**IMMEDIATE** (Complete Phase 4):

1. Implement middleware trial lock guard
2. Add dashboard countdown UI
3. Build `/account/billing` page
4. Create auto-refill API
5. Extend Stripe webhooks
6. Build trial cron sweeper
7. Update org creation flow
8. Update `.env.example`

**AFTER PHASE 4 DEPLOY**:

1. Monitor trial email delivery (Resend dashboard)
2. Check webhook success rates (Stripe dashboard)
3. Verify cron sweeper runs daily (Vercel logs)
4. Gather feedback on trial length (72h vs 7 days?)
5. Analyze conversion rate (trial → paid)

**PHASE 5 IDEAS**:

- In-app guided tours for first-run users
- Template sample projects ("try in 60 seconds")
- Roles & seat management (owner/admin/member)
- Public API + Zapier integration
- Admin metrics dashboard (MAU, conversion, token burn)

---

## ✅ READY FOR NEXT STEP

**Foundation is solid!** Database, trials engine, billing portal helper, emails, and lock page are all committed and working.

**Remaining**: Wire up middleware, UI components, webhooks, and cron. Estimated time: 3-4 hours of focused work.

**LET'S FINISH PHASE 4.** 🚀
