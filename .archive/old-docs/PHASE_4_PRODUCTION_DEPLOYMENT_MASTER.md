# 🚀 PHASE 4 PRODUCTION DEPLOYMENT MASTER CHECKLIST

**Status**: ✅ All code complete and committed  
**Branch**: `feat/phase3-banner-and-enterprise`  
**Latest Commit**: `95521d1` - Email lazy-loading fixes  
**Build Status**: ✅ PASSING (`pnpm build` succeeds)  
**TypeScript**: ✅ PASSING (0 errors)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Readiness

- [x] Phase 4 core features merged (webhooks, cron, trials, billing portal)
- [x] Email lazy-loading implemented (safeSendEmail)
- [x] Firebase Admin lazy-loading (no build-time crashes)
- [x] OpenAI client lazy-loading (no build-time crashes)
- [x] Database migrations applied (sentTrialT24, sentTrialT1 flags)
- [x] Build passes without env vars present
- [x] TypeScript compilation: 0 errors

### ⏳ Environment Variables (CRITICAL - Do First)

Navigate to: **https://vercel.com → PreLossVision → Settings → Environment Variables**  
Set for **Production** environment:

#### 🔐 Stripe (CRITICAL)

```bash
STRIPE_SECRET_KEY=sk_live_...                    # Live Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...                  # Get after webhook setup (Step 5)
STRIPE_PRICE_SOLO=price_...                      # Solo plan monthly price ID
STRIPE_PRICE_BUSINESS=price_...                  # Business plan monthly price ID
STRIPE_PRICE_ENTERPRISE=price_...                # Enterprise plan monthly price ID
STRIPE_TOPUP_100=price_...                       # 100 token pack price ID
STRIPE_TOPUP_500=price_...                       # 500 token pack price ID
STRIPE_TOPUP_2000=price_...                      # 2000 token pack price ID
STRIPE_TOKEN_PACK_PRICE_100=price_1QYCX8...      # ✅ Already set (confirmed)
STRIPE_BILLING_PORTAL_RETURN_URL=https://skaiscrape.com/account/billing
```

#### 📧 Email (NEW - Required)

```bash
RESEND_API_KEY=re_...                            # Resend production API key
EMAIL_FROM=SkaiScraper <no-reply@skaiscrape.com> # Default sender address
```

#### 🔑 Core System

```bash
FREE_BETA=true                                   # Enable free trials (flip to false post-beta)
CRON_SECRET=<random-32-character-string>         # Secure cron endpoints
DATABASE_URL=postgres://...                      # Primary database
SHADOW_DATABASE_URL=postgres://...               # Prisma migrations shadow DB
```

#### 🤖 AI & Firebase

```bash
OPENAI_API_KEY=sk-...                            # OpenAI API key (GPT-4, etc.)
FIREBASE_SERVICE_ACCOUNT_KEY=<json-string>       # Firebase service account JSON (escaped)
SUPABASE_URL=https://...                         # Supabase project URL
SUPABASE_ANON_KEY=eyJ...                         # Supabase anon/public key
```

#### 🔍 Optional (Already Set)

```bash
NEXT_PUBLIC_SITE_URL=https://skaiscrape.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
SENTRY_DSN=https://...
```

---

## 🚢 DEPLOYMENT STEPS

### Step 1: Verify Local Build

```bash
cd /Users/admin/Downloads/preloss-vision-main
pnpm prisma generate
npx tsc --noEmit            # Expect: 0 errors
pnpm build                  # Expect: ✓ Compiled successfully
```

**Expected Output**:

- ✅ `✓ Compiled successfully`
- ⚠️ Firebase/Html warnings are **non-blocking** (expected without env vars)

---

### Step 2: Deploy to Production

```bash
cd /Users/admin/Downloads/preloss-vision-main
vercel --prod
```

**Watch For**:

- ✅ Build succeeds
- ✅ No "Missing API key" errors (lazy-loading prevents crashes)
- ✅ Deployment URL: `https://skaiscrape.com`

**Estimated Time**: 3-5 minutes

---

### Step 3: Configure Stripe Webhooks

1. **Go to Stripe Dashboard**:  
   https://dashboard.stripe.com/webhooks

2. **Add Endpoint**:
   - Click **"+ Add endpoint"**
   - URL: `https://skaiscrape.com/api/webhooks/stripe`
   - Description: "SkaiScraper Production Webhooks"

3. **Select Events** (click "Select events"):
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`

4. **Create Endpoint**

5. **Copy Webhook Signing Secret**:
   - Click on the newly created endpoint
   - Click **"Reveal"** on "Signing secret"
   - Copy the secret (starts with `whsec_`)

6. **Add Secret to Vercel**:
   - Vercel Dashboard → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_...` (Production)

