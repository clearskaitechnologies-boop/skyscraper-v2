# ⭐ TOP 5 HIGH-VALUE FEATURES — STRATEGIC ROADMAP

**Date:** January 16, 2026  
**Status:** 📋 **DOCUMENTED — RFC REQUIRED BEFORE IMPLEMENTATION**  
**Purpose:** Identify the ONLY features worth building next, based on existing data and execution paths

---

## 🎯 SELECTION CRITERIA

Features were ranked by:

1. **Existing infrastructure** — Uses code that already works
2. **Revenue impact** — Directly affects monetization
3. **User trust** — Failures here lose customers
4. **Minimal new code** — Hardening, not invention
5. **Data availability** — Uses existing Prisma models

---

## 🏆 THE TOP 5 (RANKED BY VALUE)

---

### 1️⃣ CLAIM → REPORT RELIABILITY HARDENING

**Priority:** 🔴 **CRITICAL — DO FIRST**

#### Why This Is #1

- Claims + reports are the **core business**
- Errors here kill trust **instantly**
- Both already exist and work
- This is **stability**, not a new feature

#### What Exists Today

```
lib/claims/          — 24 files, 19 API imports
lib/reports/         — 37 files, 23 API imports
lib/report-engine/   — 11 files, 7 API imports
lib/branding/        — 4 files, 11 API imports
```

#### User-Facing Value

- Reports generate correctly every time
- No silent failures in PDF generation
- Branding always applies
- Error states are actionable, not blank

#### Implementation Scope

| Task                                      | Effort | Risk |
| ----------------------------------------- | ------ | ---- |
| Add error boundaries to report generation | 2 days | Low  |
| Add retry logic for PDF failures          | 1 day  | Low  |
| Add logging to claim→report pipeline      | 1 day  | Low  |
| Add health check for report-engine        | 1 day  | Low  |

**Total:** ~5 days

#### Explicitly NOT Included

- ❌ New report types
- ❌ Template explosion
- ❌ AI-powered report features
- ❌ Multi-format exports (Word, Excel)

#### Success Metrics

- Report generation success rate: 95% → 99.9%
- Mean time to diagnose report failure: <5 minutes
- Zero silent failures (all errors logged + UI notified)

#### RFC Required

```
docs/rfcs/RFC-001-CLAIM-REPORT-RELIABILITY.md
```

---

### 2️⃣ CLIENT PORTAL ACCEPTANCE & TIMELINE CLARITY

**Priority:** 🟠 **HIGH — USER TRUST**

#### Why This Is #2

- Portal already exists (dynamic imports prove real usage)
- Client trust = retention = revenue
- Timeline visibility reduces support calls
- Small effort, large perception impact

#### What Exists Today

```
lib/portal/          — 6 files, 9 API imports
lib/claims/timeline  — Part of claims lib
lib/email/           — 10 files, 19 API imports
```

#### User-Facing Value

- Client sees clear timeline of claim progress
- Client knows when report is ready
- Client can accept/acknowledge milestones
- Email notifications at key stages

#### Implementation Scope

| Task                              | Effort | Risk   |
| --------------------------------- | ------ | ------ |
| Add timeline component to portal  | 2 days | Low    |
| Add "Report Ready" notification   | 1 day  | Low    |
| Add acceptance confirmation flow  | 2 days | Medium |
| Add email triggers for milestones | 1 day  | Low    |

**Total:** ~6 days

#### Explicitly NOT Included

- ❌ Chat functionality
- ❌ Comments system
- ❌ File uploads from portal
- ❌ Real-time updates (WebSocket)

#### Success Metrics

- Portal visit-to-acceptance rate: +20%
- Support tickets about "where is my report": -50%
- Client NPS: +10 points

#### RFC Required

```
docs/rfcs/RFC-002-PORTAL-TIMELINE-ACCEPTANCE.md
```

---

