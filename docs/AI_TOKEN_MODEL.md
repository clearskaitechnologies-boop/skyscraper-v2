# AI Token Model & Usage Tracking

**Date:** November 17, 2025  
**Status:** Production  
**Purpose:** Document all AI features, token costs, and usage tracking patterns

---

## Overview

SkaiScraper/PreLossVision uses a **token-based billing system** to track and charge for AI/ML feature usage. All AI operations consume tokens from the organization's balance and are logged for transparency and billing.

**Core Principles:**

1. Every AI operation MUST charge tokens
2. Token costs are predictable and documented
3. All usage is logged to multiple tables for audit/analytics
4. Failed AI calls do NOT consume tokens
5. Token balance is checked BEFORE expensive operations

---

## Token Storage Architecture

### Three-Layer System

```
┌─────────────────────┐
│  tokens_ledger      │  ← Double-entry ledger (authoritative source)
│  (PostgreSQL)       │     - All debits/credits
└─────────────────────┘     - Running balance
          ↓
┌─────────────────────┐
│  ai_usage           │  ← AI-specific tracking
│  (PostgreSQL)       │     - Feature type
└─────────────────────┘     - Model used
                            - Tokens + cost_usd
          ↓
┌─────────────────────┐
│  ai_performance_logs│  ← Performance metrics
│  (PostgreSQL)       │     - Response times
└─────────────────────┘     - Success rates
```

### Table Schemas

#### `tokens_ledger` (Authoritative)

```sql
CREATE TABLE tokens_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES "Org"(id),
  user_id TEXT,
  amount_change INTEGER NOT NULL,  -- Positive=credit, Negative=debit
  balance_after INTEGER NOT NULL,  -- Running balance
  kind TEXT NOT NULL,              -- 'grant', 'purchase', 'consume'
  reason TEXT,                     -- Description of transaction
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tokens_ledger_org_id ON tokens_ledger(org_id);
CREATE INDEX idx_tokens_ledger_created_at ON tokens_ledger(created_at);
```

#### `ai_usage` (Feature Tracking)

```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id TEXT,
  claim_id TEXT,                   -- Optional: link to specific claim
  feature_type TEXT NOT NULL,      -- 'prediction', 'brain', 'narrative', etc.
  model TEXT NOT NULL,             -- 'gpt-4o-mini', 'gpt-4o', etc.
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4),         -- Optional: dollar cost
  response_time_ms INTEGER,        -- Optional: performance tracking
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_ai_usage_org_id ON ai_usage(org_id);
CREATE INDEX idx_ai_usage_claim_id ON ai_usage(claim_id);
CREATE INDEX idx_ai_usage_feature_type ON ai_usage(feature_type);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at);
```

#### `ai_performance_logs` (Observability)

```sql
CREATE TABLE ai_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT NOT NULL,           -- 'claim_prediction', 'dispute_generation', etc.
  model TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tokens_used INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_code TEXT,
  metadata JSONB,                  -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for monitoring
CREATE INDEX idx_ai_performance_logs_feature ON ai_performance_logs(feature);
CREATE INDEX idx_ai_performance_logs_created_at ON ai_performance_logs(created_at);
```

---

## AI Features & Token Costs

### Phase 48: Claim Prediction Engine

**Route:** `/api/claims/[claimId]/predict`  
**Model:** `gpt-4o-mini`  
**Cost:** **20 tokens**

**What It Does:**

- Predicts claim lifecycle (approval, denial, supplement, litigation)
- Analyzes damage photos, weather data, property info
- Generates risk scores and recommendations

**Usage Pattern:**

```typescript
// In route.ts
const result = await predictClaimLifecycle(claim, context);

// Should charge tokens via billing.ts
await chargeTokens({
  orgId,
  userId,
  amount: 20,
  reason: `Claim prediction: ${claimId}`,
  claimId,
  featureType: "prediction",
});
```

**Current Status:** ✅ Token charging implemented via `lib/billing.ts`

---

### Phase 49: Live Claim Brain (Rebuild)

**Route:** `/api/claims/[claimId]/brain/rebuild`  
**Model:** `gpt-4o` or `gpt-4o-mini`  
**Cost:** **30 tokens**

**What It Does:**

- Rebuilds claim brain state from all available data
- Analyzes evidence, weather, timeline, damage
- Generates strategic recommendations and next actions

**Usage Pattern:**

