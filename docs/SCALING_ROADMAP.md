# SkaiScraper — Infrastructure Scaling Roadmap

> Last updated: February 20, 2026
> Current user count: ~5 (founder testing)
> Current MRR: $0 (beta mode)

---

## Quick Reference: When to Upgrade What

| Users        | ARR Estimate | Action Required                                        |
| ------------ | ------------ | ------------------------------------------------------ |
| 0–500        | $0–$15K      | **No changes.** Current plans cover everything.        |
| 500–2,000    | $15K–$60K    | Upgrade Resend. Consider Twilio routing.               |
| 2,000–5,000  | $60K–$150K   | Upgrade Supabase to Team. Bump connection_limit to 5.  |
| 5,000–10,000 | $150K–$300K  | Upgrade Vercel to Team. Upgrade OpenAI tier.           |
| 10,000+      | $300K+       | Enterprise tiers across the board. Dedicated Postgres. |

---

## 1. Supabase (PostgreSQL + Storage + Auth)

**What it does:** Primary database, file storage (uploads, branding, exports), realtime subscriptions.

**Current plan:** Pro ($25/mo)

- 60 direct connections max
- 8 GB database space
- 100 GB storage
- 50 GB bandwidth
- 500K edge function invocations

### Scaling Thresholds

| Users        | Concern                                        | Action                                                                          | Cost    |
| ------------ | ---------------------------------------------- | ------------------------------------------------------------------------------- | ------- |
| 0–1,000      | None                                           | `connection_limit=3` via PgBouncer (done ✅)                                    | $25/mo  |
| 1,000–2,000  | Storage may hit 100 GB if many photo uploads   | Monitor storage usage in dashboard                                              | $25/mo  |
| 2,000–5,000  | Connection pressure with 50+ concurrent users  | Bump `connection_limit` to 5, upgrade to **Team** ($599/mo) for 200 connections | $599/mo |
| 5,000–10,000 | Read-heavy dashboards (leaderboard, analytics) | Add read replica ($100/mo addon). Consider pgbouncer pool_mode tuning.          | $699/mo |
| 10,000+      | Enterprise load                                | **Enterprise plan** with dedicated Postgres, SOC2                               | Custom  |

### Key Setting (current)

```
DATABASE_URL: connection_limit=3, pool_timeout=20 (via PgBouncer port 6543)
DIRECT_DATABASE_URL: port 5432 (migrations only)
```

### How to adjust later

Change `connection_limit=3` → `connection_limit=5` in:

1. Vercel Dashboard → Environment Variables → DATABASE_URL
2. `.env.local` (local dev)
3. Redeploy

---

## 2. Vercel (Hosting + Serverless Functions + Edge)

**What it does:** Hosts the Next.js app, runs all API routes as serverless functions, handles CDN/SSL.

**Current plan:** Pro ($20/mo)

- 100 GB bandwidth
- 1,000 GB-hours serverless execution
- 100,000 serverless function invocations included
- 1,000 serverless functions (routes)
- 10-second default function timeout (can set to 60s)

### Scaling Thresholds

| Users        | Concern                                   | Action                                                                                     | Cost       |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| 0–2,000      | None                                      | Pro plan handles it comfortably                                                            | $20/mo     |
| 2,000–5,000  | Function invocations may exceed 100K/mo   | Monitor usage. Overages are $0.60/100K invocations — still cheap.                          | $20–$40/mo |
| 5,000–10,000 | Concurrent function limits, bandwidth     | Upgrade to **Team** ($150/seat/mo). Gets 1TB bandwidth, 10,000 GB-hours, priority support. | $150/mo+   |
| 10,000+      | Enterprise SLAs, dedicated infrastructure | **Enterprise** plan — custom pricing, 99.99% SLA                                           | Custom     |

### Key Insight

Vercel's Pro plan is extremely generous. You won't need to upgrade until you're well past 5,000 active users or doing very heavy serverless compute (AI processing, PDF generation at scale). Bandwidth is almost never the bottleneck — serverless execution time is what costs money at scale.

---

## 3. Clerk (Authentication)

**What it does:** User authentication, session management, org membership, SSO.

**Current plan:** Pro ($25/mo)

- 10,000 monthly active users (MAUs)
- Unlimited orgs
- Multi-session support
- Custom domains

### Scaling Thresholds