7. **Redeploy** (to pick up webhook secret):
   ```bash
   vercel --prod
   ```

---

### Step 4: Test Cron Endpoint (Manual Trigger)

```bash
# Replace $CRON_SECRET with actual value from Vercel env vars
curl -X GET "https://skaiscrape.com/api/cron/trials/sweep" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Expected Response**:

```json
{
  "success": true,
  "results": {
    "markedEnded": 0,
    "sent24h": 0,
    "sent1h": 0,
    "errors": []
  }
}
```

**Verify Hourly Execution**:

- Vercel Dashboard → Functions → Cron
- Should see execution every hour (configured in `vercel.json`)

---

## 🧪 POST-DEPLOYMENT SMOKE TESTS

### Test 1: Free Trial Signup Flow

**Time**: 5 minutes

1. **Incognito browser** → https://skaiscrape.com/sign-up
2. Create new account with test email
3. ✅ Auto-redirects to `/dashboard?beta=true`
4. ✅ Trial banner visible at top (green background)
5. ✅ Countdown shows "Trial: 71h 59m 30s" (decrements in real-time)
6. ✅ Can access features (Quick DOL, Weather)

**Manual Expiration Test**:

1. In database, set test org's `trialEndsAt` to past timestamp
2. Refresh `/dashboard` → should redirect to `/trial/ended`
3. ✅ Lock page displays with "Your trial has ended" message
4. ✅ "Upgrade Now" CTA links to `/pricing`

---

### Test 2: Billing Portal

**Time**: 3 minutes

1. Navigate to https://skaiscrape.com/account/billing
2. ✅ Trial status card displays
3. ✅ Countdown timer shows (matches dashboard banner)
4. ✅ "Manage Billing" button present
5. Click **"Manage Billing"**
6. ✅ Stripe Customer Portal opens in new tab
7. ✅ Portal shows trial plan details
8. ✅ Can view invoices (if any exist)
9. Close portal tab
10. ✅ Returns to `/account/billing` (NOT 404)
11. ✅ Auto-refill toggle switch works (on/off persists)

---

### Test 3: Email Sending

**Time**: 5 minutes

#### A. Feedback Form

1. https://skaiscrape.com/feedback
2. Fill out form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Category: "Feature Request"
   - Message: "This is a smoke test email"
3. Submit
4. ✅ Form returns success message
5. Check **ops@skaiscrape.com** inbox
6. ✅ Email arrives with formatted feedback

#### B. Trial Reminder Emails (Force via Database)

1. **T-24h Reminder**:
   ```sql
   UPDATE "Organization"
   SET "trialEndsAt" = NOW() + INTERVAL '23 hours'
   WHERE "clerkOrgId" = '<test-org-id>';
   ```
2. Trigger cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://skaiscrape.com/api/cron/trials/sweep`
3. ✅ Check Vercel logs for "✅ Email sent via Resend"
4. ✅ Email arrives at owner email

5. **T-1h Reminder**:
   ```sql
   UPDATE "Organization"
   SET "trialEndsAt" = NOW() + INTERVAL '30 minutes'
   WHERE "clerkOrgId" = '<test-org-id>';
   ```
6. Run cron again
7. ✅ T-1h email sent (check logs)

#### C. Verify Logs

- Vercel Dashboard → Logs
- Filter by `[mail]`
- ✅ See "✅ Email sent via Resend" entries
- ⚠️ If key missing: "RESEND_API_KEY missing — skipping email" (OK for dev)

---

### Test 4: Stripe Webhook Processing

**Time**: 3 minutes

1. **Stripe Dashboard** → Webhooks → Select production endpoint
2. Click **"Send test webhook"**
3. **Test Events**:

   **A. Subscription Updated**:
   - Event: `customer.subscription.updated`
   - ✅ Webhook returns `200 OK`
   - ✅ Vercel logs show successful processing
   - ✅ Check database: subscription status updated

   **B. Payment Failed**:
   - Event: `invoice.payment_failed`
   - ✅ Webhook returns `200 OK`
   - ✅ Dunning email triggers (check logs)
   - ✅ Database: subscription status marked as past_due

4. **Check Vercel Logs**:
   ```
   WEBHOOK:STRIPE customer.subscription.updated processed
   ```

---

### Test 5: Token Purchase Flow

**Time**: 3 minutes

1. Navigate to https://skaiscrape.com/pricing (or dedicated topup page)
2. Click **"Buy 100 Tokens"** pack
3. ✅ Stripe Checkout opens with correct price
4. Enter test card: `4242 4242 4242 4242`
   - Expiration: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
