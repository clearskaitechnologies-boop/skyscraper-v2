# 🧭 DECISION FRAMEWORK — FEATURE PRIORITIZATION

**Purpose:** Classify every feature idea into one of three lanes to prevent scope creep

---

## 🚦 THE THREE LANES

Every feature belongs in **exactly one** lane:

| Lane                            | Status        | Action                                     |
| ------------------------------- | ------------- | ------------------------------------------ |
| 🟢 **LANE 1 — CORE**            | Ship now      | Full implementation, E2E tests, production |
| 🟡 **LANE 2 — APPROVED FUTURE** | Document only | RFC written, no code yet                   |
| 🔴 **LANE 3 — REJECTED**        | Never build   | Permanently banned, document why           |

---

## 🟢 LANE 1 — CORE (BUILD NOW)

**Criteria:** Feature meets ALL of these:

1. **User demand exists** — Users are asking for it or actively using a workaround
2. **Data is available** — We have the database tables, external APIs, or user input
3. **Clear ownership** — Maps to `orgId`, `workspaceId`, or `userId`
4. **Revenue/workflow value** — Either generates money or eliminates manual work
5. **Low maintenance cost** — Doesn't require specialized expertise to maintain

**Examples:**

- ✅ Client ↔ Pro invites (active user flow)
- ✅ Job posting → workspace creation (revenue-generating)
- ✅ Messaging between client & pro (reduces email chaos)
- ✅ Claims dashboard (users log in daily)
- ✅ File uploads (active feature, working in production)

**Action:**

- Write RFC
- Get approval
- Implement with E2E tests
- Ship to production
- Monitor metrics

---

## 🟡 LANE 2 — APPROVED FUTURE (DOCUMENT ONLY)

**Criteria:** Feature is **valid but not ready** because:

1. **Needs user research** — Idea is promising but unvalidated
2. **Blocked by infrastructure** — Requires other features first
3. **Data not available** — Needs labeled datasets, external APIs, or integrations
4. **Lower priority** — Good idea, but other features have higher ROI
5. **Requires specialized skills** — Team doesn't have expertise yet

**Examples:**

- 🟡 ML damage detection (needs 500+ labeled photos first)
- 🟡 Smart job routing (needs historical success data)
- 🟡 Analytics dashboard (needs event tracking infrastructure)
- 🟡 Automated estimate generation (needs claims adjuster validation)
- 🟡 Mobile app (needs core web app to stabilize first)

**Action:**

- Write **RFC stub** (not full RFC)
- Document:
  - **Problem it solves**
  - **Why not now** (specific blockers)
  - **What would make it ready** (concrete criteria)
- File in `docs/rfcs/` with status `PROPOSED`
- **DO NOT IMPLEMENT** any code
- Revisit quarterly during roadmap planning

**RFC Stub Template:**

```markdown
# RFC-###-FEATURE-NAME

**Status:** PROPOSED (Deferred)

## Problem

[What user pain does this solve?]

## Why Not Now

- Blocker 1: [e.g., "No labeled damage photos for training"]
- Blocker 2: [e.g., "Team has no ML expertise"]

## Ready When

- Criterion 1: [e.g., "500+ labeled images collected"]
- Criterion 2: [e.g., "ML engineer hired"]

## Estimated Value (When Ready)

[e.g., "Could reduce claim processing time by 30%"]
```

---

## 🔴 LANE 3 — REJECTED (NEVER BUILD)

**Criteria:** Feature is **permanently banned** because:

1. **Doesn't align with product identity** — We're not building this kind of product
2. **Extreme complexity for minimal value** — Engineering cost >> user value
3. **Requires team/infra we don't have** — Blockchain, quantum, service mesh, etc.
4. **Violates Core Contract** — Can't comply with auth, ownership, or failure rules
5. **Already tried and failed** — Shipped, nobody used it, removed

**Examples:**

- ❌ Blockchain integration (no use case, extreme complexity)
- ❌ Quantum computing (aspirational, no team, no need)
- ❌ Service mesh (enterprise infra, team too small)
- ❌ AI-generated legal documents (liability risk, no validation)
- ❌ Self-hosted infrastructure (SaaS model only)
- ❌ Real-time collaboration (Figma-style, too complex for value)
- ❌ Multi-language support (single-market focus for now)

**Action:**

- Document in `docs/PARKING_LOT.md`
- Include:
  - **What it was**
  - **Why rejected** (specific reasons)
  - **Under what conditions we'd reconsider** (e.g., "If we raise Series B and hire distributed systems team")