| Users         | Concern                          | Action                                                  | Cost        |
| ------------- | -------------------------------- | ------------------------------------------------------- | ----------- |
| 0–10,000      | None                             | Pro plan covers up to 10K MAUs                          | $25/mo      |
| 10,000–50,000 | MAU overages                     | Each additional 1K MAUs is ~$10. At 20K users: ~$125/mo | $25–$200/mo |
| 50,000+       | Enterprise SSO, SAML, audit logs | **Enterprise** plan with SAML/SCIM for B2B customers    | Custom      |

### Key Insight

Clerk is one of your most cost-efficient services. You won't think about upgrading until 10K+ users. If you sell to enterprises that need SAML SSO, that's when you'd go Enterprise.

---

## 4. OpenAI (AI Analysis + Reports)

**What it does:** Powers AI claim analysis, report generation, photo assessment, damage estimation.

**Current plan:** API (pay-per-use)

- GPT-4o: $2.50/1M input tokens, $10/1M output tokens
- GPT-4o-mini: $0.15/1M input, $0.60/1M output
- Vision: ~$0.01–$0.03 per image analysis

### Scaling Thresholds

| Users        | Monthly API Cost Estimate | Action                                                                         | Total    |
| ------------ | ------------------------- | ------------------------------------------------------------------------------ | -------- |
| 0–500        | $10–$50/mo                | Use GPT-4o-mini for routine tasks, GPT-4o for premium reports                  | $10–$50  |
| 500–2,000    | $50–$300/mo               | Implement response caching (Upstash Redis). Batch similar requests.            | $50–$300 |
| 2,000–5,000  | $300–$1,000/mo            | Apply for **Usage Tier 3** ($1K/mo limit → $5K/mo). Add token budgets per org. | $300–$1K |
| 5,000–10,000 | $1,000–$5,000/mo          | Apply for **Usage Tier 4+**. Consider fine-tuned models for common patterns.   | $1K–$5K  |
| 10,000+      | $5,000+/mo                | Enterprise agreement with OpenAI. Dedicated throughput.                        | Custom   |

### Cost Optimization Tips (do these NOW)

1. **Cache common analyses** in Upstash Redis (weather + damage patterns repeat by region)
2. **Use GPT-4o-mini** for initial triage, GPT-4o only for final premium reports
3. **Set per-org token budgets** to prevent runaway API costs
4. **Stream responses** instead of waiting for full completion (better UX, same cost)

---

## 5. Stripe (Billing + Subscriptions)

**What it does:** Payment processing, subscription management, invoicing, webhooks.

**Current plan:** Standard (2.9% + $0.30 per transaction)

- No monthly fee
- Unlimited products/prices
- Webhook delivery included

### Scaling Thresholds

| Users      | Concern               | Action                                                             | Cost             |
| ---------- | --------------------- | ------------------------------------------------------------------ | ---------------- |
| 0–5,000    | None                  | Standard plan works perfectly                                      | 2.9% + $0.30/txn |
| 5,000+     | High volume discounts | Apply for **custom pricing** at $80K+ MRR (typically 2.5% + $0.25) | Negotiable       |
| Enterprise | Invoice-based billing | Stripe Invoicing ($0.50/invoice) or Stripe Billing portal          | ~$0.50/invoice   |

### Key Insight

Stripe doesn't have tiers to worry about. It just works. The only optimization is negotiating rates once you hit significant volume. At $30/user × 5,000 users = $150K MRR, you'd save ~$6K/year by negotiating to 2.5%.

---

## 6. Upstash Redis (Rate Limiting + Caching)

**What it does:** API rate limiting, session caching, AI response caching, real-time counters.

**Current plan:** Pay-as-you-go (Free tier: 10K commands/day)

- $0.2 per 100K commands
- 256 MB storage (free), 1 GB ($10/mo)

### Scaling Thresholds

| Users        | Daily Commands | Action                                                | Cost     |
| ------------ | -------------- | ----------------------------------------------------- | -------- |
| 0–500        | <10K           | Free tier covers it                                   | $0       |
| 500–2,000    | 10K–50K        | Pay-as-you-go kicks in — very cheap                   | $1–$5/mo |
| 2,000–10,000 | 50K–500K       | Pro plan ($10/mo) for 1 GB storage + 50K commands/day | $10/mo   |
| 10,000+      | 500K+          | Pro Max ($50/mo) — 5 GB storage, global replication   | $50/mo   |

### Key Insight

Upstash is one of the cheapest services in your stack. Even at 10,000 users, you'd spend $50/mo max. Don't worry about this one until much later.

---

## 7. Resend (Transactional Email)

**What it does:** Sends transactional emails — welcome emails, claim updates, trial expiry notices, invoice receipts.

**Current plan:** Free (100 emails/day, 3,000/mo)

### Scaling Thresholds

