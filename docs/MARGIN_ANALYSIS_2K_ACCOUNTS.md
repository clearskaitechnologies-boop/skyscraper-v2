# SkaiScraper — Margin Analysis at 2,000+ Company Accounts

> **Confidential — Internal Use Only**
> **February 2026**

---

## Revenue Model: Two Tiers

| Tier                 | Price           | Target                     | Unit Economics              |
| -------------------- | --------------- | -------------------------- | --------------------------- |
| **SMB** (Self-serve) | $139.99/mo flat | 1-50 employee companies    | Unlimited seats per account |
| **Enterprise**       | $80/seat/mo     | 50-500+ employee companies | Per-seat, annual contract   |

---

## Revenue Projections at Scale

### Scenario 1: 2,000 Accounts (Conservative)

| Segment    | Accounts    | Avg Seats  | Price       | MRR            | ARR             |
| ---------- | ----------- | ---------- | ----------- | -------------- | --------------- |
| SMB        | 1,800 (90%) | N/A (flat) | $139.99/mo  | $251,982       | **$3,023,784**  |
| Enterprise | 200 (10%)   | 50 seats   | $80/seat/mo | $800,000       | **$9,600,000**  |
| **Total**  | **2,000**   | —          | —           | **$1,051,982** | **$12,623,784** |

### Scenario 2: 5,000 Accounts (Growth)

| Segment    | Accounts    | Avg Seats  | Price       | MRR            | ARR             |
| ---------- | ----------- | ---------- | ----------- | -------------- | --------------- |
| SMB        | 4,500 (90%) | N/A (flat) | $139.99/mo  | $629,955       | **$7,559,460**  |
| Enterprise | 500 (10%)   | 75 seats   | $80/seat/mo | $3,000,000     | **$36,000,000** |
| **Total**  | **5,000**   | —          | —           | **$3,629,955** | **$43,559,460** |

### Scenario 3: 10,000 Accounts (Market Leader)

| Segment    | Accounts    | Avg Seats  | Price       | MRR            | ARR              |
| ---------- | ----------- | ---------- | ----------- | -------------- | ---------------- |
| SMB        | 9,000 (90%) | N/A (flat) | $139.99/mo  | $1,259,910     | **$15,118,920**  |
| Enterprise | 1,000 (10%) | 100 seats  | $80/seat/mo | $8,000,000     | **$96,000,000**  |
| **Total**  | **10,000**  | —          | —           | **$9,259,910** | **$111,118,920** |

---

## Infrastructure Cost at Scale

### Fixed Costs (Monthly)

| Service                        | 2K Accounts | 5K Accounts  | 10K Accounts      |
| ------------------------------ | ----------- | ------------ | ----------------- |
| **Supabase Pro**               | $25         | $25          | $75 (Team)        |
| **Vercel Pro**                 | $20         | $20          | $150 (Enterprise) |
| **Clerk Auth**                 | $25         | $125         | $500              |
| **Sentry**                     | $26         | $80          | $160              |
| **Upstash Redis**              | $10         | $30          | $100              |
| **OpenAI API**                 | $500        | $2,000       | $8,000            |
| **Stripe fees** (2.9%+30¢)     | $30,727     | $105,698     | $268,966          |
| **Support staff** (2-5 people) | $15,000     | $30,000      | $60,000           |
| **Total COGS**                 | **$46,333** | **$137,978** | **$337,951**      |

### Margin Analysis

| Metric              | 2K Accounts | 5K Accounts | 10K Accounts |
| ------------------- | ----------- | ----------- | ------------ |
| **Monthly Revenue** | $1,051,982  | $3,629,955  | $9,259,910   |
| **Monthly COGS**    | $46,333     | $137,978    | $337,951     |
| **Gross Profit**    | $1,005,649  | $3,491,977  | $8,921,959   |
| **Gross Margin**    | **95.6%**   | **96.2%**   | **96.4%**    |

---

## Unit Economics

| Metric              | SMB        | Enterprise  | Blended    |
| ------------------- | ---------- | ----------- | ---------- |
| **ARPU (monthly)**  | $139.99    | $4,000\*    | $526       |
| **CAC (estimated)** | $200       | $5,000      | $680       |
| **LTV (36-mo)**     | $5,040     | $144,000    | $18,936    |
| **LTV:CAC**         | **25:1**   | **29:1**    | **28:1**   |
| **Payback Period**  | 1.4 months | 1.25 months | 1.3 months |

\*Enterprise ARPU = 50 seats × $80/seat/mo

---

## Infrastructure Scaling Thresholds

| Users (Concurrent) | DB Plan             | Pooler Connections | Cost   | Action Needed              |
| ------------------ | ------------------- | ------------------ | ------ | -------------------------- |
| 1-1,000            | Supabase Pro        | 200                | $25/mo | **Current — sufficient**   |
| 1,000-5,000        | Supabase Pro        | 200                | $25/mo | PgBouncer multiplexes fine |
| 5,000-10,000       | Supabase Team       | 400                | $75/mo | Upgrade plan               |
| 10,000-50,000      | Supabase Enterprise | 1,000+             | Custom | Negotiate                  |

**Key insight:** Infrastructure costs scale sub-linearly. Going from 2K to 10K accounts costs 7.3× more in COGS but generates 8.8× more revenue. **Margins improve as you grow.**

---

## Competitive Comparison at 2,000 Accounts

| Platform        | Revenue Model                      | Revenue at 2K Accounts      | Gross Margin |
| --------------- | ---------------------------------- | --------------------------- | ------------ |
| **AccuLynx**    | $149/user/mo                       | ~$35.7M (est. 10 users avg) | ~80%         |
| **JobNimbus**   | $125/user/mo                       | ~$30.0M (est. 10 users avg) | ~80%         |
| **SkaiScraper** | $140/mo flat + $80/seat enterprise | **$12.6M**                  | **95.6%**    |

**Why our margin is higher:**

1. **No per-seat infrastructure cost** — Vercel serverless = pay per invocation, not per user
2. **PgBouncer multiplexing** — 200 connections serve 10,000+ users
3. **No on-prem hardware** — 100% cloud-native, zero ops team needed
4. **AI costs are per-report, not per-user** — OpenAI only fires on explicit actions

---

## Key Takeaways

1. **95%+ gross margin at every scale** — SaaS-best-in-class
2. **Enterprise segment drives 76% of revenue** at 2K accounts (Pareto)
3. **Infrastructure costs are negligible** — $606/mo for core platform at 2K accounts (excluding Stripe + OpenAI + staff)
4. **LTV:CAC > 25:1** — best-in-class for vertical SaaS (benchmark: 3:1)
5. **Each enterprise deal = $48K-$633K ARR** — whale hunting economics
6. **Break-even at ~4 SMB accounts** — anything beyond that is pure margin

---

## Path to $12.6M ARR

| Milestone                   | Accounts | ARR        | Timeline |
| --------------------------- | -------- | ---------- | -------- |
| **Current**                 | ~50      | ~$84K      | Now      |
| **Titan + Pro West**        | 52       | **$717K**  | Q1 2026  |
| **100 SMB + 10 Enterprise** | 110      | **$2.2M**  | Q3 2026  |
| **500 SMB + 50 Enterprise** | 550      | **$5.6M**  | Q1 2027  |
| **2,000 total**             | 2,000    | **$12.6M** | Q4 2027  |

---

_Revenue projections are illustrative. Actual results depend on sales execution, churn, and market conditions._
