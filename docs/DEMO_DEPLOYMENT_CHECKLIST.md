# Trades Network Demo - Deployment Checklist 🚀

## Pre-Flight Checks (5 minutes)

- [ ] Build passing locally: `npm run build`
- [ ] Git status clean: `git status`
- [ ] Environment variables set (check below)

## Step 1: Supabase Configuration (10 minutes)

### 1.1 Run Main Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Click **"+ New query"**
4. Copy entire contents of: `db/migrations/20241103_trades_network_clerk.sql`
5. Paste and click **"Run"**
6. Wait for success message: ✅ Trades Network schema created successfully!

### 1.2 Verify Migration

Run this test query in SQL Editor:

```sql
-- Should return your Clerk user ID
SELECT auth_user_id();

-- Should return 0 (you don't have membership yet)
SELECT COUNT(*) FROM tn_memberships;

-- Should show all 20 trade types
SELECT unnest(enum_range(NULL::text)) as trades;
```

### 1.3 Run Seed Data (AFTER getting your Clerk user IDs)

1. Sign into your app at https://yourdomain.com
2. Open browser console
3. Run: `fetch('/api/user/me').then(r => r.json()).then(console.log)`
4. Copy your `userId` (starts with `user_`)
5. Edit `db/seed-trades-network-demo.sql`:
   - Replace `user_2abc123def456` with your real user ID
   - Replace the other 2 demo user IDs as well
6. Run the seed SQL in Supabase SQL Editor

## Step 2: Clerk JWT Template (10 minutes)

### 2.1 Create Supabase JWT Template

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Click **"JWT Templates"** in sidebar
3. Click **"+ New template"**
4. Select **"Supabase"** from preset list
5. Name it: `supabase`
6. Click **"Apply changes"**

### 2.2 Configure Signing Key

1. Go back to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **"JWT Settings"**
4. Copy the **JWT Secret** (long string starting with `ey...`)
5. Back in Clerk → JWT Templates → supabase
6. Under **"Signing key"**, paste the Supabase JWT Secret
7. Save changes

### 2.3 Verify Claims

Ensure these claims are present in the template:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "user_metadata": {
    "full_name": "{{user.full_name}}"
  }
}
```

## Step 3: Environment Variables (5 minutes)

### 3.1 Required Variables

Check these are set in Vercel (or `.env.local` for local):

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FULL_ACCESS=price_...  # Create this in Stripe Dashboard

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3.2 Create Stripe Product (if not exists)

1. Go to Stripe Dashboard: https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in:
   - Name: `SKAI'S FULL ACCESS TO THE TRADES NETWORK`
   - Description: `Save More Tokens! Bundle Your Plan!`
   - Price: `$9.99` / month
4. Copy the **Price ID** (e.g., `price_1Abc123...`)
5. Add to Vercel env: `STRIPE_PRICE_FULL_ACCESS=price_...`

### 3.3 Configure Stripe Webhook

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://yourdomain.com/api/billing/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing secret** (e.g., `whsec_...`)
6. Add to Vercel env: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Step 4: Deploy to Vercel (5 minutes)

### 4.1 Push to GitHub

```bash
git add -A
git commit -m "feat: Trades Network demo-ready deployment"
git push origin feat/phase3-banner-and-enterprise
```

### 4.2 Deploy

```bash
# Option A: Auto-deploy (if connected to Vercel)
# Just push and wait for deployment

# Option B: Manual deploy
vercel --prod
```

### 4.3 Verify Deployment

1. Visit: `https://yourdomain.com/network/opportunities`
2. Should see login prompt if not signed in
3. After login, should see opportunities page (may be empty if no seed data)

## Step 5: Test Flow (15 minutes)

### 5.1 Free User Flow (No Full Access)

1. Sign in as test user
2. Go to `/network/opportunities`
3. Click on an opportunity
4. Click **"Apply Now"**
5. ✅ Should see: "This will cost 1 token"
6. Confirm application
7. ✅ Token balance decreases by 1
8. Go to `/network/inbox`
9. ✅ Should see new thread
10. Send a message
11. ✅ First message costs 1 token, replies are free

