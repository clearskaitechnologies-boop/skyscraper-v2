# 🚀 REFERRAL SYSTEM - FINAL DEPLOYMENT CHECKLIST

**Date**: November 3, 2025  
**Branch**: feat/phase3-banner-and-enterprise  
**Commit**: 7c2314e

---

## ✅ PRE-DEPLOYMENT COMPLETE

- [x] Prisma client generated with Referral + ReferralReward models
- [x] Build passes with zero errors
- [x] Duplicate billing page removed
- [x] TokenWallet schema inconsistencies fixed
- [x] Ref parameter wired through signup → checkout
- [x] ReferralModal added to dashboard header
- [x] All code committed and pushed to GitHub

---

## 🔥 DEPLOYMENT STEPS

### Step 1: Apply Database Migration (CRITICAL)

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Apply the referral migration
psql "$DATABASE_URL" -f /Users/admin/Downloads/preloss-vision-main/prisma/migrations/20251103_referrals/migration.sql
```

**Expected Output**:

```
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
ALTER TABLE
CREATE INDEX
```

**Verification**:

```bash
psql "$DATABASE_URL" -c "\dt referral*"
```

Should show:

- `referrals` table
- `referral_rewards` table

---

### Step 2: Set Production Environment Variables

**Vercel Dashboard** → Your Project → Settings → Environment Variables

Add these for **Production**:

| Variable                | Value                    | Required |
| ----------------------- | ------------------------ | -------- |
| `REFERRAL_TOKEN_REWARD` | `500`                    | Yes      |
| `NEXT_PUBLIC_SITE_URL`  | `https://skaiscrape.com` | Yes      |
| `RESEND_API_KEY`        | `re_your_key`            | Optional |
| `EMAIL_FROM`            | `noreply@skaiscrape.com` | Optional |

**Via CLI**:

```bash
vercel env add REFERRAL_TOKEN_REWARD production
# Enter: 500

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://skaiscrape.com

# Optional
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
```

---

### Step 3: Deploy to Production

**Option A: Automatic (via GitHub)**

- Push to main/production branch
- Vercel auto-deploys

**Option B: Manual (via CLI)**

```bash
vercel --prod
```

---

## 🧪 POST-DEPLOYMENT VALIDATION

### Test 1: Referral Modal Appears

1. Visit https://skaiscrape.com/dashboard
2. Look for referral button in top navigation
3. Click to open modal
4. **Expected**: Shows unique referral link like `https://skaiscrape.com/r/ABC123`

### Test 2: Landing Page Works

1. Copy referral link from modal
2. Open in incognito window
3. **Expected**:
   - Beautiful landing page loads
   - Shows "Create Account" CTA
   - Clicking CTA → redirects to `/sign-up?ref=ABC123`

### Test 3: Ref Persists Through Signup

1. Complete signup with `?ref=ABC123` in URL
2. **Expected**: User created successfully
3. **Database Check**:

```sql
SELECT * FROM "Org" WHERE "referralCode" IS NOT NULL LIMIT 5;
SELECT * FROM "Referral" ORDER BY "createdAt" DESC LIMIT 5;
```

### Test 4: Checkout Includes Ref

1. Go to `/pricing?ref=ABC123`
2. Select a plan
3. Go through checkout
4. **Expected**: Stripe metadata includes `{ org_id, ref: "ABC123" }`

### Test 5: Webhook Rewards

**Using Stripe Test Mode**:

1. Complete a test subscription with referral
2. Check Stripe webhook logs
3. **Expected**:
   - Webhook receives `customer.subscription.created`
   - Metadata contains `ref` code
   - First referral → +30 days added
   - Subsequent → +500 tokens added

**Database Verification**:

```sql
SELECT * FROM "ReferralReward" ORDER BY "createdAt" DESC LIMIT 10;
```

### Test 6: User Dashboard

1. Visit https://skaiscrape.com/settings/referrals
2. **Expected**:
   - Shows total months earned
   - Shows total tokens earned
   - Lists all referrals with status
   - Shows invite history