| Users       | Monthly Emails | Action                                      | Cost        |
| ----------- | -------------- | ------------------------------------------- | ----------- |
| 0–100       | <3,000         | Free plan works                             | $0          |
| 100–500     | 3,000–15,000   | **Upgrade to Pro** ($20/mo) — 50K emails/mo | $20/mo      |
| 500–2,000   | 15,000–60,000  | Pro still covers it (50K/mo)                | $20/mo      |
| 2,000–5,000 | 60,000–150,000 | **Business** ($80/mo) — 500K emails/mo      | $80/mo      |
| 5,000+      | 150,000+       | Business plan or Enterprise                 | $80–$200/mo |

### ⚠️ Action Needed Soon

Once you launch with paying customers, you'll likely hit the 100 emails/day free limit within the first week. **Upgrade to Resend Pro ($20/mo) before your first 100 customers.** This is the first upgrade you'll actually need.

---

## 8. Visual Crossing (Weather Data)

**What it does:** Historical and forecast weather data for storm tracking, claim correlation, weather analytics dashboard.

**Current plan:** Free (1,000 records/day)

### Scaling Thresholds

| Users       | Daily API Calls | Action                                            | Cost    |
| ----------- | --------------- | ------------------------------------------------- | ------- |
| 0–500       | <1,000          | Free tier covers it (cache aggressively in Redis) | $0      |
| 500–2,000   | 1,000–5,000     | **Standard** ($35/mo) — 10K records/day           | $35/mo  |
| 2,000–5,000 | 5,000–25,000    | **Professional** ($75/mo) — 50K records/day       | $75/mo  |
| 5,000+      | 25,000+         | **Corporate** ($250/mo) — unlimited               | $250/mo |

### Cost Optimization

Weather data is HIGHLY cacheable. The same storm data is the same for every user in that ZIP code. Cache by `(zip, date)` in Upstash Redis with 24-hour TTL. This alone can reduce API calls by 80-90%.

---

## 9. Weatherstack (Backup Weather API)

**What it does:** Backup/secondary weather data source.

**Current plan:** Free (250 requests/mo)

### Scaling Thresholds

| Users   | Action                                                        | Cost   |
| ------- | ------------------------------------------------------------- | ------ |
| 0–2,000 | Use Visual Crossing as primary, Weatherstack as fallback only | $0     |
| 2,000+  | If you need it: **Standard** ($10/mo) — 50K requests/mo       | $10/mo |

### Key Insight

You probably don't need both weather services long-term. Visual Crossing is more full-featured. Consider dropping Weatherstack unless you need it for specific data points.

---

## 10. Mapbox (Maps + Geocoding)

**What it does:** Interactive maps for storm tracking, property visualization, community mapping.

**Current plan:** Free (50K map loads/mo, 100K geocoding requests/mo)

### Scaling Thresholds

| Users        | Monthly Map Loads | Action                              | Cost        |
| ------------ | ----------------- | ----------------------------------- | ----------- |
| 0–2,000      | <50K              | Free tier covers it                 | $0          |
| 2,000–10,000 | 50K–200K          | Pay-as-you-go: $5/1K loads over 50K | $50–$750/mo |
| 10,000+      | 200K+             | Volume discount or Enterprise       | Custom      |

### Cost Optimization

- Cache geocoding results (address → lat/lng never changes)
- Use static map images where interactive isn't needed
- Lazy-load maps (only render when user scrolls to them)

---

## 11. Firebase (Storage + Analytics)

**What it does:** Photo storage (inspection photos), Google Analytics, possible future push notifications.

**Current plan:** Spark (Free)

- 1 GB storage, 10 GB bandwidth/mo

### Scaling Thresholds

| Users     | Storage Needs | Action                                                            | Cost       |
| --------- | ------------- | ----------------------------------------------------------------- | ---------- |
| 0–500     | <1 GB         | Free Spark plan                                                   | $0         |
| 500–2,000 | 1–10 GB       | **Blaze** (pay-as-you-go) — $0.026/GB storage, $0.12/GB bandwidth | $1–$10/mo  |
| 2,000+    | 10+ GB        | Blaze plan, costs scale linearly                                  | $10–$50/mo |

### Key Insight

You're also using Supabase Storage, UploadThing, and S3/DigitalOcean Spaces. Consider consolidating to one storage provider long-term to simplify billing and reduce complexity.

---

## 12. Twilio (SMS/Voice — NOT YET ROUTED)

**What it does:** Would handle SMS notifications to homeowners, claim status updates, two-factor auth backup.

**Current status:** ⚠️ API key NOT in env. Not yet integrated.

