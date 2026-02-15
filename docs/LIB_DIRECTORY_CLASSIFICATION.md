# 📁 LIB DIRECTORY CLASSIFICATION

**Date:** January 16, 2026  
**Purpose:** Classify every `/src/lib` directory by status to enable safe future cleanup

---

## 🎯 CLASSIFICATION SYSTEM

| Status        | Meaning                               | Action                        |
| ------------- | ------------------------------------- | ----------------------------- |
| 🟢 **CORE**   | Critical infrastructure, proven usage | Never delete, protect         |
| 🔵 **ACTIVE** | Used in production, stable            | Maintain, document            |
| 🟡 **LEGACY** | Used but deprecated patterns          | Read-only, plan migration     |
| 🟠 **PARKED** | No new usage, awaiting removal        | No imports, schedule deletion |
| 🔴 **DEAD**   | Zero imports, safe to delete          | Delete in next cleanup        |

---

## 📊 FULL CLASSIFICATION (141 directories)

### 🟢 CORE (15 directories) — Never Delete

These are **critical infrastructure** with proven production usage:

| Directory         | Files | Evidence                      | Owner        |
| ----------------- | ----- | ----------------------------- | ------------ |
| **db**            | 11+   | Static imports, Prisma client | Platform     |
| **api**           | 6+    | Static imports, API utils     | Platform     |
| **auth**          | 1+    | Static imports, Clerk helpers | Auth         |
| **claims**        | 24    | 19 API imports, core business | Claims Team  |
| **reports**       | 37    | 23 API imports, core business | Reports Team |
| **portal**        | 6     | 9 API imports, client-facing  | Portal Team  |
| **email**         | 10    | 19 API imports, Resend        | Comms Team   |
| **storage**       | 18    | 12 API imports, Supabase      | Platform     |
| **billing**       | 12    | 11 API imports, Stripe        | Billing Team |
| **report-engine** | 11    | 7 API imports, PDF gen        | Reports Team |
| **pdf**           | 30    | 10 API imports, PDF utils     | Reports Team |
| **weather**       | 21    | 8 API imports, weather data   | Data Team    |
| **services**      | 13    | 9 API imports, integrations   | Platform     |
| **jobs**          | 9     | 2 API imports, scheduling     | Platform     |
| **analytics**     | 9     | 3 API imports, tracking       | Data Team    |

---

### 🔵 ACTIVE (15 directories) — Maintain & Document

These are **used in production** via file-level imports:

| Directory      | Files | Evidence        | Notes                           |
| -------------- | ----- | --------------- | ------------------------------- |
| **branding**   | 4     | 11 API imports  | Report branding, getOrgBranding |
| **tokens**     | 4     | 8 API imports   | Token system, charge.ts         |
| **validation** | 4     | 4 API imports   | Zod schemas                     |
| **evidence**   | 3     | 3 API imports   | File upload bucketing           |
| **proposals**  | 4     | 6 API imports   | Proposal AI + render            |
| **cache**      | 5     | 2 API imports   | Claim context caching           |
| **queue**      | 4     | 2 API imports   | Background job queue            |
| **workspace**  | 2     | 1 API imports   | ensureWorkspaceForOrg           |
| **stripe**     | 2     | 1 API imports   | Customer management             |
| **timeline**   | 2     | 1 API imports   | Event emission                  |
| **trades**     | 4     | 1 API imports   | Vendor sync                     |
| **demo**       | 4     | 4 API imports   | Demo mode, demoSeed             |
| **esign**      | 4     | Used by PDF gen | eSignature flow                 |
| **intel**      | 2     | Unknown         | Needs verification              |
| **lob**        | 2     | Unknown         | Needs verification              |

---

### 🟡 LEGACY (10 directories) — Read-Only, Plan Migration

These have **patterns we want to phase out**:

| Directory             | Files | Issue               | Migration Plan      |
| --------------------- | ----- | ------------------- | ------------------- |
| **firebase**          | 1     | Legacy storage      | Migrate to storage/ |
| **client-portal**     | 4     | Duplicates portal/  | Merge into portal/  |
| **claim** (singular)  | 1     | Duplicates claims/  | Merge into claims/  |
| **report** (singular) | 2     | Duplicates reports/ | Merge into reports/ |
| **registry**          | 4     | Unused pattern      | Delete after audit  |
| **hooks**             | 2     | Could be in app     | Evaluate need       |
| **http**              | 1     | Could use fetch     | Evaluate need       |
| **net**               | 2     | Duplicates http     | Merge or delete     |
| **server**            | 1     | Unclear purpose     | Evaluate need       |
| **utils**             | 6     | Too generic         | Split by domain     |

---

### 🟠 PARKED (30 directories) — No New Imports

These are **not being used** but need verification before deletion:

| Directory       | Files | Last Import      | Status             |
| --------------- | ----- | ---------------- | ------------------ |
| agent           | 5     | Modules only     | Awaiting deletion  |
| artifacts       | 5     | Unclear          | Awaiting deletion  |
| audit           | 2     | Unclear          | Awaiting deletion  |
| carrier         | 2     | Only by catstorm | Awaiting deletion  |
| catstorm        | 3     | Zero app imports | Awaiting deletion  |
| citations       | 2     | Unclear          | Awaiting deletion  |
| contractors     | 3     | Unclear          | Awaiting deletion  |
| depreciation    | 3     | Unclear          | Awaiting deletion  |
| documents       | 4     | Unclear          | Awaiting deletion  |
| geo             | 1     | Unclear          | Awaiting deletion  |
| geocode         | 2     | Unclear          | Awaiting deletion  |
| legal           | 2     | Unclear          | Awaiting deletion  |
| materials       | 1     | Unclear          | Awaiting deletion  |
| mentions        | 1     | Unclear          | Awaiting deletion  |
| messages        | 1     | Unclear          | Awaiting deletion  |
| monitoring      | 1     | Unknown          | Needs verification |
| onboarding      | 1     | Unclear          | Awaiting deletion  |
| operations      | 1     | Unclear          | Awaiting deletion  |
| org             | 1     | Unknown          | Needs verification |
| pricing         | 1     | Unknown          | Needs verification |
| profiling       | 1     | Unclear          | Awaiting deletion  |
| qr              | 1     | Unknown          | Needs verification |
| rebuttals       | 1     | Unclear          | Awaiting deletion  |
| referrals       | 2     | Unclear          | Awaiting deletion  |
| report-assembly | 1     | Unclear          | Awaiting deletion  |
| search          | 5     | Unclear          | Awaiting deletion  |
| security        | 1     | Unknown          | Needs verification |
| signatures      | 1     | Unclear          | Awaiting deletion  |
| storm           | 3     | Unclear          | Awaiting deletion  |
| storm-intake    | 6     | Zero app imports | Awaiting deletion  |

---

### 🔴 DEAD (71 directories) — Safe to Delete

These have **ZERO imports** and are safe to delete:

#### ML/AI Infrastructure (9)

- active, causal, continual, ensemble, generative
- meta, multitask, quantization, xai

#### Enterprise Infrastructure (15)

- cloud, deploy, disaster, domains, failover
- gateway, isolation, loadbalancer, logging, locking
- metrics, middleware, migration, observability, orchestration

#### Experimental (20)

- comments, community, config, constants, cost
- credits, customFields, datalake, debug, delta
- denial, diagnostics, dominus, encryption, env
- errors, events, features, filters, incidents

#### Dead Features (15)

- knowledge, legacy, media, nas, prioritization
- reactive, responsive, rl, runtime, shortcuts
- supplement, tasks, tax, template, trust

#### Unused Utilities (12)

- activity, intelligence, timeseries, uploads, usage
- vendors, websocket, websockets, ui

---

## 📊 SUMMARY

| Status    | Count   | % of Total | Action             |
| --------- | ------- | ---------- | ------------------ |
| 🟢 CORE   | 15      | 10.6%      | Protect            |
| 🔵 ACTIVE | 15      | 10.6%      | Maintain           |
| 🟡 LEGACY | 10      | 7.1%       | Migrate            |
| 🟠 PARKED | 30      | 21.3%      | Verify then delete |
| 🔴 DEAD   | 71      | 50.4%      | Delete             |
| **Total** | **141** | 100%       | —                  |

---

## 🎯 DELETION PRIORITY

### Phase 1: Delete DEAD (71 dirs) — Lowest Risk

- Zero imports confirmed
- No usage anywhere
- Estimated: 50,000+ lines removed

### Phase 2: Delete PARKED (30 dirs) — After Verification

- Needs file-level import check
- May have edge cases
- Estimated: 15,000+ lines removed

### Phase 3: Migrate LEGACY (10 dirs) — After RFC

- Requires refactoring
- May break patterns
- Needs migration plan

---

## 🔧 VERIFICATION PROCESS

Before deleting any directory:

### Step 1: Run file-level import check

```bash
./scripts/check-lib-usage.sh [directory]
```

### Step 2: Run TypeScript compilation

```bash
npx tsc --noEmit
```

### Step 3: Check for dynamic imports

```bash
grep -r 'import("@/lib/[directory]' src/
```

### Step 4: If ALL pass → Delete

### Step 5: If ANY fail → Move to PARKED for investigation

---

## 📅 REVIEW SCHEDULE

- **Weekly:** Check if new imports added to PARKED directories
- **Monthly:** Review PARKED for movement to DEAD or ACTIVE
- **Quarterly:** Full audit of all classifications

---

## 🔒 RULES

1. **No new imports** to 🟠 PARKED or 🔴 DEAD directories
2. **No modifications** to 🟡 LEGACY without RFC
3. **RFC required** to move anything OUT of 🟢 CORE
4. **TypeScript must pass** after any deletion
5. **One directory at a time** during deletion phases

---

## 📝 OWNERSHIP ASSIGNMENT (TODO)

| Status    | Assigned       | Due       |
| --------- | -------------- | --------- |
| 🟢 CORE   | Platform Team  | Immediate |
| 🔵 ACTIVE | Feature Teams  | Immediate |
| 🟡 LEGACY | Tech Debt Team | Q1 2026   |
| 🟠 PARKED | Cleanup Bot    | Ongoing   |
| 🔴 DEAD   | Cleanup Bot    | Week 1    |

---

**Next Step:** Create `scripts/check-lib-usage.sh` for safe deletion verification
