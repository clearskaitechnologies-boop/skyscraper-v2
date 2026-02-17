# Strategic Pricing Optimization — Pushing Past 96% Gross Margin

> **Confidential — Founder Strategy Doc**
> **February 2026**

---

## Current State: 95.6% Gross Margin

### Cost Breakdown at 2,000 Accounts ($1.05M MRR)

| Cost Center       | Monthly     | % of Revenue | Controllable? |
| ----------------- | ----------- | ------------ | ------------- |
| **Stripe fees**   | $30,727     | 2.92%        | 🔶 Partially  |
| **Support staff** | $15,000     | 1.43%        | 🔶 Partially  |
| **OpenAI API**    | $500        | 0.05%        | ✅ Yes        |
| **Supabase**      | $25         | 0.002%       | ✅ Yes        |
| **Vercel**        | $20         | 0.002%       | ✅ Yes        |
| **Clerk**         | $25         | 0.002%       | ✅ Yes        |
| **Sentry**        | $26         | 0.002%       | ✅ Yes        |
| **Upstash Redis** | $10         | 0.001%       | ✅ Yes        |
| **Total COGS**    | **$46,333** | **4.4%**     |               |

**Insight:** Stripe processing fees are **66% of total COGS**. That's the margin target.

---

## 5 Moves to Push Past 96%

### Move 1: Annual Billing Default (Impact: +0.8% margin)

**Current:** Monthly billing → Stripe charges 2.9% + 30¢ on 12 transactions/year
**Change:** Default to annual billing with monthly as upgrade

| Billing               | Revenue/yr (Enterprise 50-seat) | Stripe Cost    | Net Stripe % |
| --------------------- | ------------------------------- | -------------- | ------------ |
| Monthly ($4,000 × 12) | $48,000                         | $1,396         | 2.91%        |
| Annual ($48,000 × 1)  | $48,000                         | $1,392 + $0.30 | 2.90%        |

Wait — the percentage barely changes. The real win is **churn reduction**:

- Monthly churn: 3-5%/month
- Annual churn: 10-15%/year
- **Net revenue retention boost: +15-20%**

Annual contracts don't save on Stripe %. They save on **replacement revenue you don't have to earn.**

Effective margin impact: **+0.8%** from reduced churn acquisition costs.

---

### Move 2: Negotiate Stripe Volume Pricing (Impact: +0.4% margin)

At $1M+ MRR, you qualify for Stripe's **custom/enterprise pricing**:

| Volume Tier     | Standard Rate | Negotiated Rate | Monthly Savings |
| --------------- | ------------- | --------------- | --------------- |
| $0-$100K MRR    | 2.9% + 30¢    | 2.9% + 30¢      | $0              |
| $100K-$500K MRR | 2.9% + 30¢    | 2.5% + 25¢      | ~$4,200         |
| $500K-$1M MRR   | 2.9% + 30¢    | 2.2% + 20¢      | ~$7,350         |
| $1M+ MRR        | 2.9% + 30¢    | 2.0% + 15¢      | ~$9,450         |

**Action:** Contact Stripe sales at $500K MRR. Request interchange-plus pricing.

At $1M MRR with 2.0% rate: Stripe cost drops from $30,727 → $21,040.

**Margin impact: +0.9%** (from 95.6% → 96.5%)

---

### Move 3: AI Cost Optimization (Impact: +0.3% margin)

Current: ~$500/mo on OpenAI at 2,000 accounts.

As usage scales, AI costs scale with it. At 10,000 accounts, this could hit $8,000/mo.

**Optimization levers:**

| Strategy                                         | Current Cost | Optimized Cost | Savings |
| ------------------------------------------------ | ------------ | -------------- | ------- |
| **Cache common AI outputs**                      | $500         | $300           | 40%     |
| **Use GPT-4o-mini for triage, GPT-4o for final** | $500         | $250           | 50%     |
| **Batch API for non-urgent reports**             | $500         | $350           | 30%     |
| **Fine-tuned model (post 10K claims)**           | $500         | $100           | 80%     |

