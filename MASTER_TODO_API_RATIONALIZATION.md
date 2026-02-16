# 🎯 MASTER TODO: API Rationalization & Feature Modules

> **Sprint Goal:** Collapse 804 API routes → under 500 via action-based routing and feature modules  
> **Timeline:** 2-3 weeks focused effort  
> **Branch:** `feature/api-rationalization`

---

## ✅ PHASE 1 COMPLETE: CLAIMS TREE COLLAPSE

### Results

| Metric           | Before | After | Change                         |
| ---------------- | ------ | ----- | ------------------------------ |
| Claims routes    | 86     | 32    | **-54 routes (63% reduction)** |
| Total API routes | 804    | 750   | **-54 routes**                 |
| Tests            | 79     | 79    | ✅ All passing                 |

### New Unified Handlers Created

1. **`/api/claims/[claimId]/ai/actions`** - All AI operations
   - `chat`, `summary`, `rebuttal`, `predict`, `carrier_summary`, `analyze`
2. **`/api/claims/[claimId]/mutate`** - All state mutations
   - `update`, `update_status`, `toggle_visibility`, `invite`, `invite_client`, `attach_contact`, `add_note`, `add_timeline_event`
3. **`/api/claims/[claimId]/assets`** - All asset operations
   - GET: `type=photos|documents|evidence|artifacts|all`
   - POST: file uploads, artifact creation
4. **`/api/claims/[claimId]/final-payout/actions`** - All payout operations
   - `generate_packet`, `save_certificate`, `send_certificate`, `capture_signature`, `submit`

### Routes Deleted (54 total)

```
AI Cluster (-5):
- /ai/summary, /ai/rebuttal, /predict, /carrier-summary, /rebuttal-builder

Mutation Cluster (-6):
- /update, /status, /toggle-visibility, /invite, /invite-client, /attach-contact

Assets Cluster (-5):
- /photos, /documents, /evidence, /artifacts, /assets-with-meta

Root Duplicates (-9):
- /create, /save, /update, /list, /list-lite, /timeline, /document, /documents, /files

Final Payout Sub-routes (-5):
- /generate-packet, /save-certificate, /send-certificate, /signature, /submit

Specialty Routes (-7):
- /supplement (singular), /trade-partners, /trades
- /ai-reports, /report, /generate-report
- /cover-photo, /notes, /timeline, /events

Low-usage Routes (-7):
- /tasks, /automation, /appeal, /bad-faith, /narrative, /code, /context
```

---

## 📊 CURRENT STATE (Post-Cleanup)

| Metric                          | Count | Target |
| ------------------------------- | ----- | ------ |
| Total API routes                | 804   | < 500  |
| API domains (top-level folders) | 180   | < 50   |
| Claims API routes               | 86    | 20-25  |
| Health routes                   | 6     | 6 ✅   |
| Error boundaries                | 3     | 3 ✅   |
| Tests passing                   | 79    | 150+   |

### Route Distribution (Top 25 Domains)

```
86 claims/          ← Priority 1: Consolidate to ~25
68 portal/          ← Priority 2: Consolidate to ~20
62 trades/          ← Priority 3: Consolidate to ~15
51 ai/              ← Keep (complex domain)
41 reports/         ← Consolidate to ~15
28 templates/       ← Consolidate into reports
12 weather/         ← Keep
12 public/          ← Keep
10 notifications/   ← Keep
10 network/         ← Keep
10 billing/         ← Keep
9  vin/             ← Review for consolidation
9  messages/        ← Consolidate into comms
9  leads/           ← Keep
9  connections/     ← Merge into network
8  vendors/         ← Keep
8  team/            ← Keep
8  clients/         ← Merge into portal
8  claims-folder/   ← Merge into claims
7  proposals/       ← Keep
7  jobs/            ← Keep
7  flags/           ← Keep
7  estimates/       ← Keep
7  cron/            ← Keep
7  branding/        ← Keep
```

---

## 🏗️ ARCHITECTURE PATTERN

### From This (Route-per-Action):