### When to Add It

| Users  | Trigger                                  | Action                                  | Cost                       |
| ------ | ---------------------------------------- | --------------------------------------- | -------------------------- |
| 500+   | Customer requests for SMS claim updates  | Integrate Twilio SMS. $0.0079/SMS sent. | ~$40–$100/mo at 5K–10K SMS |
| 2,000+ | Need voice/IVR for claims intake hotline | Add Twilio Voice. $0.014/min.           | $50–$200/mo                |
| 5,000+ | High volume                              | Negotiate volume pricing with Twilio    | Custom                     |

### Integration Plan

1. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` to env
2. Create `/api/notifications/sms` endpoint
3. Wire to claim lifecycle events (FILED → notify homeowner, APPROVED → notify contractor)
4. Add opt-in/opt-out in user settings
5. Start with transactional SMS only (claim updates), NOT marketing

---

## 13. BetterStack (Uptime Monitoring + Logs — NOT YET CONFIGURED)

**What it does:** Would monitor uptime, aggregate logs, send alerts when site goes down.

**Current status:** ⚠️ Not yet integrated (no API key in env).

### When to Add It

| Users  | Trigger                      | Action                                                                       | Cost        |
| ------ | ---------------------------- | ---------------------------------------------------------------------------- | ----------- |
| Launch | Before first paying customer | Set up BetterStack Uptime ($24/mo) — monitors skaiscrape.com + API endpoints | $24/mo      |
| 500+   | Need log aggregation         | BetterStack Logs ($24/mo) — centralized logging                              | $24/mo      |
| 2,000+ | Need incident management     | Full BetterStack suite + PagerDuty/Slack integration                         | $50–$100/mo |

### ⚠️ Action Needed Before Launch

You should set up basic uptime monitoring BEFORE your first paying customer. If the site goes down at 2 AM, you need to know immediately — not when a customer emails you.

---

## 14. Sentry (Error Tracking)

**What it does:** Captures runtime errors, performance monitoring, session replay.

**Current plan:** Developer (Free)

- 5K errors/mo
- 10K performance transactions/mo
- 500 replays/mo

### Scaling Thresholds

| Users       | Concern                                           | Action                                                   | Cost   |
| ----------- | ------------------------------------------------- | -------------------------------------------------------- | ------ |
| 0–1,000     | None                                              | Free Developer plan works                                | $0     |
| 1,000–5,000 | May exceed 5K errors/mo during active development | **Team** ($26/mo) — 50K errors, 100K transactions        | $26/mo |
| 5,000+      | High volume                                       | **Business** ($80/mo) — 100K+ errors, advanced filtering | $80/mo |

---

## 15. UploadThing (File Uploads)

**What it does:** Handles file uploads (photos, documents) with presigned URLs.

**Current plan:** Free (2 GB storage, 2 GB bandwidth/mo)

### Scaling Thresholds

| Users     | Storage | Action                                              | Cost   |
| --------- | ------- | --------------------------------------------------- | ------ |
| 0–500     | <2 GB   | Free plan                                           | $0     |
| 500–2,000 | 2–20 GB | **Pro** ($30/mo) — 100 GB storage, 100 GB bandwidth | $30/mo |
| 2,000+    | 20+ GB  | Pro covers up to 100 GB                             | $30/mo |

---

## 16. Replicate (AI Image Processing)

**What it does:** AI-powered image analysis, photo enhancement, damage detection models.

**Current plan:** Pay-per-use

- ~$0.0023/second for most models
- Typical image processing: $0.01–$0.05 per image

### Scaling Thresholds

| Users     | Monthly Images | Action                                               | Cost        |
| --------- | -------------- | ---------------------------------------------------- | ----------- |
| 0–500     | <1,000         | Pay-as-you-go                                        | $5–$50/mo   |
| 500–2,000 | 1,000–5,000    | Same, monitor spend                                  | $50–$250/mo |
| 2,000+    | 5,000+         | Consider self-hosting models on GPU for cost savings | $250+/mo    |

---

## Total Monthly Cost Projections

### At Launch (0–100 users)

| Service         | Plan        | Cost                   |
| --------------- | ----------- | ---------------------- |
| Supabase        | Pro         | $25                    |
| Vercel          | Pro         | $20                    |
| Clerk           | Pro         | $25                    |
| Stripe          | Standard    | $0 (% of transactions) |
| OpenAI          | Pay-per-use | ~$10                   |
| Upstash         | Free        | $0                     |
| Resend          | Free → Pro  | $0–$20                 |
| Visual Crossing | Free        | $0                     |
| Mapbox          | Free        | $0                     |
| Firebase        | Free        | $0                     |
| Sentry          | Free        | $0                     |
| UploadThing     | Free        | $0                     |
| BetterStack     | Uptime      | $24                    |
| **TOTAL**       |             | **~$104–$124/mo**      |

### At 1,000 Users (~$30K MRR)

| Service         | Plan          | Cost                                   |
| --------------- | ------------- | -------------------------------------- |
| Supabase        | Pro           | $25                                    |
| Vercel          | Pro           | $20                                    |
| Clerk           | Pro           | $25                                    |
| Stripe          | Standard      | ~$900 (2.9% of $30K)                   |
| OpenAI          | Pay-per-use   | ~$100                                  |
| Upstash         | Pay-per-use   | ~$5                                    |
| Resend          | Pro           | $20                                    |
| Visual Crossing | Standard      | $35                                    |
| Mapbox          | Free          | $0                                     |
| Firebase        | Blaze         | ~$5                                    |
| Sentry          | Free          | $0                                     |
| UploadThing     | Pro           | $30                                    |
| BetterStack     | Uptime + Logs | $48                                    |
| **TOTAL**       |               | **~$1,313/mo**                         |
| **Margin**      |               | **$30,000 - $1,313 = $28,687 (95.6%)** |

### At 5,000 Users (~$150K MRR)

| Service         | Plan          | Cost                                     |
| --------------- | ------------- | ---------------------------------------- |
| Supabase        | Team          | $599                                     |
| Vercel          | Pro           | $20                                      |
| Clerk           | Pro (overage) | ~$75                                     |
| Stripe          | Standard      | ~$4,350                                  |
| OpenAI          | Tier 3        | ~$500                                    |
| Upstash         | Pro           | $10                                      |
| Resend          | Business      | $80                                      |
| Visual Crossing | Professional  | $75                                      |
| Mapbox          | Pay-per-use   | ~$100                                    |
| Firebase        | Blaze         | ~$20                                     |
| Sentry          | Team          | $26                                      |
| UploadThing     | Pro           | $30                                      |
| BetterStack     | Full suite    | $100                                     |
| Twilio          | SMS           | ~$100                                    |
| **TOTAL**       |               | **~$6,085/mo**                           |
| **Margin**      |               | **$150,000 - $6,085 = $143,915 (95.9%)** |

### At 10,000 Users (~$300K MRR)

| Service         | Plan            | Cost                                      |
| --------------- | --------------- | ----------------------------------------- |
| Supabase        | Team + Replicas | ~$800                                     |
| Vercel          | Team            | $150                                      |
| Clerk           | Pro (overage)   | ~$125                                     |
| Stripe          | Custom          | ~$7,500                                   |
| OpenAI          | Tier 4          | ~$2,000                                   |
| Upstash         | Pro Max         | $50                                       |
| Resend          | Business        | $80                                       |
| Visual Crossing | Corporate       | $250                                      |
| Mapbox          | Volume          | ~$300                                     |
| Firebase        | Blaze           | ~$50                                      |
| Sentry          | Business        | $80                                       |
| UploadThing     | Pro             | $30                                       |
| BetterStack     | Full            | $100                                      |
| Twilio          | Volume          | ~$200                                     |
| **TOTAL**       |                 | **~$11,715/mo**                           |
| **Margin**      |                 | **$300,000 - $11,715 = $288,285 (96.1%)** |

---

## Priority Upgrade Sequence (in order)

1. **NOW:** ✅ Supabase `connection_limit=3` (done)
2. **Before launch:** BetterStack uptime monitoring ($24/mo)
3. **At ~100 paying users:** Resend Pro ($20/mo)
4. **At ~500 users:** Visual Crossing Standard ($35/mo)
5. **At ~1,000 users:** UploadThing Pro ($30/mo)
6. **At ~2,000 users:** Supabase Team ($599/mo), Twilio SMS integration
7. **At ~5,000 users:** Vercel Team ($150/mo), OpenAI Tier 3
8. **At ~10,000 users:** Enterprise tiers across the board

---

## The Big Picture

**Your SaaS margins are exceptional.** Even at 10,000 users, infrastructure costs are under 4% of revenue. The architecture you've built (serverless, managed services, PgBouncer pooling) is designed to scale efficiently. You won't need to make any drastic infrastructure changes — just gradually upgrade plans as revenue grows.

The most important takeaway: **don't over-invest in infrastructure before you have the users to justify it.** Every dollar you spend on infra today without users is a dollar not spent on sales, marketing, or product.