```typescript
// In brain rebuild route
const brainState = await rebuildClaimBrain(claimId, orgId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 30,
  reason: `Brain rebuild: ${claimId}`,
  claimId,
  featureType: "brain_rebuild",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION** - Check if token charging is implemented

---

### Phase 49: Timeline Reconstruction

**Route:** `/api/claims/[claimId]/timeline`  
**Model:** `gpt-4o-mini`  
**Cost:** **15 tokens**

**What It Does:**

- Reconstructs event timeline from photos, weather, reports
- Identifies inconsistencies and gaps
- Generates confidence scores for each event

**Usage Pattern:**

```typescript
// In timeline route
const timeline = await reconstructTimeline(claimId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 15,
  reason: `Timeline reconstruction: ${claimId}`,
  claimId,
  featureType: "timeline_reconstruction",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Phase 50: Decision Engine

**Route:** `/api/claims/[claimId]/decide`  
**Model:** `gpt-4o`  
**Cost:** **35 tokens**

**What It Does:**

- Recommends optimal claim strategy (dispute, supplement, settle, etc.)
- Analyzes prediction, brain state, and reconstruction
- Generates actionable steps with priorities

**Usage Pattern:**

```typescript
// In decide route
const decision = await generateDecisionPlan(claimId, orgId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 35,
  reason: `Decision engine: ${claimId}`,
  claimId,
  featureType: "decision_engine",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Phase 50: Dispute Package Generator

**Route:** `/api/claims/[claimId]/dispute`  
**Model:** `gpt-4o`  
**Cost:** **25 tokens**

**What It Does:**

- Generates complete dispute/appeal package
- Includes evidence summary, legal citations, carrier talking points
- Auto-formats for submission

**Usage Pattern:**

```typescript
// In dispute route
const disputePackage = await generateDisputePackage(claimId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 25,
  reason: `Dispute package: ${claimId}`,
  claimId,
  featureType: "dispute_generation",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Phase 50: Self-Writing Engine — Narrative

**Route:** `/api/claims/[claimId]/narrative`  
**Model:** `gpt-4o`  
**Cost:** **40 tokens**

**What It Does:**

- Generates comprehensive claim narrative (4 tones: Professional, Assertive, Technical, Empathetic)
- Integrates timeline, weather, damage, AI analysis
- Auto-formats with proper sections and citations

**Usage Pattern:**

```typescript
// In narrative route
const narrative = await generateNarrative(claimId, tone, orgId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 40,
  reason: `Narrative generation (${tone}): ${claimId}`,
  claimId,
  featureType: "narrative_generation",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Phase 50: Self-Writing Engine — Appeal

**Route:** `/api/claims/[claimId]/appeal`  
**Model:** `gpt-4o`  
**Cost:** **35 tokens**

**What It Does:**

- Generates appeal letter for denied/underpaid claims
- Detects contradictions in adjuster reports
- Includes supporting evidence and legal precedents

**Usage Pattern:**

```typescript
// In appeal route
const appeal = await generateAppeal(claimId, orgId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 35,
  reason: `Appeal generation: ${claimId}`,
  claimId,
  featureType: "appeal_generation",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Phase 50: Self-Writing Engine — Code Compliance

**Route:** `/api/claims/[claimId]/code`  
**Model:** `gpt-4o-mini`  
**Cost:** **15 tokens**

**What It Does:**

- Checks claim against IRC R905.x building codes
- Identifies required repairs and compliance issues
- Generates code citation report

**Usage Pattern:**

```typescript
// In code route
const codeReport = await generateCodeCompliance(claimId, orgId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 15,
  reason: `Code compliance: ${claimId}`,
  claimId,
  featureType: "code_compliance",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Phase 50: Self-Writing Engine — Carrier Summary

**Route:** `/api/claims/[claimId]/carrier-summary`  
**Model:** `gpt-4o`  
**Cost:** **30 tokens**

**What It Does:**

- Generates complete carrier submission packet
- Includes executive summary, damage details, cost justification
- Formatted for adjuster/carrier consumption

**Usage Pattern:**

```typescript
// In carrier-summary route
const summary = await generateCarrierSummary(claimId, format, orgId);

// Token charging
await chargeTokens({
  orgId,
  userId,
  amount: 30,
  reason: `Carrier summary: ${claimId}`,
  claimId,
  featureType: "carrier_summary",
});
```

**Current Status:** ⚠️ **NEEDS VERIFICATION**

---

### Command Ingest (Phase 49)

**Route:** `/api/commands/ingest`  
**Model:** Varies (if using AI parsing)  
**Cost:** **10 tokens** (if AI is used)

**What It Does:**

- Ingests natural language commands
- Parses intent and entities
- Routes to appropriate handlers

**Usage Pattern:**

```typescript
// In ingest route
const command = await parseCommand(input);

// Token charging (only if AI is used for parsing)
if (usedAI) {
  await chargeTokens({
    orgId,
    userId,
    amount: 10,
    reason: `Command parsing`,
    featureType: "command_ingest",
  });
}
```

**Current Status:** ⚠️ **VERIFY IF AI IS USED**

---

## Token Pricing Summary

| Feature                     | Route              | Model       | Tokens | Est. Cost (USD) |
| --------------------------- | ------------------ | ----------- | ------ | --------------- |
| **Claim Prediction**        | `/predict`         | gpt-4o-mini | 20     | ~$0.002         |
| **Brain Rebuild**           | `/brain/rebuild`   | gpt-4o      | 30     | ~$0.015         |
| **Timeline Reconstruction** | `/timeline`        | gpt-4o-mini | 15     | ~$0.0015        |
| **Decision Engine**         | `/decide`          | gpt-4o      | 35     | ~$0.0175        |
| **Dispute Generation**      | `/dispute`         | gpt-4o      | 25     | ~$0.0125        |
| **Narrative**               | `/narrative`       | gpt-4o      | 40     | ~$0.020         |
| **Appeal**                  | `/appeal`          | gpt-4o      | 35     | ~$0.0175        |
| **Code Compliance**         | `/code`            | gpt-4o-mini | 15     | ~$0.0015        |
| **Carrier Summary**         | `/carrier-summary` | gpt-4o      | 30     | ~$0.015         |
| **Command Ingest**          | `/commands/ingest` | varies      | 10     | ~$0.001         |

**Total for Full Claim Processing:** ~250 tokens (~$0.10)

---

## Implementation Pattern

### Standard Token Charging Flow

```typescript
// 1. Check balance BEFORE expensive operation (optional but recommended)
const balance = await getTokenBalance(orgId);
if (balance < REQUIRED_TOKENS) {
  return NextResponse.json(
    { error: "Insufficient tokens", balance, required: REQUIRED_TOKENS },
    { status: 402 } // Payment Required
  );
}

// 2. Perform AI operation
const startTime = Date.now();
const result = await callOpenAI({
  tag: "feature_name",
  messages: [...],
  parseJson: true,
  context: { claimId, orgId }
});

// 3. Charge tokens ONLY if successful
if (result.success) {
  await chargeTokens({
    orgId,
    userId,
    amount: TOKEN_COST,
    reason: `Feature name: ${claimId}`,
    claimId,
    featureType: 'feature_name'
  });

  // 4. Log AI usage for analytics
  await prisma.ai_usage.create({
    data: {
      org_id: orgId,
      user_id: userId,
      claim_id: claimId,
      feature_type: 'feature_name',
      model: result.model,
      tokens_used: TOKEN_COST,
      cost_usd: TOKEN_COST * 0.0005, // Example rate
      response_time_ms: Date.now() - startTime,
      success: true
    }
  });
}

// 5. Return result
return NextResponse.json(result);
```

### Helper Function: `chargeTokens()`

**Location:** `src/lib/billing.ts` or `src/lib/billing/wallet.ts`

```typescript
export async function chargeTokens(opts: {
  orgId: string;
  userId?: string;
  amount: number;
  reason: string;
  claimId?: string;
  featureType?: string;
}): Promise<{ success: boolean; newBalance: number }> {
  const { orgId, userId, amount, reason, claimId, featureType } = opts;

  // Get current balance
  const last = await prisma.tokens_ledger.findFirst({
    where: { org_id: orgId },
    orderBy: { created_at: "desc" },
  });

  const currentBalance = last?.balance_after || 0;

  if (currentBalance < amount) {
    throw new Error(`Insufficient tokens: ${currentBalance} < ${amount}`);
  }

  const newBalance = currentBalance - amount;

  // Write to ledger
  await prisma.tokens_ledger.create({
    data: {
      org_id: orgId,
      user_id: userId,
      amount_change: -amount,
      balance_after: newBalance,
      kind: "consume",
      reason,
    },
  });

  return { success: true, newBalance };
}
```

---

## Analytics & Reporting

### Common Queries

#### Total Tokens Consumed by Org (Last 30 Days)

```sql
SELECT
  org_id,
  SUM(ABS(amount_change)) AS total_consumed,
  COUNT(*) AS transaction_count
FROM tokens_ledger
WHERE kind = 'consume'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY org_id
ORDER BY total_consumed DESC;
```

#### Token Usage by Feature Type

```sql
SELECT
  feature_type,
  COUNT(*) AS usage_count,
  SUM(tokens_used) AS total_tokens,
  AVG(tokens_used) AS avg_tokens,
  SUM(cost_usd) AS total_cost_usd
FROM ai_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY feature_type
ORDER BY total_tokens DESC;
```

#### Most Expensive Claims (by AI usage)

```sql
SELECT
  claim_id,
  COUNT(*) AS ai_operations,
  SUM(tokens_used) AS total_tokens,
  SUM(cost_usd) AS total_cost_usd
FROM ai_usage
WHERE claim_id IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY claim_id
ORDER BY total_tokens DESC
LIMIT 20;
```

#### AI Performance by Feature

```sql
SELECT
  feature,
  COUNT(*) AS total_calls,
  AVG(duration_ms) AS avg_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_duration_ms,
  COUNT(*) FILTER (WHERE success = FALSE) AS failure_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE success = TRUE) / COUNT(*), 2) AS success_rate
FROM ai_performance_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY feature
ORDER BY total_calls DESC;
```

---

## Adding New AI Features

When implementing a new AI feature:

1. **Define Token Cost**
   - Conservative estimate based on prompt length + expected output
   - Test with real data to refine
   - Document in this file

2. **Implement Token Charging**

   ```typescript
   // After successful AI call
   await chargeTokens({
     orgId,
     userId,
     amount: YOUR_TOKEN_COST,
     reason: `Your feature: ${claimId}`,
     claimId,
     featureType: "your_feature_type",
   });
   ```

3. **Log AI Usage**

   ```typescript
   await prisma.ai_usage.create({
     data: {
       org_id: orgId,
       user_id: userId,
       claim_id: claimId,
       feature_type: "your_feature_type",
       model: result.model,
       tokens_used: YOUR_TOKEN_COST,
       response_time_ms: duration,
       success: result.success,
     },
   });
   ```

4. **Add Performance Logging**

   ```typescript
   await prisma.ai_performance_logs.create({
     data: {
       feature: "your_feature_name",
       model: result.model,
       duration_ms: duration,
       tokens_used: YOUR_TOKEN_COST,
       success: result.success,
       error_code: result.error?.code,
     },
   });
   ```

5. **Update This Document**
   - Add feature to pricing table
   - Add usage pattern example
   - Update total costs

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Token Balance Alerts**
   - Alert when org balance < 100 tokens
   - Email notification for low balance

2. **Anomaly Detection**
   - Sudden spike in token usage (>200% of average)
   - Individual claims consuming >500 tokens

3. **Performance Degradation**
   - AI response times >10 seconds
   - Error rates >5%

4. **Cost Overruns**
   - Orgs exceeding their plan limits
   - Features costing more than expected

### Recommended Dashboards

1. **Real-Time Token Dashboard**
   - Current balance by org
   - Tokens consumed today
   - Top consumers

2. **AI Health Dashboard**
   - Success rates by feature
   - P95 latency by feature
   - Error breakdown

3. **Cost Analysis Dashboard**
   - Total spend by feature
   - Cost per claim
   - Projected monthly spend

---

## FAQ

**Q: What happens if token balance reaches zero?**  
A: AI features return 402 Payment Required. User must purchase more tokens.

**Q: Are tokens refunded on AI errors?**  
A: Yes. Tokens are only charged on successful AI completions.

**Q: Can I get historical token usage?**  
A: Yes. Query `tokens_ledger` and `ai_usage` tables. Data retained for 365 days.

**Q: What if I need to adjust token costs?**  
A: Update the cost in the route code and document the change here with rationale.

**Q: How do I test token charging locally?**  
A: Seed a test org with 10,000 tokens. Monitor `tokens_ledger` after each AI call.

---

**Last Updated:** November 17, 2025  
**Maintained By:** Engineering Team  
**Version:** 1.0  
**Review Schedule:** Monthly