```
src/app/api/claims/[claimId]/update/route.ts       → PATCH
src/app/api/claims/[claimId]/status/route.ts       → POST
src/app/api/claims/[claimId]/notes/route.ts        → GET/POST
src/app/api/claims/[claimId]/photos/route.ts       → GET/POST
src/app/api/claims/[claimId]/photos/[photoId]/route.ts → GET/DELETE
src/app/api/claims/[claimId]/documents/route.ts    → GET/POST
```

### To This (Action-Based Routing):

```
src/app/api/claims/route.ts                        → POST (create)
src/app/api/claims/[claimId]/route.ts              → GET/PATCH/DELETE
src/app/api/claims/[claimId]/[action]/route.ts     → Dynamic action handler
```

### Feature Module Pattern:

```
src/lib/modules/claims/
├── index.ts              # Public exports
├── actions/
│   ├── createClaim.ts
│   ├── updateStatus.ts
│   ├── addNote.ts
│   └── uploadPhoto.ts
├── queries/
│   ├── getClaim.ts
│   ├── listClaims.ts
│   └── getClaimStats.ts
├── types.ts
├── schema.ts             # Zod schemas
└── __tests__/
    └── claims.test.ts
```

---

## 📋 PHASE 1: CLAIMS TREE COLLAPSE (Priority 1)

### Goal: 86 → 20-25 routes

#### 1.1 Create Feature Module Structure

- [ ] Create `src/lib/modules/claims/` directory structure
- [ ] Create `src/lib/modules/claims/types.ts` with all claim types
- [ ] Create `src/lib/modules/claims/schema.ts` with Zod validation
- [ ] Create `src/lib/modules/claims/actions/` directory
- [ ] Create `src/lib/modules/claims/queries/` directory

#### 1.2 Implement Core Actions

- [ ] `createClaim.ts` - POST /claims
- [ ] `updateClaim.ts` - PATCH /claims/[claimId]
- [ ] `deleteClaim.ts` - DELETE /claims/[claimId]
- [ ] `updateStatus.ts` - POST /claims/[claimId]/actions?action=updateStatus
- [ ] `addNote.ts` - POST /claims/[claimId]/actions?action=addNote
- [ ] `uploadPhoto.ts` - POST /claims/[claimId]/actions?action=uploadPhoto
- [ ] `uploadDocument.ts` - POST /claims/[claimId]/actions?action=uploadDocument

#### 1.3 Implement Core Queries

- [ ] `getClaim.ts` - GET /claims/[claimId]
- [ ] `listClaims.ts` - GET /claims?page=&limit=&status=
- [ ] `getClaimNotes.ts` - GET /claims/[claimId]?include=notes
- [ ] `getClaimPhotos.ts` - GET /claims/[claimId]?include=photos
- [ ] `getClaimDocuments.ts` - GET /claims/[claimId]?include=documents
- [ ] `getClaimTimeline.ts` - GET /claims/[claimId]?include=timeline

#### 1.4 Create New Route Structure

- [ ] `src/app/api/claims/route.ts` - List + Create
- [ ] `src/app/api/claims/[claimId]/route.ts` - Get + Update + Delete
- [ ] `src/app/api/claims/[claimId]/actions/route.ts` - Unified action handler
- [ ] `src/app/api/claims/[claimId]/files/route.ts` - File operations
- [ ] `src/app/api/claims/[claimId]/files/[fileId]/route.ts` - Single file ops

#### 1.5 Delete Legacy Routes (After Migration)

Routes to remove once new structure is tested:

```
DELETE: src/app/api/claims/create/route.ts
DELETE: src/app/api/claims/save/route.ts
DELETE: src/app/api/claims/update/route.ts
DELETE: src/app/api/claims/list/route.ts
DELETE: src/app/api/claims/list-lite/route.ts
DELETE: src/app/api/claims/[claimId]/update/route.ts
DELETE: src/app/api/claims/[claimId]/status/route.ts
DELETE: src/app/api/claims/[claimId]/notes/route.ts
DELETE: src/app/api/claims/[claimId]/photos/route.ts
DELETE: src/app/api/claims/[claimId]/photos/[photoId]/route.ts
DELETE: src/app/api/claims/[claimId]/documents/route.ts
DELETE: src/app/api/claims/[claimId]/documents/[documentId]/route.ts
DELETE: src/app/api/claims/[claimId]/evidence/route.ts
DELETE: src/app/api/claims/[claimId]/evidence/upload/route.ts
DELETE: src/app/api/claims/[claimId]/timeline/route.ts
DELETE: src/app/api/claims/timeline/add/route.ts
... (~60 more to consolidate)
```