5. Click **"Pay"**
6. ✅ Redirects to success page
7. **Check Database**:
   ```sql
   SELECT "tokenBalance" FROM "Organization" WHERE "clerkOrgId" = '<test-org>';
   ```
   ✅ Balance increased by 100
8. **Check Stripe Dashboard**:
   ✅ Payment recorded under "Payments"

---

### Test 6: Subscription Checkout Flow

**Time**: 5 minutes

1. https://skaiscrape.com/pricing
2. Click **"Start Free Trial"** on **Solo Plan** ($49/mo)
3. ✅ Stripe Checkout opens
4. ✅ Shows "Start your 3-day free trial"
5. ✅ Card won't be charged until trial ends (if FREE_BETA=false)
6. Complete checkout (test card: `4242 4242 4242 4242`)
7. ✅ Webhook fires: `customer.subscription.created`
8. ✅ Database: New subscription record created
9. ✅ Redirects to `/dashboard`
10. ✅ Trial countdown starts at 72 hours
11. Navigate to `/account/billing`
12. ✅ Plan shows "Solo - Free Trial (72h remaining)"
13. ✅ "Manage Subscription" opens portal with plan details

---

## 📊 MONITORING (First 24 Hours)

### Check Every 6 Hours

- **Vercel Dashboard** → Functions → Logs
- Filter for:
  - `[ERROR]` (5xx responses)
  - `WEBHOOK:STRIPE` (webhook processing)
  - `CRON:TRIAL` (hourly cron execution)
  - `[mail]` (email send attempts)

### Key Metrics to Watch

- ✅ Cron executes every hour (no skipped runs)
- ✅ Webhook responses: All `200 OK`
- ✅ Email sends: `sent: true` or `skipped: true` (both OK)
- ✅ No Prisma connection errors
- ✅ No `500` responses on trial/billing routes

### Alert Conditions (Requires Immediate Action)

- 🚨 Cron fails for 2+ consecutive hours
- 🚨 Webhook returns `500` (check Stripe dashboard for retries)
- 🚨 Database connection timeouts
- 🚨 Trial countdown not decrementing
- 🚨 Billing portal redirect fails (404 on return)

---

## 🔧 KNOWN ISSUES (Non-Blocking)

### 1. Static Page Build Warnings

**Error**: `Error: <Html> should not be imported outside of pages/_document`

**Impact**: ⚠️ Non-blocking - only affects static page pre-rendering  
**Status**: Pre-existing issue (not Phase 4)  
**Fix**: Use `export const dynamic = 'force-dynamic'` on affected pages (if needed)

---

### 2. Firebase Admin Initialization Warnings

**Warning**: `Firebase Admin initialization failed: Failed to parse private key`

**Impact**: ⚠️ Non-blocking - only appears during build (no FIREBASE_SERVICE_ACCOUNT_KEY)  
**Status**: Expected when env var not set during build  
**Fix**: Already lazy-loaded - Firebase only initializes when actually used at runtime

---

### 3. Email Sends Without API Key

**Warning**: `RESEND_API_KEY missing — skipping email`

**Impact**: ℹ️ Informational - logs but doesn't crash  
**Status**: By design - builds succeed without key, emails just skip  
**Fix**: Set `RESEND_API_KEY` in Vercel Production environment

---

### 4. Trial Banner Color Transitions

**Behavior**: Banner changes color based on time remaining:

- **Green**: > 24 hours
- **Yellow**: 1-24 hours
- **Red**: < 1 hour

**Impact**: ✅ Working as intended  
**Status**: Feature, not a bug

---

### 5. Auto-Refill Non-Blocking

**Behavior**: Auto-refill only creates checkout URL (not auto-charged)

**Impact**: ℹ️ User must manually click to complete purchase  
**Status**: By design - prevents surprise charges  
**Future**: Wire into Quick DOL/Weather APIs for in-app prompts (optional)

---

### 6. FREE_BETA=true Bypasses Payment

**Behavior**: When `FREE_BETA=true`, trials start without card required

**Impact**: ✅ Intended for beta launch  
**Status**: Flip to `FREE_BETA=false` when ending beta period  
**Action Required**: Plan grace period + email announcement before flip

---

## 🎯 POST-LAUNCH NEXT STEPS

### Immediate (Week 1)

- [ ] Monitor all smoke tests daily (first 3 days)
- [ ] Verify cron runs hourly (check logs)
- [ ] Test webhook with real subscription events (not just test events)
- [ ] Collect user feedback on trial experience

### Short-Term (Weeks 2-4)

- [ ] A/B test trial banner copy + CTA to increase conversions
- [ ] Add "Upgrade Now" entry points (header, dashboard card, lock page)
- [ ] Wire auto-refill into Quick DOL and Weather APIs (see below)
- [ ] Add admin metrics panel (MAU, orgs on trial vs active, token burn)

