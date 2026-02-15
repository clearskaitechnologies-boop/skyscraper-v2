# Operations Runbook

> **Environment**: Vercel + Neon Postgres + Supabase Storage + Clerk Auth  
> **Last Updated**: 2026-02-04

---

## 🚀 Deployment

### Production Deploy

```bash
# From main branch
vercel --prod --yes

# Or via GitHub (auto-deploys on push to main)
git push origin main
```

### Preview Deploy

```bash
# Creates preview URL for testing
vercel

# Check deploy status
vercel ls
```

### Rollback

```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote <deployment-url>
```

---

## 🔍 Health Checks

### Quick Liveness Check

```bash
curl -s https://skaiscrape.com/api/health/live
# Expected: {"status":"ok","timestamp":"..."}
```

### Full Health Check

```bash
curl -s https://skaiscrape.com/api/health
# Returns: DB, Redis, Storage, AI status
```

### Local Health Panel

```bash
# VS Code Task
pnpm run dev  # Start dev server
open http://localhost:3000/dev/health-panel
```

---

## 🗄️ Database Operations

### Connect to Neon Console

1. Go to [console.neon.tech](https://console.neon.tech)
2. Select `skaiscrape` project
3. Use SQL Editor for queries

### Connection String

```bash
# From Vercel environment
vercel env pull .env.local
echo $DATABASE_URL
```

### Run Migrations

```bash
# Apply pending migrations
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

### Seed Data

```bash
# Northern AZ vendors
psql "$DATABASE_URL" -f ./db/seed-vendors-northern-az.sql
```

---

## 🔐 Secrets Management

### View Secrets (Vercel)

```bash
vercel env ls
vercel env pull .env.local
```

### Update Secret

```bash
# Interactive
vercel env add STRIPE_SECRET_KEY

# Or via dashboard
open https://vercel.com/team/project/settings/environment-variables
```

### Required Environment Variables

| Variable                            | Description              | Required |
| ----------------------------------- | ------------------------ | -------- |
| `DATABASE_URL`                      | Neon Postgres connection | ✅       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend           | ✅       |
| `CLERK_SECRET_KEY`                  | Clerk backend            | ✅       |
| `STRIPE_SECRET_KEY`                 | Stripe API               | ✅       |
| `STRIPE_WEBHOOK_SECRET`             | Webhook verification     | ✅       |
| `OPENAI_API_KEY`                    | GPT-4 Vision             | ✅       |
| `RESEND_API_KEY`                    | Transactional email      | ✅       |
| `UPSTASH_REDIS_REST_URL`            | Rate limiting            | ✅       |
| `UPSTASH_REDIS_REST_TOKEN`          | Rate limiting            | ✅       |
| `NEXT_PUBLIC_SUPABASE_URL`          | File storage             | ✅       |
| `SUPABASE_SERVICE_ROLE_KEY`         | Storage admin            | ✅       |

---

## 📊 Monitoring

### Sentry

- Dashboard: [sentry.io/skaiscrape](https://sentry.io/organizations/skaiscrape/)
- Check for new errors after deploys
- Set up Slack alerts for production errors

### Vercel Analytics

- Dashboard: Vercel → Project → Analytics
- Monitor Core Web Vitals
- Check function execution times

### Stripe Dashboard

- Payments: [dashboard.stripe.com](https://dashboard.stripe.com)
- Webhooks: Settings → Webhooks → Check delivery status

---

## 🚨 Incident Response

### 1. Site Down

1. Check Vercel status: [vercel.com/status](https://vercel.com/status)
2. Check Neon status: [neon.tech/status](https://neon.tech/status)
3. Check recent deploys: `vercel ls`
4. Rollback if needed: `vercel promote <previous-deploy>`

### 2. Database Issues

1. Check Neon console for connection issues
2. Verify connection pooling isn't exhausted
3. Check for long-running queries
4. Restart connection pool if needed

### 3. Payment Issues

1. Check Stripe webhook logs
2. Verify webhook secret is correct
3. Check `webhookEvent` table for failed events
4. Manually replay events if needed

### 4. Auth Issues

1. Check Clerk dashboard for outages
2. Verify API keys are valid
3. Check middleware logs for auth errors
4. Clear browser cookies and retry

---

## 📋 Common Tasks

### Add New Admin User

1. User signs up via Clerk
2. In Prisma Studio or SQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Reset User Password

Handled by Clerk - direct user to "Forgot Password" flow.

### Grant Trial Extension

```sql
UPDATE subscription
SET trialEnd = trialEnd + INTERVAL '14 days'
WHERE orgId = '<org-id>';
```

### Top Up AI Credits

```sql
UPDATE usage_tokens
SET aiRemaining = aiRemaining + 100
WHERE orgId = '<org-id>';
```

### Check Token Balance

```sql
SELECT orgId, aiRemaining, dolCheckRemain, dolFullRemain
FROM usage_tokens
WHERE orgId = '<org-id>';
```

---

## 🧪 Testing

### Run Full Test Suite

```bash
pnpm test
```

### Run Playwright E2E

```bash
pnpm test:pw:sb
```

### Test Stripe Webhooks Locally

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Start Stripe CLI
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Terminal 3: Trigger events
stripe trigger checkout.session.completed
```

---

## 📞 Contacts

| Role             | Contact | Escalation      |
| ---------------- | ------- | --------------- |
| Engineering Lead |         | Primary         |
| DevOps           |         | Infrastructure  |
| Stripe Support   |         | Billing issues  |
| Clerk Support    |         | Auth issues     |
| Neon Support     |         | Database issues |

---

## 📅 Maintenance Windows

- **Database migrations**: Deploy during low-traffic hours (2-4 AM PT)
- **Major releases**: Test in preview, deploy weekday mornings
- **Stripe changes**: Test in test mode first, verify webhooks