- **DELETE** any existing code/scaffolding
- Mark in commit message: `chore: remove [feature] per LANE 3 rejection`

---

## 🧠 DECISION FLOWCHART

```
New Feature Idea
       ↓
┌──────────────────────────────┐
│ Does it have active users?   │
│ Does data exist?              │
│ Clear ownership?              │
│ Revenue/workflow value?       │
└──────────────────────────────┘
       ↓
   ALL YES? → 🟢 LANE 1 — Build now
       ↓
   SOME YES? → 🟡 LANE 2 — Document, defer
       ↓
   ALL NO? → 🔴 LANE 3 — Reject, delete
```

---

## 📊 LANE INVENTORY (Current)

<!-- Update this table quarterly -->

### 🟢 LANE 1 — CORE (Active Production Features)

| Feature             | Status  | Usage  |
| ------------------- | ------- | ------ |
| Client ↔ Pro Bridge | ✅ Live | Active |
| Job Posting         | ✅ Live | Active |
| Messaging           | ✅ Live | Active |
| Claims Workspace    | ✅ Live | Active |
| File Uploads        | ✅ Live | Active |
| Reports Generation  | ✅ Live | Active |
| Billing (Stripe)    | ✅ Live | Active |
| Email Notifications | ✅ Live | Active |
| Weather Data        | ✅ Live | Active |

### 🟡 LANE 2 — APPROVED FUTURE (Documented, Not Implemented)

| Feature             | Blockers               | Ready When                |
| ------------------- | ---------------------- | ------------------------- |
| ML Damage Detection | No labeled data        | 500+ labeled images       |
| Smart Job Routing   | No success metrics     | 6 months historical data  |
| Analytics Dashboard | No event tracking      | Telemetry infrastructure  |
| Automated Estimates | No validation workflow | Adjuster approval process |
| Audit Trail         | Lower priority         | After API lockdown        |

### 🔴 LANE 3 — REJECTED (Permanently Banned)

| Feature           | Reason                          |
| ----------------- | ------------------------------- |
| Blockchain        | No use case, extreme complexity |
| Quantum Computing | Aspirational, no team           |
| Service Mesh      | Over-engineered for team size   |
| Self-hosted       | SaaS-only model                 |
| Real-time Collab  | Too complex for current value   |

---

## 🔄 QUARTERLY REVIEW PROCESS

**Every 90 days:**

1. **Review Lane 2** — Any blockers removed? Move to Lane 1 if ready
2. **Review Lane 1** — Any features unused? Move to Lane 3 if dead
3. **Review Lane 3** — Any conditions changed? Reconsider if circumstances shifted

**Document changes:**

- Update this file
- Link to commit showing code additions/removals
- Update `docs/CHANGELOG.md` with decisions

---

## 🛡️ ENFORCEMENT RULES

### ❌ Forbidden Actions

- **NO** implementing Lane 2 features without moving to Lane 1 first
- **NO** implementing Lane 3 features (ever)
- **NO** adding features without lane assignment
- **NO** "experimental" code that bypasses this framework

### ✅ Required Actions

- **EVERY** new feature idea gets a lane assignment
- **EVERY** RFC must reference lane (e.g., "This is a Lane 1 feature")
- **EVERY** PR must reference RFC number (e.g., "Implements RFC-012")
- **EVERY** rejected feature gets documented in `PARKING_LOT.md`

---

## 🎯 SUCCESS METRICS

**Lane 1 (Core):**

- 100% of production features have active users
- <5 production incidents per quarter
- All features have E2E test coverage

**Lane 2 (Future):**

- <10 deferred features at any time (forces prioritization)
- Every deferred feature has concrete "ready when" criteria
- Quarterly review moves at least 1 feature to Lane 1 or Lane 3

**Lane 3 (Rejected):**

- Zero code exists for rejected features
- No RFCs proposed for banned categories
- Team understands why these are rejected (documented)

---

## 🆘 WHEN TO ESCALATE

**Disagreement on lane assignment?**

1. Write RFC with your reasoning
2. Present to team meeting
3. Vote (majority wins)
4. Document decision in this file

**Lane 3 feature keeps getting proposed?**

- Update `PARKING_LOT.md` with more detailed rejection reasoning
- Create "Why we don't do X" doc if needed
- Add to onboarding materials so new team members understand

---

**Remember:** Every feature has a cost. Every lane has a purpose.

- 🟢 Lane 1 = **Proven value, ship it**
- 🟡 Lane 2 = **Potential value, wait for blockers to clear**
- 🔴 Lane 3 = **No value or too costly, never build**

**Discipline beats ambition.**