### Medium-Term (Month 2)

- [ ] Plan `FREE_BETA=false` flip window + grace messaging
- [ ] Test annual plan option (optional)
- [ ] Add usage analytics to billing page (tokens consumed per feature)
- [ ] Implement notification system for low token warnings

---

## 🔌 OPTIONAL: Wire Auto-Refill into Feature Endpoints

### Quick DOL API

**File**: `src/app/api/quick-dol/route.ts`

**Add after token decrement, before return**:

```typescript
// Non-blocking: Check if auto-refill needed
const autoRefillResult = await checkAndCreateTopUpIfNeeded(orgId).catch(() => null);

if (autoRefillResult?.needsRefill && autoRefillResult?.checkoutUrl) {
  return NextResponse.json({
    ...dolData,
    autoRefillPrompt: {
      message: "Token balance low - refill now?",
      checkoutUrl: autoRefillResult.checkoutUrl,
      currentBalance: autoRefillResult.currentBalance,
      threshold: autoRefillResult.threshold,
    },
  });
}
```

### Weather API

**File**: `src/app/api/weather/route.ts`

**Same pattern**:

```typescript
const autoRefillResult = await checkAndCreateTopUpIfNeeded(orgId).catch(() => null);

if (autoRefillResult?.needsRefill && autoRefillResult?.checkoutUrl) {
  return NextResponse.json({
    ...weatherData,
    autoRefillPrompt: {
      message: "Token balance low - refill now?",
      checkoutUrl: autoRefillResult.checkoutUrl,
      currentBalance: autoRefillResult.currentBalance,
      threshold: autoRefillResult.threshold,
    },
  });
}
```

### Frontend (UI Response)

**File**: `src/components/AutoRefillToast.tsx` (create new)

```typescript
import { toast } from "sonner";

export function showAutoRefillPrompt(checkoutUrl: string) {
  toast.info("Token balance low", {
    description: "Would you like to refill now?",
    action: {
      label: "Refill",
      onClick: () => window.open(checkoutUrl, "_blank"),
    },
  });
}
```

**In Quick DOL/Weather response handler**:

```typescript
if (response.autoRefillPrompt) {
  showAutoRefillPrompt(response.autoRefillPrompt.checkoutUrl);
}
```

---

## 📝 ROLLBACK PLAN (If Critical Issues Arise)

### Emergency Rollback

```bash
cd /Users/admin/Downloads/preloss-vision-main

# Revert to last known good commit (before Phase 4)
git checkout 1979078  # "feat: Final launch cutover"

# Redeploy
vercel --prod
```

### Partial Rollback (Disable Feature)

**If only trials are broken**:

1. Set `FREE_BETA=false` in Vercel → disables trial auto-start
2. Manually update affected orgs in database
3. Redeploy current code (no git revert needed)

### Database Rollback (DANGEROUS - LAST RESORT)

**Only if database corruption occurs**:

1. Stop all cron jobs
2. Restore database from latest backup (before migration)
3. Re-run migrations manually
4. Verify data integrity before re-enabling features

---

## ✅ FINAL DEPLOYMENT SUMMARY

After all smoke tests pass, create **PRODUCTION_DEPLOYMENT_PHASE4_COMPLETE.md**:

### Include:

- ✅ Deployment timestamp
- ✅ Commit hash: `95521d1`
- ✅ All env vars set (names only, no secrets)
- ✅ Smoke test results (all passing)
- ✅ Known issues documented
- ✅ Rollback plan confirmed
- ✅ Monitoring dashboard links
- ✅ Next phase planning (Phase 5 kickoff)

### Commit to Repo:

```bash
git add PRODUCTION_DEPLOYMENT_PHASE4_COMPLETE.md
git commit -m "docs: Phase 4 production deployment complete"
git push origin feat/phase3-banner-and-enterprise
```

---

## 🎉 SUCCESS CRITERIA

**Phase 4 is LIVE when all of these are TRUE**:

- ✅ Production deployment succeeds (`vercel --prod`)
- ✅ All env vars set in Vercel Production
- ✅ Stripe webhooks configured and returning 200 OK
- ✅ Cron executes every hour (verified in logs)
- ✅ Free trial signup flow works end-to-end
- ✅ Trial countdown displays and decrements correctly
- ✅ Lock page redirects when trial expires
- ✅ Billing portal opens and returns correctly
- ✅ Emails send successfully (feedback, trial reminders, dunning)
- ✅ Token purchases complete and update database
- ✅ Subscription checkouts create trials and webhooks fire
- ✅ Zero critical errors in Vercel logs (first 24h)

---

**READY TO DEPLOY? Follow steps in order and check each box as you go!** 🚀
