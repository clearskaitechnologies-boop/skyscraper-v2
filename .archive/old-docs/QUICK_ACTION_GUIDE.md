# 🎯 Quick Action Guide - Post-Deployment

## Immediate Actions Required (5-10 minutes)

### 1. Configure Stripe Webhook ⚡

**Time**: 2 minutes  
**Priority**: HIGH

1. Open https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter URL: `https://skaiscrape.com/api/webhooks/stripe`
4. Click **"Select events"**
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.trial_will_end`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_...`)
8. **Optional**: Update in Vercel if different from current value:
   ```bash
   echo "whsec_..." | vercel env add STRIPE_WEBHOOK_SECRET production
   ```

---

### 2. Apply Email Queue Migration ⚡

**Time**: 2 minutes  
**Priority**: MEDIUM

**Option A: Via Vercel CLI (Recommended)**

```bash
# Pull production environment
vercel env pull .env.production

# Load environment
source .env.production

# Run migration
psql "$DATABASE_URL" -f ./prisma/migrations/20251103_email_queue/migration.sql
```

**Option B: Via Database Client**

1. Get DATABASE_URL from Vercel Dashboard
2. Connect with your preferred PostgreSQL client
3. Execute: `prisma/migrations/20251103_email_queue/migration.sql`

**What This Does**:

- Creates `email_queue` table
- Enables email retry for failed deliveries
- Adds indexes for queue processing

---

### 3. Enable Email Delivery (Optional) 💡

**Time**: 3 minutes  
**Priority**: LOW (app works without it)

1. Get API key from https://resend.com/api-keys
2. Add to Vercel:
   ```bash
   echo "re_..." | vercel env add RESEND_API_KEY production
   ```
3. Trigger redeploy:
   ```bash
   vercel --prod
   ```

**Without this**:

- ✅ App works normally
- ❌ Trial reminder emails won't send
- ❌ Report sharing emails won't send

---

## E2E Testing Checklist (15 minutes)

### Basic Flow ✅

1. **Sign In**
   - [ ] Open https://skaiscrape.com
   - [ ] Click "Sign In"
   - [ ] Authenticate with Clerk
   - [ ] Verify redirect to dashboard

2. **Organization Setup**
   - [ ] Create new organization (if needed)
   - [ ] Verify organization name appears
   - [ ] Check token balance is visible

3. **Token System**
   - [ ] Confirm starting token balance
   - [ ] Generate a test report
   - [ ] Verify token deduction
   - [ ] Check balance updates correctly

4. **Billing Portal**
   - [ ] Navigate to Billing/Account
   - [ ] Click "Manage Billing"
   - [ ] Verify Stripe portal opens
   - [ ] Check subscription details display

### Advanced Testing 🔬

5. **Trial System** (if applicable)
   - [ ] Check trial countdown displays
   - [ ] Verify trial expiration logic
   - [ ] Test trial upgrade flow

6. **Report Generation**
   - [ ] Upload test file
   - [ ] Generate PDF report
   - [ ] Verify branding appears
   - [ ] Test download functionality

7. **Settings & Branding**
   - [ ] Access organization settings
   - [ ] Update branding (logo/colors)
   - [ ] Verify changes persist

---

## Monitoring (First Hour) 📊

### Vercel Dashboard

**Check every 10 minutes**

1. Go to https://vercel.com/buildingwithdamien/preloss-vision
2. Navigate to **Deployments** → Latest
3. Check **Functions** tab for errors
4. Monitor **Analytics** for:
   - Response times (should be < 1s for most routes)
   - Error rate (should be < 1%)
   - Request volume

**View Live Logs**:

```bash
vercel logs --follow
```

**Check for Errors**:

```bash
vercel logs | grep -i error | tail -50
```

### Stripe Dashboard

**Check after first transaction**

1. Go to https://dashboard.stripe.com/webhooks
2. Find webhook endpoint for `skaiscrape.com`
3. Check **Recent deliveries**:
   - ✅ Should show 200 OK responses
   - ❌ If 400/500 errors, check logs

### Health Check

**Run every 15 minutes**:

```bash
curl -s https://skaiscrape.com/api/health/live | jq
```

**Expected Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-11-03T...",
  "service": "skaiscraper",
  "version": "3.0.0",
  "env": {
    "hasDatabase": true,
    "hasClerk": true
  }
}
```

### Cron Jobs

**First execution times**:

- `/api/cron/email-retry` - Within 15 minutes
- `/api/cron/trials/sweep` - Within 60 minutes
- `/api/weather/cron-daily` - Next day at 9:00 AM
- `/api/cron/stripe-reconcile` - Next day at 2:00 AM

**Check cron logs**:

```bash
vercel logs | grep -i cron
```

---

## Troubleshooting 🔧

### Issue: Stripe webhook failing

**Symptoms**: 400/500 errors in Stripe dashboard

**Fix**:

1. Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Verify endpoint URL is exactly: `https://skaiscrape.com/api/webhooks/stripe`
3. Check Vercel logs for detailed error:
   ```bash
   vercel logs | grep stripe | grep error
   ```

### Issue: Database connection errors

**Symptoms**: 500 errors, "database unavailable" in logs

**Fix**:

1. Verify `DATABASE_URL` in Vercel environment
2. Test connection:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```
3. Check database service status

### Issue: Trial emails not sending

**Symptoms**: Users not receiving trial reminders

**Fix**:

1. Add `RESEND_API_KEY` (see Section 3 above)
2. Verify `EMAIL_FROM` is set
3. Check email queue table:
   ```bash
   psql "$DATABASE_URL" -c "SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;"
   ```

### Issue: Token balance incorrect

**Symptoms**: Balance doesn't update after generation

**Fix**:

1. Check `tokens_ledger` table for transactions
2. Verify trigger exists: `update_token_balance_trigger`
3. Check migration was applied

---

## Success Criteria ✅

After completing all actions, verify:

- ✅ Stripe webhook shows 200 OK responses
- ✅ Email queue table exists in database
- ✅ Health check returns `"status": "ok"`
- ✅ Can sign in and access dashboard
- ✅ Token balance displays correctly
- ✅ Reports generate successfully
- ✅ Billing portal accessible
- ✅ No errors in Vercel function logs
- ✅ Cron jobs executing (check logs after intervals)

---

## Support & Resources 📚

- **Deployment Doc**: `DEPLOYMENT_STATUS_2025-11-03.md`
- **Full Guide**: `PHASE_4_PRODUCTION_DEPLOYMENT_MASTER.md`
- **Vercel Project**: https://vercel.com/buildingwithdamien/preloss-vision
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Clerk Dashboard**: https://dashboard.clerk.com

---

**Estimated Total Time**: 20-30 minutes  
**Can Skip**: Email delivery setup (Section 3)  
**Must Complete**: Stripe webhook, Database migration, E2E testing
