# SkaiScrape Infrastructure Cost Audit

> **Generated:** June 2025
> **Scope:** Every paid API, service, and integration in the SkaiScrape platform
> **Projection Tiers:** 500 → 1,000 → 2,000 → 5,000 DAU

---

## Table of Contents

1. [Assumptions & Usage Ratios](#1-assumptions--usage-ratios)
2. [Service-by-Service Breakdown](#2-service-by-service-breakdown)
3. [Monthly Cost Projection Table](#3-monthly-cost-projection-table)
4. [Scaling Breakpoints & Tier Triggers](#4-scaling-breakpoints--tier-triggers)
5. [Cost Optimization Recommendations](#5-cost-optimization-recommendations)
6. [Risk Flags](#6-risk-flags)

---

## 1. Assumptions & Usage Ratios

These ratios are based on a **storm restoration SaaS** usage pattern where users create claims, generate reports, send proposals, and manage vendors.

| Metric                           | Per DAU / Day | Notes                                         |
| -------------------------------- | :-----------: | --------------------------------------------- |
| **Claims created**               |      0.3      | Not every user creates a claim every day      |
| **AI calls (total)**             |      2.5      | Report gen, BATF analysis, chat, OCR, etc.    |
| **AI vision calls (image)**      |      0.5      | Photo analysis, damage detection              |
| **Emails sent**                  |      1.5      | Welcome, proposals, signatures, notifications |
| **SMS sent**                     |      0.3      | Auth codes, claim alerts                      |
| **Weather API lookups**          |      0.4      | Hail/storm verification per claim             |
| **Map loads (Mapbox)**           |      1.0      | Dashboard map views                           |
| **Storage uploads (MB)**         |     5 MB      | Photos, PDFs, branding                        |
| **DB queries**                   |      50       | Page loads, API calls, CRUD                   |
| **Sentry events**                |      0.5      | Error tracking per user                       |
| **PostHog events**               |      5.0      | Page views, clicks, feature usage             |
| **Redis commands**               |      20       | Rate limiting, cache, session                 |
| **AI image generation (DALL-E)** |     0.02      | Before/after renders (rare)                   |
| **Monthly Active Users (MAU)**   |    DAU × 3    | Standard DAU→MAU ratio                        |

### Monthly Multiplier

|   DAU |    MAU | Monthly Active Days | Total Monthly Sessions |
| ----: | -----: | :-----------------: | :--------------------: |
|   500 |  1,500 |         30          |         15,000         |
| 1,000 |  3,000 |         30          |         30,000         |
| 2,000 |  6,000 |         30          |         60,000         |
| 5,000 | 15,000 |         30          |        150,000         |

---

## 2. Service-by-Service Breakdown

### 2A. OpenAI / AI Services

**Models found in codebase (62+ call sites):**

| Model                     | Input / 1M tokens | Output / 1M tokens | Used For                        |
| ------------------------- | :---------------: | :----------------: | ------------------------------- |
| `gpt-4o`                  |       $2.50       |       $10.00       | Smart analysis, BATF engine     |
| `gpt-4o-mini`             |       $0.15       |       $0.60        | Default model, fast tasks, chat |
| `gpt-4-turbo-preview` ⚠️  |      $10.00       |       $30.00       | Legacy callOpenAI default       |
| `gpt-4-vision-preview` ⚠️ |      $10.00       |       $30.00       | Legacy vision calls             |
| `gpt-4` ⚠️                |      $30.00       |       $60.00       | Legacy direct calls             |
| `gpt-3.5-turbo`           |       $0.50       |       $1.50        | Simple classification           |
| `text-embedding-3-small`  |       $0.02       |         —          | Vector search, RAG              |
| `text-embedding-3-large`  |       $0.13       |         —          | High-fidelity embeddings        |
| `DALL-E 3`                |         —         |         —          | $0.04–$0.08/image               |

> ⚠️ **LEGACY MODELS** — `gpt-4-turbo-preview`, `gpt-4-vision-preview`, and `gpt-4` cost **4×–20×** more than `gpt-4o`/`gpt-4o-mini`. Migrating these saves ~60% on AI costs.

**Average cost per AI call (blended across models):**

| Call Type             | Avg Tokens (in+out) | Cost/Call (current mix) | Cost/Call (optimized) |
| --------------------- | :-----------------: | :---------------------: | :-------------------: |
| Standard text (mini)  |       ~1,500        |         $0.001          |        $0.001         |
| Standard text (4o)    |       ~2,000        |         $0.025          |        $0.025         |
| Vision/image analysis |   ~2,000 + image    |       $0.03–$0.10       |      $0.01–$0.03      |
| BATF Engine (4 calls) |    ~8,000 total     |       $0.10–$0.15       |      $0.04–$0.06      |
| Embedding             |        ~500         |        $0.00001         |       $0.00001        |
| DALL-E 3 image        |       1 image       |       $0.04–$0.08       |      $0.04–$0.08      |

**Monthly AI cost projection (blended $0.015/call avg current, $0.008 optimized):**

|   DAU | AI Calls/Month | Monthly Cost (Current) | Monthly Cost (Optimized) |
| ----: | :------------: | :--------------------: | :----------------------: |
|   500 |     37,500     |        **$563**        |           $300           |
| 1,000 |     75,000     |       **$1,125**       |           $600           |
| 2,000 |    150,000     |       **$2,250**       |          $1,200          |
| 5,000 |    375,000     |       **$5,625**       |          $3,000          |

---

### 2B. Supabase (Database + Auth + Storage)

**Current Plan:** Pro ($25/mo) with Micro compute ($10/mo included in credits)

| Resource           | Pro Included |  Overage Rate   |
| ------------------ | :----------: | :-------------: |
| Database size      |     8 GB     |    $0.125/GB    |
| Egress             |    250 GB    |    $0.09/GB     |
| File storage       |    100 GB    |    $0.021/GB    |
| MAU (auth)         |   100,000    |  $0.00325/MAU   |
| Pooler connections | 200 (Micro)  | Upgrade compute |

**Compute tiers (when you need more connections):**

| Compute | $/mo |  RAM  | Pooler Connections |
| ------- | :--: | :---: | :----------------: |
| Micro   | $10  | 1 GB  |        200         |
| Small   | $15  | 2 GB  |        400         |
| Medium  | $60  | 4 GB  |        600         |
| Large   | $110 | 8 GB  |        800         |
| XL      | $210 | 16 GB |       1,000        |
| 2XL     | $410 | 32 GB |       1,500        |

**⚠️ CRITICAL:** Your codebase has DUAL connection pools (Prisma + raw `pg Pool`), both hitting the same Supabase instance. This **doubles** your connection consumption. At 200 pooler connections (Micro), you'll hit limits fast.

**Monthly Supabase projection:**

|   DAU | DB Size Est | Storage Est | Compute Needed |           Monthly Cost           |
| ----: | :---------: | :---------: | :------------: | :------------------------------: |
|   500 |    ~2 GB    |   ~15 GB    |  Micro (200)   |             **$25**              |
| 1,000 |    ~5 GB    |   ~40 GB    |  Small (400)   |             **$30**              |
| 2,000 |   ~12 GB    |   ~80 GB    |  Medium (600)  |             **$75**              |
| 5,000 |   ~30 GB    |   ~200 GB   |  Large (800)   | **$140** + $2.75 storage overage |

> At 5,000 DAU with dual pools, you'll likely need **XL ($210/mo)** or consolidate to a single pool.

---

### 2C. Vercel (Hosting + Functions + Edge)

**Current Plan:** Pro ($20/mo per team member)

| Resource             | Pro Included  |    Overage     |
| -------------------- | :-----------: | :------------: |
| Edge Requests        |     1M/mo     |    $0.65/1M    |
| Fast Data Transfer   |   100 GB/mo   |    $0.15/GB    |
| Function Active CPU  |   4 hrs/mo    |    $0.18/hr    |
| Function Memory      | 360 GB-hrs/mo | $0.00005/GB-hr |
| Function Invocations |     1M/mo     |    $0.60/1M    |
| Image Optimization   |   5,000/mo    |    $5/1,000    |
| Cron Jobs            |   Included    |       —        |

**Monthly Vercel projection (assuming 2 team seats):**

|   DAU | Edge Reqs/Mo | Fn Invocations | Data Transfer |    Monthly Cost    |
| ----: | :----------: | :------------: | :-----------: | :----------------: |
|   500 |    ~500K     |     ~200K      |    ~20 GB     | **$40** (2 seats)  |
| 1,000 |     ~1M      |     ~400K      |    ~40 GB     |      **$40**       |
| 2,000 |    ~2.5M     |     ~800K      |    ~80 GB     |      **$41**       |
| 5,000 |     ~6M      |      ~2M       |    ~200 GB    | **$58** + overages |

> At 5,000 DAU, function CPU time (60s max per function) becomes the bottleneck. Heavy AI routes could push CPU hours to 10+ hrs/mo → **~$41 in CPU overages**.

---

### 2D. Clerk (Authentication)

**Current Plan:** Pro ($20/mo, includes 50K MRU)

| Plan     | $/mo | MRU Included |  Overage  |
| -------- | :--: | :----------: | :-------: |
| Pro      | $20  |    50,000    | $0.02/MRU |
| Business | $250 |    50,000    | $0.02/MRU |

> MRU = Monthly Retained Users (anyone who signed up, ever). This grows monotonically.

**Monthly Clerk projection:**

|   DAU |  MAU   | Cumulative MRU (Est Y1) |          Monthly Cost          |
| ----: | :----: | :---------------------: | :----------------------------: |
|   500 | 1,500  |         ~5,000          |            **$20**             |
| 1,000 | 3,000  |         ~12,000         |            **$20**             |
| 2,000 | 6,000  |         ~30,000         |            **$20**             |
| 5,000 | 15,000 |         ~60,000         | **$220** (10K × $0.02 overage) |

> **Breakpoint:** At ~50K cumulative users, overage kicks in. Plan for this around 3,000–4,000 DAU.

---

### 2E. Stripe (Payment Processing)

**Standard pricing:** 2.9% + $0.30 per transaction

**Your tiers:** Solo / Pro ($80/seat) / Enterprise

|   DAU | Est. Transactions/Mo | Avg Transaction | Gross Revenue | Stripe Fees |
| ----: | :------------------: | :-------------: | :-----------: | :---------: |
|   500 |         150          |       $80       |    $12,000    |  **$498**   |
| 1,000 |         300          |       $80       |    $24,000    |  **$996**   |
| 2,000 |         600          |       $80       |    $48,000    | **$1,992**  |
| 5,000 |        1,500         |       $80       |   $120,000    | **$4,980**  |

> Stripe Connect (marketplace) adds another 0.25% + $0.25 on connected account payments. Factor ~$0.50 extra per vendor payout.

---

### 2F. Resend (Email)

**Plans:**

| Plan  | $/mo | Emails/Mo |    Overage    |
| ----- | :--: | :-------: | :-----------: |
| Free  |  $0  |   3,000   | 100/day limit |
| Pro   | $20  |  50,000   |   $0.90/1K    |
| Scale | $90  |  100,000  |   $0.90/1K    |

**Monthly email projection (1.5 emails/DAU/day):**

|   DAU | Emails/Month | Plan Needed |           Monthly Cost           |
| ----: | :----------: | :---------: | :------------------------------: |
|   500 |    22,500    |     Pro     |             **$20**              |
| 1,000 |    45,000    |     Pro     |             **$20**              |
| 2,000 |    90,000    |    Scale    |             **$90**              |
| 5,000 |   225,000    |    Scale    | **$203** ($90 + 125K × $0.90/1K) |

---

### 2G. Twilio (SMS)

**Rate:** ~$0.0079/SMS outbound (US)

|   DAU | SMS/Month (0.3/DAU/day) | Monthly Cost |
| ----: | :---------------------: | :----------: |
|   500 |          4,500          |   **$36**    |
| 1,000 |          9,000          |   **$71**    |
| 2,000 |         18,000          |   **$142**   |
| 5,000 |         45,000          |   **$356**   |

> Plus Twilio phone number: ~$1.15/mo per number

---

### 2H. Visual Crossing (Weather API)

**Plans:**

| Plan         |      $/mo      | Records/Mo |
| ------------ | :------------: | :--------: |
| Professional |      $35       | 10,000,000 |
| Metered      | $0.0001/record | Unlimited  |
| Corporate    |      $150      | Unlimited  |

**Monthly weather projection (0.4 lookups/DAU/day, ~100 records each):**

|   DAU | Records/Month | Plan Needed  | Monthly Cost |
| ----: | :-----------: | :----------: | :----------: |
|   500 |    600,000    | Professional |   **$35**    |
| 1,000 |   1,200,000   | Professional |   **$35**    |
| 2,000 |   2,400,000   | Professional |   **$35**    |
| 5,000 |   6,000,000   | Professional |   **$35**    |

> Professional plan handles up to 10M records/mo — covers 5K DAU easily. WeatherStack as fallback: Free tier covers ~1K calls/mo, Standard $10/mo for 50K.

**WeatherStack (fallback):** $10/mo Standard plan for safety → **$10/mo flat**

---

### 2I. Mapbox (Maps + Geocoding)

**Free tier:** 50,000 map loads/mo, 100,000 geocoding requests/mo

|   DAU | Map Loads/Mo | Geocode/Mo |      Monthly Cost       |
| ----: | :----------: | :--------: | :---------------------: |
|   500 |    15,000    |   5,000    |      **$0** (free)      |
| 1,000 |    30,000    |   10,000   |      **$0** (free)      |
| 2,000 |    60,000    |   20,000   |  **$50** (10K × $5/1K)  |
| 5,000 |   150,000    |   50,000   | **$500** (100K × $5/1K) |

> **Breakpoint:** At ~1,700 DAU you exceed the 50K free map loads. Cost jumps sharply.

---

### 2J. Sentry (Error Monitoring)

**Current Plan:** Team ($26/mo, 50K errors, 5M spans)

|   DAU | Errors/Month (0.5/DAU/day) | Spans/Mo |  Plan Needed   |  Monthly Cost  |
| ----: | :------------------------: | :------: | :------------: | :------------: |
|   500 |           7,500            |  ~100K   |      Team      |    **$26**     |
| 1,000 |           15,000           |  ~200K   |      Team      |    **$26**     |
| 2,000 |           30,000           |  ~500K   |      Team      |    **$26**     |
| 5,000 |           75,000           |   ~1M    | Team + overage | **$52** (est.) |

> At 5,000 DAU you'll exceed 50K errors. Buy 100K reserved errors (~$52/mo) or upgrade to Business ($80/mo).

---

### 2K. Upstash Redis

**Current Plan:** Pay-as-you-go ($0.20/100K commands)

|   DAU | Commands/Month (20/DAU/day) | Monthly Cost |
| ----: | :-------------------------: | :----------: |
|   500 |           300,000           |  **$0.60**   |
| 1,000 |           600,000           |  **$1.20**   |
| 2,000 |          1,200,000          |  **$2.40**   |
| 5,000 |          3,000,000          |  **$6.00**   |

> Extremely cost-effective. Fixed plan ($10/mo) makes sense only above ~5M commands.

> **Note:** You also run ioredis (TCP) for BullMQ job queues — if this is a separate Redis instance, add $10–$15/mo for a managed Redis.

---

### 2L. Firebase (Backup Storage)

**Plan:** Blaze (pay-as-you-go)

| Resource         |     Rate     |
| ---------------- | :----------: |
| Storage          | $0.026/GB/mo |
| Bandwidth        |   $0.12/GB   |
| Firestore reads  |  $0.06/100K  |
| Firestore writes |  $0.18/100K  |

|   DAU | Firebase Storage | Bandwidth | Firestore Ops | Monthly Cost |
| ----: | :--------------: | :-------: | :-----------: | :----------: |
|   500 |      ~5 GB       |   ~2 GB   |     ~50K      |  **$0.40**   |
| 1,000 |      ~10 GB      |   ~5 GB   |     ~100K     |  **$0.92**   |
| 2,000 |      ~20 GB      |  ~10 GB   |     ~200K     |  **$1.96**   |
| 5,000 |      ~50 GB      |  ~30 GB   |     ~500K     |  **$5.60**   |

> Firebase is your fallback — costs stay minimal unless primary storage fails over.

---

### 2M. PostHog (Analytics)

**Free tier:** 1M events/mo

|   DAU | Events/Month (5/DAU/day) | Monthly Cost |
| ----: | :----------------------: | :----------: |
|   500 |          75,000          |    **$0**    |
| 1,000 |         150,000          |    **$0**    |
| 2,000 |         300,000          |    **$0**    |
| 5,000 |         750,000          |    **$0**    |

> Free tier covers you all the way to 5,000 DAU. At ~6,700 DAU you'd hit 1M events.

---

### 2N. Cloudflare R2 (Template Assets)

**Free tier:** 10 GB storage, 1M Class A ops, 10M Class B ops

|   DAU | Storage | Monthly Cost |
| ----: | :-----: | :----------: |
|   500 |  ~2 GB  |    **$0**    |
| 1,000 |  ~3 GB  |    **$0**    |
| 2,000 |  ~5 GB  |    **$0**    |
| 5,000 |  ~8 GB  |    **$0**    |

> Template assets don't grow with users. R2 stays free.

---

### 2O. Replicate (AI Image Generation)

**Rate:** ~$0.0023/second for SDXL (Stability AI), typical image ~15 seconds = **~$0.035/image**

|   DAU | Images/Month (0.02/DAU/day) | Monthly Cost |
| ----: | :-------------------------: | :----------: |
|   500 |             300             |   **$11**    |
| 1,000 |             600             |   **$21**    |
| 2,000 |            1,200            |   **$42**    |
| 5,000 |            3,000            |   **$105**   |

---

### 2P. Additional Services (Flat/Minimal)

| Service              | What It Does                  | Monthly Cost | Notes                         |
| -------------------- | ----------------------------- | :----------: | ----------------------------- |
| **Anthropic/Claude** | AI fallback provider          |  **$0–$50**  | Only if AI_PROVIDER=anthropic |
| **Synthesia**        | AI video generation           |  **$0–$30**  | Custom plan, used rarely      |
| **Web Push (VAPID)** | Browser push notifications    |    **$0**    | Self-hosted, free             |
| **BullMQ Redis**     | Job queue (ioredis TCP)       | **$10–$15**  | Separate managed Redis        |
| **Domain/DNS**       | skaiscrape.com, clearskai.com |   **$25**    | ~$12.50/domain/year           |

---

## 3. Monthly Cost Projection Table

### 💰 THE FULL PICTURE

| Service                  |  500 DAU   | 1,000 DAU  | 2,000 DAU  |  5,000 DAU  |
| ------------------------ | :--------: | :--------: | :--------: | :---------: |
| **OpenAI (current)**     |    $563    |   $1,125   |   $2,250   |   $5,625    |
| **OpenAI (optimized)**   |   _$300_   |   _$600_   |  _$1,200_  |  _$3,000_   |
| **Supabase**             |    $25     |    $30     |    $75     |  $140–$210  |
| **Vercel (2 seats)**     |    $40     |    $40     |    $41     |  $58–$100   |
| **Clerk**                |    $20     |    $20     |    $20     |    $220     |
| **Stripe fees**          |    $498    |    $996    |   $1,992   |   $4,980    |
| **Resend**               |    $20     |    $20     |    $90     |    $203     |
| **Twilio SMS**           |    $36     |    $71     |    $142    |    $356     |
| **Visual Crossing**      |    $35     |    $35     |    $35     |     $35     |
| **WeatherStack**         |    $10     |    $10     |    $10     |     $10     |
| **Mapbox**               |     $0     |     $0     |    $50     |    $500     |
| **Sentry**               |    $26     |    $26     |    $26     |     $52     |
| **Upstash Redis**        |     $1     |     $1     |     $2     |     $6      |
| **Firebase**             |     $1     |     $1     |     $2     |     $6      |
| **PostHog**              |     $0     |     $0     |     $0     |     $0      |
| **Cloudflare R2**        |     $0     |     $0     |     $0     |     $0      |
| **Replicate**            |    $11     |    $21     |    $42     |    $105     |
| **BullMQ Redis**         |    $10     |    $10     |    $10     |     $10     |
| **Anthropic (if used)**  |     $0     |     $0     |     $0     |   $0–$50    |
| **Domains**              |     $2     |     $2     |     $2     |     $2      |
|                          |            |            |            |             |
| **TOTAL (current)**      | **$1,298** | **$2,408** | **$4,789** | **$12,308** |
| **TOTAL (AI optimized)** | **$1,035** | **$1,883** | **$3,739** | **$9,683**  |

### Revenue vs. Cost Ratio

|   DAU | Est. Monthly Revenue | Total Cost (current) | Cost (optimized) | Margin (current) | Margin (optimized) |
| ----: | :------------------: | :------------------: | :--------------: | :--------------: | :----------------: |
|   500 |       $12,000        |        $1,298        |      $1,035      |    **89.2%**     |     **91.4%**      |
| 1,000 |       $24,000        |        $2,408        |      $1,883      |    **90.0%**     |     **92.2%**      |
| 2,000 |       $48,000        |        $4,789        |      $3,739      |    **90.0%**     |     **92.2%**      |
| 5,000 |       $120,000       |       $12,308        |      $9,683      |    **89.7%**     |     **91.9%**      |

---

## 4. Scaling Breakpoints & Tier Triggers

These are the DAU thresholds where a service forces a plan upgrade or cost jump:

| Breakpoint DAU | Service  | What Happens                                             | Cost Impact    |
| :------------: | :------- | :------------------------------------------------------- | :------------- |
|    **~800**    | Supabase | Dual pools exhaust 200 Micro connections → upgrade Small | +$5/mo         |
|   **~1,200**   | Resend   | Exceed 50K emails/mo → need Scale plan                   | +$70/mo        |
|   **~1,700**   | Mapbox   | Exceed 50K free map loads → $5/1K overage                | +$0 → $50+/mo  |
|   **~2,000**   | Supabase | DB exceeds 8 GB → storage overage + Medium compute       | +$50/mo        |
|   **~3,500**   | Clerk    | Cumulative MRU approaches 50K → overage at $0.02/MRU     | +$0 → $200+/mo |
|   **~3,500**   | Sentry   | Errors approach 50K/mo → reserved upgrade                | +$26/mo        |
|   **~5,000**   | Vercel   | Function CPU time exceeds 4 hrs/mo                       | +$15–$40/mo    |
|   **~6,700**   | PostHog  | Exceed 1M free events → starts billing                   | +$0 → TBD      |
|  **~10,000**   | Supabase | Pooler connections maxed at 800 (Large) → need XL        | +$100/mo       |

---

## 5. Cost Optimization Recommendations

### 🔴 HIGH IMPACT (do immediately)

| #   | Action                                                                | Savings/Mo                     | Effort |
| --- | :-------------------------------------------------------------------- | :----------------------------- | :----: |
| 1   | **Migrate all legacy OpenAI models** to gpt-4o/gpt-4o-mini            | $263–$2,625 (50%+ of AI costs) | Medium |
| 2   | **Consolidate dual DB pools** (remove raw `pg Pool`, use Prisma only) | Delays $100+ Supabase upgrade  |  Low   |
| 3   | **Cache weather results** in Redis (storm data rarely changes)        | -50% weather calls = ~$17/mo   |  Low   |

### 🟡 MEDIUM IMPACT (do before 2,000 DAU)

| #   | Action                                                                    | Savings/Mo                       | Effort |
| --- | :------------------------------------------------------------------------ | :------------------------------- | :----: |
| 4   | **Add AI call result caching** (same report → same response)              | -30% AI calls = ~$169–$1,688     | Medium |
| 5   | **Implement Mapbox static maps** for email/PDF (cheaper than interactive) | Delays Mapbox billing            |  Low   |
| 6   | **Batch email sending** via Resend batch API                              | Better deliverability, same cost |  Low   |

### 🟢 NICE TO HAVE (do before 5,000 DAU)

| #   | Action                                            | Savings/Mo                       | Effort |
| --- | :------------------------------------------------ | :------------------------------- | :----: |
| 7   | **Consolidate 5 PDF engines** to 1 (Playwright)   | Reduced bundle, fewer deps       |  High  |
| 8   | **Unify 4 storage backends** to Supabase + R2     | Simpler ops, fewer failure modes |  High  |
| 9   | **Negotiate Stripe volume discount** at $50K+ MRR | Save 0.2–0.5% on processing      |  Low   |

---

## 6. Risk Flags

### 🚨 CRITICAL

1. **Firebase private key committed in plaintext** — Rotate immediately, scrub git history
2. **Dual database pools** — Double connection consumption will force premature Supabase upgrades
3. **Legacy OpenAI models** — gpt-4-turbo-preview costs $10/$30 per 1M tokens vs gpt-4o at $2.50/$10. Some calls use `gpt-4` at **$30/$60 per 1M tokens**

### ⚠️ WATCH

4. **5 Supabase client patterns** — Fragmented initialization increases risk of connection leaks
5. **Stripe seat billing at $80/seat** — At 100+ seats (Titan Restoration), validate enterprise discount
6. **Twilio SMS costs scale linearly** — Consider Web Push as primary notification, SMS as fallback only
7. **Mapbox free tier cliff** — $0 → $500/mo jump at 5,000 DAU. Consider Google Maps API (28K free loads/mo) or OpenStreetMap/Leaflet

---

## Appendix: Raw Service Inventory

| #   | Service         | Type               | Env Var / Config                | Current Plan     |
| --- | :-------------- | :----------------- | :------------------------------ | :--------------- |
| 1   | OpenAI          | AI/LLM             | `OPENAI_API_KEY`                | Pay-as-you-go    |
| 2   | Supabase        | DB + Auth + Store  | `DATABASE_URL`, `SUPABASE_*`    | Pro ($25)        |
| 3   | Vercel          | Hosting            | Deployment config               | Pro ($20/seat)   |
| 4   | Clerk           | Authentication     | `CLERK_*`                       | Pro ($20)        |
| 5   | Stripe          | Payments           | `STRIPE_*`                      | Standard         |
| 6   | Resend          | Email              | `RESEND_API_KEY`                | Pro ($20)        |
| 7   | Twilio          | SMS                | `TWILIO_*`                      | Pay-as-you-go    |
| 8   | Visual Crossing | Weather (primary)  | `VISUAL_CROSSING_API_KEY`       | Professional     |
| 9   | WeatherStack    | Weather (backup)   | `WEATHERSTACK_API_KEY`          | Standard ($10)   |
| 10  | Mapbox          | Maps + Geocoding   | `MAPBOX_TOKEN`                  | Free tier        |
| 11  | Sentry          | Error Monitoring   | `SENTRY_*`                      | Team ($26)       |
| 12  | Upstash Redis   | Cache + Rate Limit | `UPSTASH_REDIS_*`               | Pay-as-you-go    |
| 13  | Firebase        | Backup Storage     | `firebase-service-account.json` | Blaze (PAYG)     |
| 14  | PostHog         | Analytics          | `POSTHOG_*`                     | Free             |
| 15  | Cloudflare R2   | Template Assets    | `R2_*`                          | Free             |
| 16  | Replicate       | AI Image Gen       | `REPLICATE_API_TOKEN`           | Pay-as-you-go    |
| 17  | Anthropic       | AI Fallback        | `ANTHROPIC_API_KEY`             | Pay-as-you-go    |
| 18  | Synthesia       | AI Video           | `SYNTHESIA_API_KEY`             | Custom           |
| 19  | BullMQ/ioredis  | Job Queue          | `REDIS_URL`                     | Managed Redis    |
| 20  | Web Push/VAPID  | Push Notify        | `VAPID_*`                       | Free (self-host) |
| 21  | Open-Meteo      | Weather (free)     | No key needed                   | Free             |
| 22  | NOAA/NWS        | Weather (free)     | No key needed                   | Free             |

---

_This audit covers every paid integration discovered across 62+ AI call sites, 8+ email templates, 4 storage backends, 659 API route files, and 569+ pages in the SkaiScrape codebase._
