# SkaiScraper Deployment Guide

**Complete production deployment guide for Vercel + Railway**

---

## Overview

SkaiScraper uses a hybrid deployment architecture:

- **Frontend & API Routes**: Vercel (Next.js App Router)
- **Worker Processes**: Railway (background jobs, image processing)
- **Database**: PostgreSQL (Railway, Supabase, or self-hosted)
- **Storage**: Cloudflare R2 (photos, PDFs, documents)
- **Auth**: Clerk (managed service)
- **Email**: Resend (transactional emails)
- **Payments**: Stripe (subscriptions & token purchases)

---

## Prerequisites

Before deploying, ensure you have accounts for:

1. **Vercel** - Frontend hosting ([vercel.com](https://vercel.com))
2. **Railway** - Worker hosting ([railway.app](https://railway.app))
3. **Clerk** - Authentication ([clerk.com](https://clerk.com))
4. **Cloudflare** - R2 storage ([cloudflare.com](https://cloudflare.com))
5. **Resend** - Email service ([resend.com](https://resend.com))
6. **Stripe** - Payments ([stripe.com](https://stripe.com))
7. **OpenAI** - AI features ([openai.com](https://openai.com))
8. **Anthropic** - Claude AI ([anthropic.com](https://anthropic.com))

---

## Part 1: Database Setup

### Option A: Railway PostgreSQL (Recommended)

1. Create new Railway project
2. Add **PostgreSQL** service
3. Copy `DATABASE_URL` from Railway dashboard
4. Format: `postgresql://user:password@host:port/database`

### Option B: Supabase PostgreSQL

1. Create Supabase project
2. Go to **Settings** → **Database**
3. Copy **Connection String** (URI mode)
4. Enable `pg_trgm` extension for search

### Run Migrations

```bash
# Set DATABASE_URL in your environment
export DATABASE_URL="postgresql://..."

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Verify connection
npx prisma db pull
```

---

## Part 2: Environment Variables

Create `.env.production` with all required variables:

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:password@host:port/db"

# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."

# ============================================
# CLERK AUTHENTICATION
# ============================================
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# ============================================
# CLOUDFLARE R2 STORAGE
# ============================================
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="skaiscraper-prod"
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_JURISDICTION="auto"
CLOUDFLARE_R2_PUBLIC_URL="https://your-bucket.r2.cloudflarestorage.com"

# ============================================
# AI PROVIDERS
# ============================================
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."

# ============================================
# EMAIL (RESEND)
# ============================================
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="reports@your-domain.com"

# ============================================
# STRIPE PAYMENTS
# ============================================
STRIPE_SECRET_KEY="sk_live_..." # Use sk_test_ for testing
STRIPE_PUBLISHABLE_KEY="pk_live_..." # Use pk_test_ for testing
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_STARTER="price_..."
STRIPE_PRICE_ID_GROWTH="price_..."
STRIPE_PRICE_ID_ENTERPRISE="price_..."

# ============================================
# OPTIONAL INTEGRATIONS
# ============================================
TWILIO_ACCOUNT_SID="AC..." # For SMS notifications
TWILIO_AUTH_TOKEN="..." # For SMS notifications
TWILIO_PHONE_NUMBER="+1..." # Your Twilio number

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_VIDEO_PROCESSING="false" # Set true if video plan
ENABLE_AI_CACHE="true" # Recommended for cost savings
ENABLE_AI_DEDUPE="true" # Prevents duplicate AI calls

# ============================================
# MONITORING (OPTIONAL)
# ============================================
SENTRY_DSN="https://..." # Error tracking
LOGTAIL_SOURCE_TOKEN="..." # Log aggregation
```

---

## Part 3: Vercel Deployment

### Initial Setup

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Link Project:**

   ```bash
   cd /path/to/skaiscraper
   vercel link
   ```

3. **Set Environment Variables:**

   ```bash
   # One-by-one (secure method)
   vercel env add DATABASE_URL
   vercel env add CLERK_SECRET_KEY
   vercel env add OPENAI_API_KEY
   # ... repeat for all variables

   # Or bulk import from .env.production
   vercel env pull .env.vercel.local
   ```

4. **Configure Build Settings:**
   - Framework: **Next.js**
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
   - Node Version: **18.x** (or 20.x)

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Custom Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `app.yourcompany.com`)
3. Update DNS records:
   - Type: `CNAME`
   - Name: `app` (or `@` for root)
   - Value: `cname.vercel-dns.com`
4. Wait for SSL certificate (automatic, ~5 minutes)

### Vercel Configuration

**`vercel.json`** (already configured):

```json
{
  "buildCommand": "pnpm build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## Part 4: Railway Worker Deployment

### Worker Setup

1. **Create Railway Project** (separate from database)

2. **Deploy Worker:**

   ```bash
   # In project root
   railway link
   railway up
   ```

3. **Set Environment Variables:**
   - Copy all env vars from Vercel
   - Add `WORKER_MODE="true"`
   - Add `STOP_AFTER_ONE="false"`

4. **Configure Worker Process:**
   - **Start Command**: `node scripts/process-uploads-worker.js`
   - **Build Command**: `pnpm install && npx prisma generate`
   - **Restart Policy**: `always`

### Worker Scripts

**AI Photo Processing Worker:**

```bash
# Railway start command
node scripts/process-uploads-worker.js
```

**Claims Export Worker:**

```bash
node scripts/export-worker.js
```

### Monitoring Workers

```bash
# View worker logs
railway logs

# Check worker status
railway status

# Restart worker
railway restart
```

---

## Part 5: Service Configuration

### Clerk Setup

1. **Production Application:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Create production application
   - Add production domain to allowed origins
   - Enable social logins (Google, Microsoft)

2. **Webhooks:**
   - Add webhook: `https://your-domain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `organization.created`
   - Copy webhook secret to `CLERK_WEBHOOK_SECRET`

3. **Organization Settings:**
   - Enable organizations
   - Set max members per org
   - Configure invitation emails

### Cloudflare R2 Setup

1. **Create R2 Bucket:**
   - Name: `skaiscraper-prod`
   - Location: Auto (closest to users)
   - Public access: Enabled

2. **Generate API Credentials:**
   - Go to **R2** → **Manage R2 API Tokens**
   - Create token with **Admin Read & Write**
   - Save Access Key ID and Secret Access Key

3. **Configure CORS:**

   ```json
   [
     {
       "AllowedOrigins": ["https://your-domain.com"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

4. **Custom Domain (Optional):**
   - Add CNAME: `files.your-domain.com` → R2 bucket URL
   - Enable custom domain in R2 settings

### Resend Email Setup

1. **Add Domain:**
   - Go to Resend → **Domains**
   - Add `your-domain.com`
   - Verify DNS records (SPF, DKIM, DMARC)

2. **Create API Key:**
   - Go to **API Keys** → **Create**
   - Permission: **Sending access**
   - Save to `RESEND_API_KEY`

3. **Configure From Address:**
   - Use `reports@your-domain.com`
   - Or subdomain: `reports@app.your-domain.com`

### Stripe Setup

1. **Activate Account:**
   - Complete Stripe onboarding
   - Provide business details
   - Add bank account for payouts

2. **Create Products & Prices:**

   ```bash
   # Starter Plan - $49/month
   stripe products create --name="Starter" --description="Basic features"
   stripe prices create --product=prod_XXX --unit-amount=4900 --currency=usd --recurring[interval]=month

   # Growth Plan - $149/month
   stripe products create --name="Growth" --description="Advanced features"
   stripe prices create --product=prod_YYY --unit-amount=14900 --currency=usd --recurring[interval]=month

   # Enterprise Plan - $399/month
   stripe products create --name="Enterprise" --description="Full platform"
   stripe prices create --product=prod_ZZZ --unit-amount=39900 --currency=usd --recurring[interval]=month
   ```

3. **Webhooks:**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

4. **Test Mode:**
   - Use test keys (`sk_test_`, `pk_test_`) initially
   - Test payments with [test cards](https://stripe.com/docs/testing)
   - Switch to live keys when ready

---

## Part 6: DNS & SSL

### DNS Configuration

**Primary Domain** (`yourcompany.com`):

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
TTL: 300
```

**App Subdomain** (`app.yourcompany.com`):

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 300
```

**Files Subdomain** (`files.yourcompany.com`):

```
Type: CNAME
Name: files
Value: your-bucket.r2.cloudflarestorage.com
TTL: 300
```

**Email Records** (for Resend):

```
# SPF
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

# DMARC
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@your-domain.com
```

### SSL Certificates

**Vercel** (Automatic):

- SSL certificate auto-provisioned via Let's Encrypt
- Auto-renewal every 90 days
- No configuration needed

**Cloudflare R2** (Automatic):

- SSL enabled by default
- Universal SSL certificate
- No configuration needed

---

## Part 7: Post-Deployment

### Verify Deployment

1. **Health Check:**

   ```bash
   curl https://your-domain.com/api/health
   # Should return: { "status": "ok", "timestamp": "..." }
   ```

2. **Database Connection:**

   ```bash
   curl https://your-domain.com/api/health/database
   # Should return: { "connected": true }
   ```

3. **AI Integration:**
   - Create test claim
   - Upload photo
   - Verify AI analysis completes

4. **Email Sending:**
   - Generate test report
   - Send via email
   - Verify delivery

### Performance Optimization

1. **Enable Caching:**

   ```typescript
   // Already configured in API routes
   export const revalidate = 3600; // 1 hour
   ```

2. **Image Optimization:**
   - Already using Next.js Image component
   - Cloudflare R2 auto-optimizes

3. **Database Optimization:**
   ```sql
   -- Add indexes (already in migrations)
   CREATE INDEX idx_claims_orgId ON claims(orgId);
   CREATE INDEX idx_claims_status ON claims(status);
   CREATE INDEX idx_activities_orgId_createdAt ON activities(orgId, createdAt DESC);
   ```

### Monitoring

1. **Vercel Analytics:**
   - Enable in Vercel project settings
   - Track performance, errors, and usage

2. **Prisma Logs:**

   ```typescript
   // Already configured for production
   log: ["error", "warn"];
   ```

3. **Error Tracking:**
   - Configure Sentry DSN
   - Track API errors and crashes

### Backup Strategy

1. **Database Backups:**

   ```bash
   # Daily automated backups (Railway)
   # Or manual backup:
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **R2 Storage:**
   - Enable versioning in R2 bucket
   - Lifecycle policy: Keep 30 days

---

## Part 8: Scaling

### Horizontal Scaling

**Vercel** (Automatic):

- Auto-scales based on traffic
- No configuration needed
- Pay per request

**Railway Workers:**

- Increase replicas for worker service
- Add load balancer if needed

### Database Scaling

**Vertical:**

- Upgrade Railway PostgreSQL plan
- Increase CPU and RAM

**Connection Pooling:**

```typescript
// Already configured in Prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

### CDN & Caching

**Cloudflare:**

- Put Vercel behind Cloudflare
- Enable page rules for caching
- Configure cache TTLs

---

## Troubleshooting

### Common Issues

**"Database connection failed":**

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure IP whitelisting (if applicable)
- Test connection: `psql $DATABASE_URL`

**"AI features not working":**

- Verify `OPENAI_API_KEY` is set
- Check API key is active (not expired)
- Verify token balance in OpenAI account
- Check logs for specific error

**"Emails not sending":**

- Verify Resend domain is verified
- Check `RESEND_API_KEY` is correct
- Verify from address matches domain
- Check email logs in Resend dashboard

**"File uploads failing":**

- Verify R2 credentials are correct
- Check bucket name matches `CLOUDFLARE_R2_BUCKET_NAME`
- Ensure CORS is configured
- Verify public access is enabled

**"Build failing on Vercel":**

- Check build logs for specific error
- Verify all dependencies in `package.json`
- Ensure `prisma generate` runs in build
- Check Node version matches (18.x or 20.x)

---

## Security Checklist

- [ ] All API keys stored in environment variables (never committed)
- [ ] Clerk production keys (not test mode)
- [ ] Stripe live mode enabled (after testing)
- [ ] Database connection uses SSL
- [ ] CORS configured correctly for R2
- [ ] Rate limiting enabled on API routes
- [ ] Webhook secrets verified on all endpoints
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection enabled (Next.js default)

---

## Maintenance

### Regular Tasks

**Daily:**

- Monitor error rates (Vercel dashboard)
- Check worker logs (Railway)
- Verify backups completed

**Weekly:**

- Review API usage (OpenAI, Anthropic)
- Check storage usage (R2)
- Monitor database size

**Monthly:**

- Update dependencies (`pnpm update`)
- Review security advisories
- Analyze performance metrics
- Check for Prisma migrations

---

## Support & Resources

**Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)  
**Railway Documentation:** [docs.railway.app](https://docs.railway.app)  
**Clerk Documentation:** [clerk.com/docs](https://clerk.com/docs)  
**Prisma Documentation:** [prisma.io/docs](https://prisma.io/docs)

**Need help?** Contact support@skaiscraper.com

---

**Last Updated:** December 9, 2025  
**Version:** 1.0 Production Ready
