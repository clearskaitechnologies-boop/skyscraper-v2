# Trades Network Feature Documentation

## Overview

The Trades Network is a token-gated professional messaging and job posting platform for contractors and restoration professionals. It combines pay-per-use token billing with an optional unlimited subscription model.

## Features

### For All Users (Free)

- ✅ Browse job opportunities
- ✅ Filter by trade type and location
- ✅ View applicant counts
- ✅ Receive unlimited message replies (free)

### Token-Gated Actions

- 💰 Apply to job: **1 token**
- 💰 Send first message in thread: **1 token**
- 💰 AI tools (mockups, weather, etc.): **3+ tokens**

### Full Access ($9.99/month)

- ✅ Unlimited job posting
- ✅ Unlimited first messages (no token cost)
- ✅ "Full Access ✓" badge
- ⚠️ AI tools still cost tokens (prevents abuse)
- ⚠️ Applying to jobs still costs 1 token

## Architecture

### Database (Supabase/Postgres)

```
tn_memberships      → Full Access subscriptions
tn_posts           → Job opportunities
tn_threads         → Conversation containers
tn_participants    → Thread membership
tn_messages        → Message content
token_wallets      → User token balances
```

### API Routes

```
GET  /api/trades/opportunities     → List/filter jobs
POST /api/trades/opportunities     → Create job (Full Access required)
GET  /api/trades/inbox            → User's message threads
GET  /api/trades/thread/:id       → Thread messages
POST /api/trades/send-message     → Send message (token-gated)
POST /api/trades/apply            → Apply to job (1 token)

GET  /api/billing/full-access/status   → Check subscription
POST /api/billing/full-access/checkout → Start Stripe checkout
POST /api/billing/stripe/webhook       → Handle subscription events
```

### Frontend Routes

```
/network/opportunities        → Job board with filters
/network/opportunity/new      → Post job (Full Access gate)
/network/inbox               → Message threads list
/network/thread/:id          → Chat interface
/billing                     → Token purchase + Full Access
```

## Token Economy

### Pricing

- **10 tokens**: $5 ($0.50 per action)
- **50 tokens**: $20 ($0.40 per action)
- **100 tokens**: $40 ($0.40 per action)
- **Full Access**: $9.99/month (unlimited messaging)

### Economics

- Average free user: 5-8 actions/month → $2-4 token spend
- Full Access break-even: 20+ messages/month
- Target conversion: 15% to Full Access
- Projected revenue split: 60% subscriptions, 40% token packs

## Security

### Row-Level Security (RLS)

All tables use Postgres RLS policies that validate:

- User authentication via Clerk JWT
- Ownership of posts/threads/messages
- Full Access status for posting
- Participant membership for viewing threads

### Token Enforcement

Tokens are deducted at the **database level** using triggers:

```sql
-- First message trigger checks has_full_access()
-- If false → deduct 1 token
-- If insufficient → transaction fails
```

### Webhook Security

- Stripe webhook signature verification
- Idempotent subscription updates
- Metadata validation (userId, productType)

## Development

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Add: CLERK, SUPABASE, STRIPE keys

# 3. Run database migration
# Supabase SQL Editor → db/migrations/20241103_trades_network_clerk.sql

# 4. Configure Clerk JWT
# Dashboard → JWT Templates → Create "supabase" template

# 5. Start dev server
npm run dev
```

### Testing

```bash
# Pre-flight checks
./scripts/pre-flight-test.sh

# Build test
npm run build

# Deploy
./scripts/deploy-trades-demo.sh
```

## Deployment

### Required Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_FULL_ACCESS=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Deployment Steps

See: `docs/DEMO_DEPLOYMENT_CHECKLIST.md`

## Monitoring

### Key Metrics

- Active Full Access subscriptions
- Token consumption rate
- Conversion rate (free → Full Access)
- Average messages per user
- Job posting volume
- Application completion rate

### Database Queries

```sql
-- Active Full Access users
SELECT COUNT(*) FROM tn_memberships WHERE full_access = true;

-- Token balances
SELECT AVG(tokens) FROM token_wallets;

-- Popular trades
SELECT trade, COUNT(*) FROM tn_posts GROUP BY trade ORDER BY count DESC;

-- Messaging volume
SELECT DATE(created_at), COUNT(*) FROM tn_messages GROUP BY DATE(created_at);
```

### Stripe Dashboard

- Products → Full Access subscription count
- Subscriptions → Active/canceled/past_due
- Webhooks → Delivery success rate (should be 100%)

## Roadmap

### Phase 2 (Polish)

- [ ] Unread message badges
- [ ] Typing indicators
- [ ] Message timestamps with grouping ("Today", "Yesterday")
- [ ] User avatars
- [ ] Auto-scroll improvements

### Phase 3 (Portfolio)

- [ ] Resume upload for applications
- [ ] Job photo gallery (6 photos max)
- [ ] Google Reviews integration
- [ ] Insurance document attachments
- [ ] Contractor verification badges

### Phase 4 (Advanced)

- [ ] Real-time presence ("User is online")
- [ ] Push notifications
- [ ] Email digests
- [ ] Job matching AI
- [ ] Review/rating system
- [ ] Contractor search/discovery
- [ ] Saved searches
- [ ] Job alerts

## Support

### Documentation

- Setup: `docs/CLERK_SUPABASE_JWT_SETUP.md`
- Deployment: `docs/DEMO_DEPLOYMENT_CHECKLIST.md`
- Quick Reference: `docs/DEMO_QUICK_REFERENCE.md`

### Troubleshooting

Common issues and solutions in: `docs/DEMO_DEPLOYMENT_CHECKLIST.md` → Troubleshooting section

### Database Migrations

- Main schema: `db/migrations/20241103_trades_network_clerk.sql`
- Demo seed: `db/seed-trades-network-demo.sql`

## Contributing

### Code Structure

```
src/
  app/
    api/trades/              → API endpoints
    network/                 → Frontend pages
  components/trades/         → Reusable components
  lib/
    supabase-server.ts      → Clerk JWT bridge

db/
  migrations/               → SQL schema
  seed-*.sql               → Demo data

docs/                      → Setup guides
scripts/                   → Deploy automation
```

### Best Practices

- Always test with real Clerk user IDs
- Use `createSupabaseServerClient()` for API routes
- Never bypass RLS in production
- Verify token deductions in database
- Test Full Access activation via webhook

## License

Proprietary - All rights reserved

## Contact

For questions or issues, contact: support@clearskairoofing.com