### 3️⃣ TRADES ↔ CLAIMS CONNECTION (MINIMAL)

**Priority:** 🟡 **MEDIUM — BUSINESS GROWTH**

#### Why This Is #3

- Trades APIs exist
- Claims APIs exist
- Currently under-linked (missed revenue opportunity)
- Contractors need claims context, clients need trade context

#### What Exists Today

```
lib/trades/          — 4 files, trade types + vendorSync
app/api/trades/      — Multiple endpoints
lib/claims/          — Core claims system
```

#### User-Facing Value

- Contractor can see which claim a job relates to
- Client can see which trades are assigned
- Job status syncs with claim progress
- No manual "which claim is this for?" questions

#### Implementation Scope

| Task                                   | Effort | Risk   |
| -------------------------------------- | ------ | ------ |
| Add claimId to trade assignment        | 1 day  | Low    |
| Show claim context in trades dashboard | 2 days | Low    |
| Link trades from claim workspace       | 2 days | Medium |
| Add status sync trigger                | 2 days | Medium |

**Total:** ~7 days

#### Explicitly NOT Included

- ❌ Marketplace / bidding system
- ❌ Trade matching AI
- ❌ Scheduling system
- ❌ Payment integration

#### Success Metrics

- Trades with claim context: 0% → 80%
- Manual claim-trade matching: -90%
- Contractor confusion tickets: -60%

#### RFC Required

```
docs/rfcs/RFC-003-TRADES-CLAIMS-LINK.md
```

---

### 4️⃣ REPORT DELIVERY + CONFIRMATION LOOP

**Priority:** 🟢 **MEDIUM — VISIBILITY**

#### Why This Is #4

- Email + reports already wired
- Missing confirmation = blind spot
- "Did they receive it?" is a common question
- Legal value in delivery confirmation

#### What Exists Today

```
lib/email/           — 10 files, resend.ts handles sends
lib/reports/         — Report generation
lib/portal/          — Client access point
```

#### User-Facing Value

- Know when report was delivered
- Know when client opened it
- Know when client downloaded PDF
- Audit trail for legal disputes

#### Implementation Scope

| Task                                     | Effort | Risk |
| ---------------------------------------- | ------ | ---- |
| Add delivery tracking to email sends     | 1 day  | Low  |
| Add open/click tracking (Resend webhook) | 2 days | Low  |
| Store delivery events in database        | 1 day  | Low  |
| Show delivery status in dashboard        | 2 days | Low  |

**Total:** ~6 days

#### Explicitly NOT Included

- ❌ CRM functionality
- ❌ Notification center
- ❌ Multi-channel delivery
- ❌ Reminder automation

#### Success Metrics

- Reports with delivery confirmation: 0% → 95%
- "Did they get it?" support tickets: -80%
- Legal disputes with delivery proof: +100%

#### RFC Required

```
docs/rfcs/RFC-004-REPORT-DELIVERY-CONFIRMATION.md
```

---

### 5️⃣ STORAGE + UPLOAD GUARDRAILS

**Priority:** 🟢 **MEDIUM — RISK MITIGATION**

#### Why This Is #5

- Storage is actively used
- Uploads are happening now
- Uncontrolled = liability
- Missing: size limits, type validation, quota enforcement

#### What Exists Today

```
lib/storage/         — 18 files, Supabase client
lib/evidence/        — 3 files, auto-bucketing
app/api/upload/      — Multiple endpoints
```

#### User-Facing Value

- Clear upload size limits
- File type validation
- Storage quota visibility
- Error messages for failed uploads

#### Implementation Scope

| Task                      | Effort | Risk   |
| ------------------------- | ------ | ------ |
| Add file size validation  | 1 day  | Low    |
| Add file type whitelist   | 1 day  | Low    |
| Add storage quota per org | 2 days | Medium |
| Add quota UI display      | 1 day  | Low    |
| Add upload error handling | 1 day  | Low    |

**Total:** ~6 days