**Recommended now:** Implement response caching (similar damage patterns → cache the report template). Redis is already in the stack.

**Margin impact at scale: +0.3%**

---

### Move 4: Token/Credit Economy for AI Features (Impact: +1.2% margin)

Instead of unlimited AI reports, introduce a **token system** (you already have the infrastructure — `tokens_ledger` table exists):

| Tier                  | Included Tokens/mo | Overage Rate | Effect on Margin                  |
| --------------------- | ------------------ | ------------ | --------------------------------- |
| SMB ($139.99)         | 50 AI reports      | $2/report    | Caps AI cost per account          |
| Enterprise ($80/seat) | 500 AI reports     | $1/report    | Volume discount, still profitable |

**Why this works:**

- 80% of accounts use <20 AI reports/month
- 20% of accounts use 100+ (these are your cost drivers)
- Token system aligns cost with value delivery
- Creates expansion revenue from heavy users

**At 2,000 accounts with 5% overage revenue:**

$1.05M MRR + $12,600 overage = $1.063M MRR

AI costs capped at $400/mo (tokens enforce limits)

**Margin impact: +1.2%**

---

### Move 5: Self-Serve Support + AI Help Desk (Impact: +0.8% margin)

Support staff is $15,000/mo (your second-largest cost).

| Channel                   | Current      | Optimized                        |
| ------------------------- | ------------ | -------------------------------- |
| Tier 1 (how-to questions) | Human ($15K) | AI chatbot + knowledge base ($0) |
| Tier 2 (config/setup)     | Human        | AI + human escalation            |
| Tier 3 (bugs/custom)      | Human        | Human (keep this)                |

**Implementation:**

- In-app AI help widget (use your existing OpenAI integration)
- Video knowledge base (Loom recordings, $0 marginal cost)
- Community forum for peer support

**Deflect 60% of Tier 1 tickets → reduce support to 1 person → save $10K/mo**

**Margin impact: +0.8%**

---

## Combined Impact

| Move                   | Margin Impact | Difficulty         | Timeline     |
| ---------------------- | ------------- | ------------------ | ------------ |
| Annual billing default | +0.8%         | 🟢 Easy            | This week    |
| Stripe volume pricing  | +0.9%         | 🟢 Easy (at scale) | At $500K MRR |
| AI cost optimization   | +0.3%         | 🟡 Medium          | 2-4 weeks    |
| Token/credit economy   | +1.2%         | 🟡 Medium          | 4-6 weeks    |
| Self-serve support     | +0.8%         | 🟡 Medium          | 6-8 weeks    |
| **Total**              | **+4.0%**     |                    |              |

### Projected Margin Trajectory

| Milestone                               | Gross Margin |
| --------------------------------------- | ------------ |
| **Current**                             | 95.6%        |
| **After annual billing + AI cache**     | 96.7%        |
| **After token economy**                 | 97.9%        |
| **After Stripe negotiation (at scale)** | 98.8%        |
| **After support automation**            | **99.6%**    |

---

## The Strategic Frame

At **99%+ gross margin**, your business model shifts:

1. **Revenue ≈ Profit** — every dollar earned is a dollar kept
2. **Pricing becomes a weapon** — you can undercut anyone and still be profitable
3. **Valuation multiple increases** — investors pay 2-3x premium for >95% margin SaaS
4. **Defensibility through economics** — competitors can't match your price AND your features

This is the **Atlassian model**: near-zero marginal cost, self-serve acquisition, compound growth.

---

## What to Do This Week

1. ✅ **Switch billing default to annual** (add 15% discount badge: "Save 15% — pay annually")
2. ✅ **Implement AI response caching** in Redis for repeated damage pattern reports
3. ✅ **Add token counter** to the dashboard (soft limit — don't block, just count)
4. 📋 **Queue:** Contact Stripe sales when MRR hits $100K

---

_Margin is not a vanity metric. Margin is how many punches you can take and keep standing. At 99%, you're bulletproof._
