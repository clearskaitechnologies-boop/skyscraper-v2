# MASTER TODO — SkaiScraper 10K-User Readiness

> **Updated**: 2026-02-16 (v2.0-architecture-stable)  
> **Platform**: SkaiScraper v2.1.0  
> **Billing**: $80/seat/month · Stripe: `prod_Tylw6eipXQDDDS`  
> **Scale**: 278 Prisma models · **641 API routes** · 104 tests passing

---

## 🎯 CURRENT STABILITY STATUS

```
┌─────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE CHECKPOINT: v2.0-architecture-stable              │
│  Git Tag: v2.0-architecture-stable (pushed 2026-02-16)          │
│  Tests: 104/104 passing                                         │
│  Branch: main (clean)                                           │
└─────────────────────────────────────────────────────────────────┘
```

| Component           | Status | Notes                                            |
| ------------------- | ------ | ------------------------------------------------ |
| OpenAI singleton    | ✅     | Single instantiation enforced                    |
| Rate limiter        | ✅     | Unified (Upstash Redis + fallback)               |
| Logger              | ✅     | Centralized (2,500+ calls migrated)              |
| Domain services     | ✅     | 5 services (ai, claims, portal, reports, trades) |
| Migration engines   | ✅     | AccuLynx + JobNimbus frameworks ready            |
| Dead code           | ✅     | 60 files archived                                |
| Auth hardening      | ✅     | ESLint rule + guard wrappers                     |
| API rationalization | ✅     | 804→641 routes (-20%)                            |

---

## 🚀 NEXT STEPS — Revenue Features (Priority Order)

> **Strategy**: Architecture is stable. Stop refactoring. Ship revenue features.

### 1. QuickBooks OAuth Sync (READY TO TEST)

**File**: [src/lib/integrations/quickbooks.ts](src/lib/integrations/quickbooks.ts)  
**Status**: Client complete, needs E2E testing

- [ ] **QB.1** Test OAuth flow end-to-end
- [ ] **QB.2** Wire up customer sync UI
- [ ] **QB.3** Wire up invoice push UI
- [ ] **QB.4** Add sync status indicators

### 2. ABC Supply Routing Engine (CLIENT READY)

**File**: [src/lib/integrations/abc-supply.ts](src/lib/integrations/abc-supply.ts)  
**Status**: API client complete, routing engine needed

- [ ] **ABC.1** Create material estimation service (`src/lib/materials/estimator.ts`)
- [ ] **ABC.2** Build estimate-to-order workflow
- [ ] **ABC.3** Add branch selection UI
- [ ] **ABC.4** Integrate with claim final payout

### 3. Production Observability Stack

**Goal**: Real-time visibility into production health

- [ ] **OBS.1** Add Datadog/Sentry performance spans to critical paths
- [ ] **OBS.2** Create `/api/health/deep` endpoint (DB, Redis, external APIs)
- [ ] **OBS.3** Set up PagerDuty alerts for error spikes
- [ ] **OBS.4** Add request tracing correlation IDs

### 4. Test Coverage Expansion

**Current**: 104 tests · **Target**: 150+

- [ ] **TEST.1** Migration engine happy path tests
- [ ] **TEST.2** Domain service integration tests
- [ ] **TEST.3** Rate limiter edge case tests
- [ ] **TEST.4** API action handler tests

---

## ⚠️ TECH DEBT (Lower Priority)

> These are real but non-blocking. Track but don't prioritize over revenue.

| Item                 | Count | Risk   | Notes                            |
| -------------------- | ----- | ------ | -------------------------------- |
| `as any` casts       | ~746  | Medium | Most are pragmatic (Prisma JSON) |
| `TODO/FIXME` markers | ~302  | Low    | Standard backlog                 |
| Prisma models        | 278   | Low    | Working fine at scale            |

---

## ✅ COMPLETED — Architecture Stabilization Sprint (2026-02-16)

<details>
<summary>Logger Migration (2,500+ calls)</summary>

- [x] Created `scripts/codemod-console-to-logger.cjs`
- [x] Migrated 1,067 files from `console.*` to `logger.*`
- [x] Fixed 18 broken multi-line imports
- [x] Fixed duplicate logger imports (observability collision)
- [x] Committed as isolated change
</details>

<details>
<summary>Dead Code Purge (60 files)</summary>

- [x] Ran knip analysis
- [x] Archived 52 agent infrastructure files → `archive/unused-agents/`
- [x] Archived 8 AI schema files → `archive/unused-ai-schemas/`
- [x] Merged to main, tagged v2.0-architecture-stable
</details>

<details>
<summary>Domain Service Layer (5 services)</summary>

- [x] `src/lib/domain/ai/index.ts` — AI orchestration (5,801 bytes)
- [x] `src/lib/domain/claims/index.ts` — Claims services (9,058 bytes)
- [x] `src/lib/domain/portal/index.ts` — Portal/client services (9,771 bytes)
- [x] `src/lib/domain/reports/index.ts` — Report workflow (11,819 bytes)
- [x] `src/lib/domain/trades/index.ts` — Trades network (14,462 bytes)
- [x] Added missing functions: `finishReport`, `startReport`, `regenerateReport`, `shareClaimWithClient`
</details>

<details>
<summary>Infrastructure Verified Complete</summary>

- [x] Rate limiter: Canonical at `src/lib/rate-limit.ts` (Upstash + fallback)
- [x] OpenAI singleton: Single instantiation enforced
- [x] DB pooling: PgBouncer via directUrl
- [x] Migration engines: AccuLynx + JobNimbus frameworks
- [x] API route governance: `src/lib/api/route-registry.ts`
- [x] Integrations: QuickBooks + ABC Supply + Weather clients
</details>

<details>
<summary>Prior Sprints (All Complete)</summary>

- Token/Credit Purge (14/14 done)
- 23-Item Hardening Sprint (22/23 done)
- Auth Hardening Sprint (72+ tests green)
- API Rationalization Phase 1 — Claims Tree Collapse
- API Rationalization Phase 2 — Portal/Trades/Reports
- Service Layer Extraction Phase 2.5
</details>

---

## 📋 MANUAL TESTING CHECKLIST

**Run after any significant changes:**

### Critical Flows

- [ ] Create new claim
- [ ] Generate AI scope
- [ ] Generate report PDF
- [ ] Send client invitation
- [ ] Accept invitation (client side)
- [ ] QuickBooks OAuth connect
- [ ] Stripe checkout flow

---