### 5.2 Post Opportunity (Blocked)

1. Go to `/network/opportunity/new`
2. Try to post
3. ✅ Should see: "Full Access required"
4. Click **"Get Full Access"**
5. ✅ Redirects to Stripe checkout

### 5.3 Full Access Upgrade

1. Complete Stripe checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
2. ✅ Webhook fires
3. ✅ Database updates `tn_memberships.full_access = true`
4. Return to app
5. ✅ Should see "Full Access ✓" badge in navbar
6. Go to `/network/opportunity/new`
7. ✅ Can now post opportunities
8. Send a new message
9. ✅ No token cost!

### 5.4 Token Purchase

1. Click token badge in navbar
2. Redirects to `/billing?tab=tokens`
3. Select token pack (10 tokens, 50 tokens, etc.)
4. Complete checkout
5. ✅ Webhook adds tokens to wallet
6. ✅ Balance updates in real-time

## Step 6: Demo Script (5 minutes)

### Opening

"Welcome to the Trades Network! This is a token-gated professional messaging platform for contractors and restoration professionals."

### Demo Points

1. **Browse Opportunities**
   - "Here we have job postings from contractors looking for help"
   - Filter by trade, location
   - Show applicant counts

2. **Apply to Job (Token Cost)**
   - Click Apply → "This costs 1 token"
   - Show token balance decrease
   - Thread created instantly

3. **Messaging**
   - First message in thread: 1 token
   - Replies: FREE
   - Real-time delivery

4. **Full Access Upsell**
   - Try to post opportunity → blocked
   - "Get Full Access for $9.99/mo"
   - Unlimited messaging + posting

5. **Upgrade Flow**
   - Stripe checkout
   - Instant activation
   - Full Access badge appears
   - Can now post unlimited opportunities

6. **Token System**
   - Show token balance
   - Purchase packs
   - AI tools still cost tokens (even with Full Access)

### Closing

"The platform enforces token billing at the database level with Postgres triggers and RLS policies. Full Access removes messaging costs but applies still cost tokens to prevent abuse."

## Troubleshooting

### Issue: "Unauthorized" errors

**Fix**: Check Clerk JWT template is configured correctly

```bash
# Test in Supabase SQL Editor:
SELECT auth_user_id();
# Should return your Clerk user ID, not NULL
```

### Issue: RLS blocking queries

**Fix**: Verify migration ran successfully

```sql
-- Check if function exists:
SELECT proname FROM pg_proc WHERE proname = 'auth_user_id';
```

### Issue: Full Access not activating after payment

**Fix**: Check webhook logs in Stripe Dashboard

- Verify endpoint is receiving events
- Check for 200 OK responses
- Manually update if needed:

```sql
UPDATE tn_memberships
SET full_access = true
WHERE user_id = 'your-clerk-user-id'::uuid;
```

### Issue: Tokens not deducting

**Fix**: Check token_wallets table exists

```sql
SELECT * FROM token_wallets WHERE user_id = auth_user_id();
```

## Success Metrics

After demo, verify:

- [ ] Users can browse opportunities
- [ ] Applying costs 1 token
- [ ] First message costs 1 token (free tier)
- [ ] Replies are free
- [ ] Full Access users don't pay for messaging
- [ ] Full Access users can post opportunities
- [ ] Token purchase flow works
- [ ] Stripe webhook activates Full Access
- [ ] Real-time messaging works
- [ ] Token balance updates correctly

## Rollback Plan

If critical issues occur:

```sql
-- Disable posting (emergency)
UPDATE tn_posts SET is_active = false;

-- Disable messaging (emergency)
DROP POLICY IF EXISTS "participants_send_messages" ON tn_messages;
```

## Post-Demo Tasks

- [ ] Monitor Stripe Dashboard for payments
- [ ] Check Supabase logs for errors
- [ ] Review token consumption patterns
- [ ] Collect user feedback
- [ ] Plan polish pass (avatars, unread badges, etc.)

---

**Estimated Total Time**: ~1 hour from start to demo-ready

**Go Time**: You got this! 🚀
