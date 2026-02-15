# 🚀 Trades Network Demo - Quick Reference Card

## Pre-Demo Setup (15 minutes)

```bash
# 1. Run pre-flight checks
./scripts/pre-flight-test.sh

# 2. Deploy
./scripts/deploy-trades-demo.sh
# OR
vercel --prod

# 3. Configure Clerk JWT (one-time)
# → https://dashboard.clerk.com/jwt-templates
# → Create "supabase" template
# → Add Supabase JWT Secret

# 4. Run SQL Migration
# → https://supabase.com/dashboard
# → SQL Editor → New Query
# → Paste: db/migrations/20241103_trades_network_clerk.sql
# → Run

# 5. Seed Demo Data
# → Get your Clerk user ID
# → Edit: db/seed-trades-network-demo.sql
# → Replace placeholder IDs
# → Run in SQL Editor
```

---

## Demo Flow (10 minutes)

### 1. OPENING (1 min)

"This is the Trades Network - a token-gated professional messaging platform for contractors."

**Show**: `/network/opportunities`

### 2. BROWSE & FILTER (1 min)

- Filter by trade (Roofing, HVAC, etc.)
- Filter by location (Austin, Houston, Dallas)
- Show applicant counts
- Click opportunity to view details

**Key Point**: "Anyone can browse, but actions cost tokens"

### 3. APPLY TO JOB (2 min)

- Click "Apply Now"
- Show modal: "This will cost 1 token"
- **Highlight token badge**: "You have 10 tokens"
- Submit application
- **Show**: Token count decreases to 9
- Thread created → redirect to `/network/inbox`

**Key Point**: "Every application creates a private conversation thread"

### 4. MESSAGING (2 min)

- Click thread to view
- Send first message
- **Show**: "First message costs 1 token" (balance → 8)
- Reply to message
- **Show**: "Replies are FREE"

**Key Point**: "Token-gated first contact prevents spam, free replies encourage engagement"

### 5. POSTING BLOCKED (1 min)

- Go to `/network/opportunity/new`
- Try to post opportunity
- **Show**: "Full Access required to post jobs"
- Show upsell modal

**Key Point**: "Posting is a premium feature - prevents low-quality spam"

### 6. FULL ACCESS UPGRADE (2 min)

- Click "Get Full Access - $9.99/mo"
- Redirect to Stripe checkout
- Use test card: `4242 4242 4242 4242`
- Complete checkout
- **Show**: Webhook fires (Stripe dashboard)
- Return to app
- **Show**: "Full Access ✓" badge appears
- Go to `/network/opportunity/new`
- **Show**: Can now post unlimited opportunities
- Send new message
- **Show**: "No token cost" (Full Access bypass)

**Key Point**: "Full Access = unlimited messaging + job posting, but AI tools still cost tokens"

### 7. TOKEN PURCHASE (1 min)

- Click token badge
- Redirect to `/billing?tab=tokens`
- Show token packs (10, 50, 100 tokens)
- "Users can buy tokens or upgrade to Full Access"

**Key Point**: "Flexible pricing - pay-per-use OR unlimited monthly subscription"

---

## Demo Talking Points

### Architecture Highlights

- **Database**: Postgres with RLS policies (Supabase)
- **Auth**: Clerk JWT passed to Supabase for row-level security
- **Billing**: Stripe webhooks for instant activation
- **Token Logic**: Enforced at database level with triggers
- **Real-time**: PostgreSQL subscriptions for live messaging

### Token Economy

| Action               | Cost                 | Full Access |
| -------------------- | -------------------- | ----------- |
| Browse opportunities | FREE                 | FREE        |
| Apply to job         | 1 token              | 1 token ⚠️  |
| First message        | 1 token              | FREE ✅     |
| Reply to message     | FREE                 | FREE        |
| Post opportunity     | Full Access required | FREE ✅     |
| AI mockup generation | 3 tokens             | 3 tokens ⚠️ |

### Business Model

- **Token Packs**: $5 (10 tokens), $20 (50 tokens), $40 (100 tokens)
- **Full Access**: $9.99/month (unlimited messaging + posting)
- **Target Conversion**: 15% to Full Access within 3 months
- **Revenue Split**: ~60% Full Access MRR, ~40% token pack sales

### Security Features

- RLS policies enforce ownership
- JWT validation on every request
- Token deduction atomic transactions
- Webhook signature verification
- No client-side token manipulation

---

## Quick Commands

```bash
# Check deployment
vercel ls --prod

# View logs
vercel logs --prod

# Test API routes locally
curl http://localhost:3000/api/trades/opportunities
curl http://localhost:3000/api/billing/full-access/status

# Check Supabase data
# Run in SQL Editor:
SELECT * FROM tn_posts WHERE is_active = true;
SELECT * FROM tn_memberships WHERE full_access = true;
SELECT * FROM token_wallets ORDER BY tokens DESC;
```

---

## Troubleshooting During Demo

### "Unauthorized" errors

**Fix**: Check Clerk session is active

```javascript
// Browser console:
fetch("/api/user/me")
  .then((r) => r.json())
  .then(console.log);
```

### "RLS policy violation"

**Fix**: Verify JWT template configured in Clerk

```sql
-- Run in Supabase SQL Editor:
SELECT auth_user_id(); -- Should return your Clerk user ID
```

### "Insufficient tokens" not showing

**Fix**: Check token wallet exists

```sql
SELECT * FROM token_wallets WHERE user_id = auth_user_id();
```

### Full Access not activating after payment

**Fix**: Check Stripe webhook delivery

- Dashboard → Webhooks → Click endpoint
- View recent events
- Verify 200 OK responses
- Manual fix:

```sql
UPDATE tn_memberships
SET full_access = true
WHERE user_id = 'your-clerk-user-id'::uuid;
```

---

## Follow-Up Questions

**Q: Can users get tokens back?**
A: No, tokens are consumed on action. But Full Access users don't spend tokens on messaging.

**Q: What happens if subscription expires?**
A: User reverts to token-per-message billing. No data lost.

**Q: Can contractors message each other directly?**
A: Yes - first message costs 1 token, then unlimited replies for free.

**Q: What prevents token abuse?**
A: Database-level triggers enforce deduction before message insertion. Atomic transactions prevent double-spend.

**Q: Roadmap features?**

- Resume/portfolio uploads for applications
- Unread message badges
- Typing indicators
- Message attachments (photos, PDFs)
- Review system for contractors
- Job matching AI

---

## Post-Demo

- [ ] Collect feedback
- [ ] Monitor Stripe Dashboard for test payments
- [ ] Review Supabase logs for errors
- [ ] Check token consumption patterns
- [ ] Plan polish pass (see todo list)

---

**🎉 You got this! Confidence is key. The system is solid.**

**Emergency Contact**: If demo breaks, check:

1. Vercel deployment logs
2. Supabase SQL logs
3. Stripe webhook logs
4. Browser console errors