#### 1.6 Write Tests for Claims Module

- [ ] Unit tests for each action
- [ ] Unit tests for each query
- [ ] Integration test for action handler routing
- [ ] Test org isolation (claimId belongs to orgId)

---

## 📋 PHASE 2: ORG GUARD STANDARDIZATION

### Goal: Single auth pattern everywhere

#### 2.1 Audit Current Auth Patterns

- [ ] Grep all API routes for auth patterns
- [ ] Document routes using `safeOrgContext` (legacy)
- [ ] Document routes using `requireAuth` (canonical)
- [ ] Document routes using direct Clerk calls (deprecated)
- [ ] Document public routes (no auth needed)

#### 2.2 Create Migration Script

- [ ] Script to identify non-compliant routes
- [ ] Add CI check: count of `safeOrgContext` must decrease
- [ ] Add CI check: count of direct `@clerk/nextjs/server` must decrease

#### 2.3 Migrate High-Traffic Routes First

Priority routes (by usage/criticality):

- [ ] `/api/claims/*` - All claims routes
- [ ] `/api/leads/*` - All leads routes
- [ ] `/api/reports/*` - All reports routes
- [ ] `/api/ai/*` - All AI routes
- [ ] `/api/portal/*` - All portal routes

#### 2.4 Update ESLint Rules

- [ ] Add rule to warn on `safeOrgContext` usage
- [ ] Add rule to error on direct Clerk imports outside `/lib/auth/`

---

## 📋 PHASE 3: DOMAIN CONSOLIDATION

### Goal: 180 domains → 50 domains

#### 3.1 Identify Duplicate/Overlapping Domains

Current duplicates to merge:

```
claims + claims-folder → claims
client + client-messages + client-notifications + client-portal + client-profile + client-requests → client
contractor + contractors → contractors
reports + report-templates → reports
leads + pipeline + pipelines → leads
estimates + estimate → estimates
jobs + retail-jobs → jobs
weather + storm → weather
network + community → network
export + exports + import-export → data-ops
notifications + notify → notifications
```

#### 3.2 Create Domain Consolidation Plan

| Old Domains                   | New Domain         | Route Count |
| ----------------------------- | ------------------ | ----------- |
| claims, claims-folder         | `/api/claims`      | 86 → 25     |
| client, client-\* (6 folders) | `/api/client`      | ~30 → 10    |
| contractor, contractors       | `/api/contractors` | ~15 → 5     |
| leads, pipeline(s)            | `/api/leads`       | ~20 → 8     |
| reports, report-templates     | `/api/reports`     | ~40 → 15    |
| weather, storm                | `/api/weather`     | ~15 → 5     |

#### 3.3 Execute Consolidations

- [ ] Consolidate client domains
- [ ] Consolidate contractor domains
- [ ] Consolidate leads domains
- [ ] Consolidate reports domains
- [ ] Consolidate weather domains
- [ ] Update all frontend imports

---

## 📋 PHASE 4: INTEGRATION ADAPTER LAYER

### Goal: Clean integration boundaries

#### 4.1 Create Integration Module Structure

```
src/lib/integrations/
├── acculynx/
│   ├── client.ts
│   ├── types.ts
│   └── sync.ts
├── quickbooks/
│   ├── client.ts
│   ├── types.ts
│   └── sync.ts
├── abc-supply/
│   ├── client.ts
│   ├── types.ts
│   └── sync.ts
└── index.ts
```

#### 4.2 Implement AccuLynx Integration

- [ ] Create client wrapper
- [ ] Define types for API responses
- [ ] Implement claim sync
- [ ] Implement lead sync
- [ ] Add error handling + retry logic

#### 4.3 Implement QuickBooks Integration