#### Explicitly NOT Included

- ❌ Media processing (resize, compress)
- ❌ CDN abstraction
- ❌ Video support
- ❌ Advanced file management UI

#### Success Metrics

- Uploads with validation: 0% → 100%
- Storage abuse incidents: 0 (currently unknown)
- Upload failure clarity: 100% (no silent failures)

#### RFC Required

```
docs/rfcs/RFC-005-STORAGE-UPLOAD-GUARDRAILS.md
```

---

## 📊 SUMMARY TABLE

| #   | Feature                      | Days | Revenue Impact | Risk   | Effort |
| --- | ---------------------------- | ---- | -------------- | ------ | ------ |
| 1   | Claim→Report Reliability     | 5    | 🔴 Critical    | Low    | Small  |
| 2   | Portal Timeline & Acceptance | 6    | 🟠 High        | Low    | Small  |
| 3   | Trades ↔ Claims Link         | 7    | 🟡 Medium      | Medium | Medium |
| 4   | Report Delivery Confirmation | 6    | 🟢 Medium      | Low    | Small  |
| 5   | Storage Upload Guardrails    | 6    | 🟢 Medium      | Low    | Small  |

**Total if all 5 built:** ~30 days (6 weeks with buffer)

---

## 🚫 EXPLICITLY BANNED (NOT IN TOP 5)

These features are **valuable concepts** but **not ready**:

| Feature              | Why Banned           | When Reconsider         |
| -------------------- | -------------------- | ----------------------- |
| AI Agents            | No labeled data      | 1000+ labeled examples  |
| Analytics Dashboard  | Complexity           | After core stable       |
| Notifications System | Scope creep          | After delivery tracking |
| Real-Time Chat       | Engineering overhead | After 10x user growth   |
| Marketplace          | Business model shift | After trades validates  |
| ML Damage Detection  | No training data     | After photo collection  |

See: [docs/PARKING_LOT.md](PARKING_LOT.md)

---

## 🎯 RECOMMENDED ORDER

### Week 1-2: Feature #1 (Claim→Report Reliability)

- Highest value, lowest risk
- Fixes trust issue immediately
- Foundation for everything else

### Week 3-4: Feature #2 (Portal Timeline)

- Client-facing improvement
- Uses same infrastructure
- Increases retention

### Week 5-6: Feature #4 (Delivery Confirmation)

- Natural extension of Portal work
- Legal value
- Simple to implement

### Week 7-8: Feature #5 (Upload Guardrails)

- Risk mitigation
- Infrastructure stability
- Low effort, high protection

### Week 9-10: Feature #3 (Trades↔Claims)

- Business expansion
- Requires stable core first
- Medium complexity

---

## 📋 HOW TO START

### Step 1: Pick ONE feature (recommend #1)

### Step 2: Write the RFC

```bash
cp docs/rfcs/RFC_TEMPLATE.md docs/rfcs/RFC-001-CLAIM-REPORT-RELIABILITY.md
```

### Step 3: Get approval (2 team members)

### Step 4: Implement in small PRs

### Step 5: Verify no regression

### Step 6: Move to next feature

---

## 🔒 GOVERNANCE RULES

Before ANY implementation:

1. ✅ RFC must exist
2. ✅ RFC must be APPROVED
3. ✅ Implementation must match RFC scope
4. ✅ "Explicitly NOT" items must NOT be built
5. ✅ Success metrics must be measurable

See: [docs/ENFORCEMENT_RULES.md](ENFORCEMENT_RULES.md)

---

## 🦅 FINAL WORD

These 5 features represent **the entire roadmap** for the next quarter.

Everything else is:

- In the parking lot (rejected)
- Requires an RFC (not yet written)
- Blocked by prerequisites

**Build these 5 well, and the platform is stable, trusted, and growing.**

**Build anything else, and you're reinflating entropy.**

Choose wisely. Start small. Ship value.