### Test 7: Admin Dashboard

1. Visit https://skaiscrape.com/admin/referrals
2. **Expected**:
   - Shows system-wide metrics
   - Total referrals count
   - Conversion rate
   - Recent activity tables

---

## 🔍 MONITORING CHECKLIST

### First 24 Hours

- [ ] Check Vercel deployment logs for errors
- [ ] Monitor Stripe webhook delivery (should be 2xx responses)
- [ ] Check Sentry for any unhandled exceptions
- [ ] Verify referral links work from email/SMS/social
- [ ] Confirm first reward (30 days) applied correctly
- [ ] Confirm token rewards (500) applied correctly

### Database Queries to Run

```sql
-- Check referral activity
SELECT
  status,
  COUNT(*) as count
FROM "Referral"
GROUP BY status;

-- Check rewards distributed
SELECT
  type,
  COUNT(*) as count,
  SUM("monthsAwarded") as total_months,
  SUM("tokensAwarded") as total_tokens
FROM "ReferralReward"
GROUP BY type;

-- Top referrers
SELECT
  r."orgId",
  COUNT(*) as successful_referrals
FROM "Referral" r
WHERE r.status = 'subscribed'
GROUP BY r."orgId"
ORDER BY successful_referrals DESC
LIMIT 10;
```

---

## 🐛 TROUBLESHOOTING

### Issue: Referral modal doesn't appear

**Fix**: Check that `<ReferralModal />` is imported in `SkaiCRMNavigation.tsx`

### Issue: Landing page shows 404

**Fix**: Verify `/src/app/r/[code]/page.tsx` exists and was deployed

### Issue: Webhook doesn't award rewards

**Checks**:

1. Stripe webhook is configured to send `customer.subscription.created`
2. Metadata includes `ref` code
3. Check webhook logs in Stripe dashboard
4. Verify `awardFirstOrTokens` function logs

### Issue: TypeScript errors after deployment

**Fix**: Run `pnpm prisma generate` on the server (should happen automatically)

### Issue: Email invites not sending

**Check**: `RESEND_API_KEY` is set in production
**Note**: System works without it (link still generated)

---

## 📊 SUCCESS METRICS

Track these in first week:

| Metric                   | Target | How to Check                               |
| ------------------------ | ------ | ------------------------------------------ |
| Referral links generated | 50+    | Count unique `referralCode` in Org table   |
| Link clicks              | 100+   | Count `clicked` events in `Referral` table |
| Signups from referrals   | 10+    | Count `signed_up` status                   |
| Paid conversions         | 3+     | Count `subscribed` status                  |
| Rewards distributed      | 3+     | Count rows in `ReferralReward`             |

---

## 🎉 LAUNCH ANNOUNCEMENT

Once validated, announce to users:

**Email Subject**: "🎁 New: Refer & Earn Rewards"

**Body**:

```
We've just launched our Referral Program!

Share SkaiScraper with contractors you know and earn:
• First successful referral: +30 days free
• Each additional referral: 500 bonus tokens

Get your unique link: https://skaiscrape.com/settings/referrals

Thanks for being part of the SkaiScraper community!
```

**In-App Banner** (add to dashboard):

```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
  🎁 NEW: Refer contractors and earn rewards! First referral = +30 days free.
  <a href="/settings/referrals" className="underline">
    Get your link →
  </a>
</div>
```

---

## ✅ DEPLOYMENT STATUS

- [x] Code complete
- [x] Build passes
- [x] Committed and pushed
- [ ] **DATABASE MIGRATION** → Run Step 1
- [ ] **ENV VARS SET** → Run Step 2
- [ ] **DEPLOYED** → Run Step 3
- [ ] **VALIDATED** → Run all tests
- [ ] **MONITORING** → Check for 24h
- [ ] **ANNOUNCED** → Send to users

---

**Next Action**: Run Step 1 (Apply Database Migration)

**Documentation**: See `REFERRAL_SYSTEM.md` for complete technical docs