- [ ] Create client wrapper
- [ ] Define types
- [ ] Implement invoice sync
- [ ] Implement payment sync

#### 4.4 Implement ABC Supply Integration

- [ ] Create client wrapper
- [ ] Define types
- [ ] Implement material orders
- [ ] Implement pricing lookups

---

## 📋 PHASE 5: TEST COVERAGE EXPANSION

### Goal: 79 → 150 tests

#### 5.1 Claims Module Tests

- [ ] `claims.actions.test.ts` - 10 tests
- [ ] `claims.queries.test.ts` - 8 tests
- [ ] `claims.integration.test.ts` - 5 tests

#### 5.2 Auth Module Tests

- [ ] `requireAuth.test.ts` - Already done ✅
- [ ] `orgResolver.test.ts` - 6 tests
- [ ] `roleEnforcement.test.ts` - 5 tests

#### 5.3 Billing Module Tests

- [ ] `billing-guard.test.ts` - Already done ✅
- [ ] `stripe-webhooks.test.ts` - 8 tests
- [ ] `subscription-lifecycle.test.ts` - 6 tests

#### 5.4 Integration Tests

- [ ] `api-auth-flow.test.ts` - End-to-end auth
- [ ] `api-claims-crud.test.ts` - Claims CRUD
- [ ] `api-rate-limiting.test.ts` - Rate limit behavior

---

## 📋 PHASE 6: CLEANUP & POLISH

### 6.1 Delete Dead Code

- [ ] Run `knip` or similar to find unused exports
- [ ] Delete unused lib files
- [ ] Delete unused components
- [ ] Delete orphaned type definitions

### 6.2 Documentation

- [ ] Update API documentation with new routes
- [ ] Document feature module pattern for team
- [ ] Create migration guide for frontend consumers

### 6.3 Performance Audit

- [ ] Add response time logging to top 20 routes
- [ ] Identify slow queries
- [ ] Add database indexes where needed

---

## 🎯 SUCCESS METRICS

| Metric                  | Current | Target | Status |
| ----------------------- | ------- | ------ | ------ |
| API routes              | 804     | < 500  | 🔴     |
| API domains             | 180     | < 50   | 🔴     |
| Claims routes           | 86      | 20-25  | 🔴     |
| Test count              | 79      | 150    | 🔴     |
| Auth pattern compliance | ~60%    | 100%   | 🔴     |
| Direct Clerk imports    | 700+    | 0      | 🔴     |
| `safeOrgContext` usage  | ~50     | 0      | 🔴     |

---

## 📅 EXECUTION ORDER

### Week 1: Foundation

1. Create claims feature module structure
2. Implement core actions (create, update, delete)
3. Implement core queries (get, list)
4. Write tests for claims module

### Week 2: Migration

1. Create new consolidated routes
2. Update frontend to use new routes
3. Delete legacy routes
4. Migrate auth patterns

### Week 3: Consolidation

1. Merge duplicate domains
2. Expand test coverage
3. Clean up dead code
4. Document changes

---

## 🚨 RISKS & MITIGATIONS

| Risk                    | Mitigation                     |
| ----------------------- | ------------------------------ |
| Breaking frontend       | Feature flags, gradual rollout |
| Missing edge cases      | Comprehensive test suite       |
| Auth regressions        | CI auth drift guard            |
| Performance degradation | Add monitoring before/after    |

---

## 📝 COMMANDS

```bash
# Count current routes
find src/app/api -name "route.ts" | wc -l

# Count routes per domain
for d in src/app/api/*/; do echo "$(find "$d" -name "route.ts" | wc -l) ${d##src/app/api/}"; done | sort -rn | head -20

# Find direct Clerk imports
grep -r "from ['\"]@clerk/nextjs/server" src/app/api | wc -l

# Find safeOrgContext usage
grep -r "safeOrgContext" src/app/api | wc -l

# Run tests
pnpm test

# Run specific test file
pnpm test -- claims.test.ts
```

---

_Generated: $(date)_  
_Previous Sprint: Auth Hardening (469 files, -15,852 lines)_  
_Next Sprint: API Rationalization (target -300 routes)_
