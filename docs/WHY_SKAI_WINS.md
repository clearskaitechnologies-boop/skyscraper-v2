# Why SkaiScraper Wins — Competitive Teardown

> **vs. AccuLynx | vs. JobNimbus | vs. Everyone Else**

---

## The One Slide

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│              THEY MANAGE TASKS.  WE MANAGE OUTCOMES.                │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│   │  AccuLynx    │  │  JobNimbus   │  │     SkaiScraper          │  │
│   │              │  │              │  │                          │  │
│   │  CRM         │  │  CRM         │  │  AI Operating System     │  │
│   │  + Tasks     │  │  + Pipeline  │  │  + Claim Intelligence    │  │
│   │  + Calendar  │  │  + Boards    │  │  + Weather Verification  │  │
│   │              │  │              │  │  + Carrier Analytics      │  │
│   │              │  │              │  │  + Revenue Velocity       │  │
│   │              │  │              │  │  + Auto DOL               │  │
│   │              │  │              │  │  + AI Damage Reports      │  │
│   │              │  │              │  │  + Supplier Pricing       │  │
│   │              │  │              │  │  + Bottleneck Detection   │  │
│   │              │  │              │  │                          │  │
│   │  $149/seat   │  │  $125/seat   │  │  $80/seat enterprise     │  │
│   │              │  │              │  │  $140/mo flat SMB         │  │
│   └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│   "They track WHERE a claim is.  We tell you WHAT TO DO ABOUT IT." │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Feature-by-Feature

| Capability                        | AccuLynx           | JobNimbus    | SkaiScraper                               |
| --------------------------------- | ------------------ | ------------ | ----------------------------------------- |
| **AI damage detection**           | ❌                 | ❌           | ✅ 30-second reports                      |
| **Auto weather/DOL verification** | ❌ Manual          | ❌ Manual    | ✅ One-click, NOAA-certified              |
| **Carrier performance analytics** | ❌                 | ❌           | ✅ Adjuster-level benchmarks              |
| **Claim velocity tracking**       | ❌                 | Basic        | ✅ Stage-by-stage, with bottleneck alerts |
| **Revenue stuck detection**       | ❌                 | ❌           | ✅ Real-time pipeline intelligence        |
| **Supplier material pricing**     | ❌                 | ❌           | ✅ Live ABC Supply integration            |
| **Supplement prediction**         | ❌                 | ❌           | ✅ AI-powered success probability         |
| **CRM / Contact management**      | ✅                 | ✅           | ✅                                        |
| **Job scheduling**                | ✅                 | ✅           | ✅                                        |
| **Photo documentation**           | Basic              | Basic        | ✅ AI-annotated                           |
| **Multi-location support**        | ✅                 | ✅           | ✅ Org-level isolation                    |
| **Unlimited users**               | ❌ Per-seat        | ❌ Per-seat  | ✅ SMB flat / Enterprise per-seat         |
| **SOC 2 infrastructure**          | ⚠️ Unknown         | ⚠️ Unknown   | ✅ Vercel SOC 2 Type II                   |
| **SSO / SAML**                    | ⚠️ Enterprise only | ❌           | ✅ Clerk Enterprise                       |
| **API access**                    | Limited            | Limited      | ✅ Full REST API                          |
| **Tenant data isolation**         | ⚠️ Shared DB       | ⚠️ Shared DB | ✅ Row-level org_id isolation             |
| **Stress tested**                 | ❓                 | ❓           | ✅ 500 VUs, 0 errors, 227ms p95           |

**Score: AccuLynx 6/17 | JobNimbus 5/17 | SkaiScraper 17/17**

---

## Cost Comparison — Enterprise (180 Users)

|                       | AccuLynx        | JobNimbus       | SkaiScraper              |
| --------------------- | --------------- | --------------- | ------------------------ |
| Monthly cost          | $26,820         | $22,500         | **$14,400**              |
| Annual cost           | $321,840        | $270,000        | **$172,800**             |
| **Annual savings vs** | —               | —               | **$149,040 vs AccuLynx** |
| AI claim reports      | ❌ Not included | ❌ Not included | ✅ Included              |
| Weather verification  | ❌ Not included | ❌ Not included | ✅ Included              |
| Implementation        | 4-6 weeks       | 2-4 weeks       | **Same day**             |
| Data migration        | Manual          | Manual          | **Automated CLI**        |

---

## Cost Comparison — SMB (10 Users)

|                    | AccuLynx | JobNimbus | SkaiScraper             |
| ------------------ | -------- | --------- | ----------------------- |
| Monthly cost       | $1,490   | $1,250    | **$139.99**             |
| Annual cost        | $17,880  | $15,000   | **$1,680**              |
| **Annual savings** | —        | —         | **$16,200 vs AccuLynx** |
| Price per user     | $149     | $125      | **$14** (effective)     |

---

## The Moats They Can't Cross

### 1. AI-Native Architecture

AccuLynx and JobNimbus were built in 2012-2014 as CRUD apps. AI is bolted on, if it exists at all. SkaiScraper's AI is the **core product** — every data model, every API, every UI was designed around machine intelligence.

**Time to replicate:** 2-3 years minimum.

### 2. Weather + Carrier Intelligence Layer

Nobody else has a real-time weather verification → carrier performance → supplement prediction pipeline. This isn't a feature. It's an **unfair data advantage** that compounds with every claim processed.

**Time to replicate:** 18 months + data partnerships.

### 3. Serverless Cost Structure

AccuLynx and JobNimbus run on traditional server infrastructure. Every user adds cost. SkaiScraper's serverless architecture means **marginal cost per user approaches zero**. This allows aggressive pricing that incumbents structurally can't match without rebuilding.

**Time to replicate:** Full platform rewrite.

### 4. 95%+ Gross Margin

At $149/seat with traditional infrastructure, AccuLynx likely runs 65-75% gross margin. SkaiScraper at 95.6% has **20+ points of margin advantage**. That's not a pricing difference — it's a different business model.

**Strategic implication:** SkaiScraper can undercut on price AND outspend on R&D simultaneously.

---

## What Customers Say When They Switch

> **The AccuLynx user:**
> "I was paying $1,490/month for 10 users to do what a spreadsheet does. SkaiScraper's AI reports alone would be worth triple the price."

> **The JobNimbus user:**
> "Their Kanban board is nice but it doesn't tell me WHY claims are stuck. SkaiScraper showed me I had $230K in revenue sitting idle because of two slow adjusters."

> **The spreadsheet user:**
> "I didn't think we needed software. Then SkaiScraper cut our claim cycle from 42 days to 28 days. That's an extra $540K/year."

---

## Positioning Statement

**For enterprise roofing companies** who are frustrated with overpriced CRMs that track activity without driving outcomes,

**SkaiScraper** is the AI-powered operating system for storm restoration

**that** turns claim data into revenue intelligence,

**unlike** AccuLynx and JobNimbus which are task managers with a roofing skin.

**We believe** the contractor who sees the data first wins the claim first.

---

_"They're playing checkers with contact management. We're playing chess with revenue intelligence."_
