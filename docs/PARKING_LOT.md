# 🅿️ PARKING LOT — REJECTED FEATURES

**Purpose:** Document why certain features are permanently rejected to prevent re-proposals

---

## 🔴 PERMANENTLY REJECTED FEATURES

These features are **never** being built unless company strategy fundamentally changes.

---

### ❌ Blockchain Integration

**What it was:**

- Smart contracts for vendor payments
- Decentralized claim verification
- NFT-based proof of damage

**Why rejected:**

1. **No use case** — Stripe works perfectly for payments
2. **Extreme complexity** — Requires blockchain expertise we don't have
3. **User confusion** — Homeowners don't understand crypto
4. **Regulatory risk** — Unclear legal status
5. **Cost** — Gas fees would exceed transaction value

**What would make us reconsider:**

- Insurance industry adopts blockchain as standard (not happening)
- Regulatory clarity + user demand (neither exist)
- VC specifically funds blockchain pivot (not our strategy)

**Code deleted:** Removed `src/lib/blockchain/`, `src/lib/consensus/` (Jan 16, 2026)

---

### ❌ Quantum Computing

**What it was:**

- Quantum-resistant encryption
- Quantum simulation for damage modeling

**Why rejected:**

1. **No quantum computers exist** for commercial use
2. **No team expertise** — Would need quantum physicists
3. **Aspirational** — Copy-pasted research papers, not real code
4. **No customer demand** — Nobody asking for this

**What would make us reconsider:**

- Quantum computers become commercially available
- Competitors use quantum tech successfully
- Security threat requires quantum-resistant crypto

**Code deleted:** Removed `src/lib/quantum/` (Jan 16, 2026)

---

### ❌ Service Mesh / Microservices

**What it was:**

- Kubernetes orchestration
- Service-to-service auth with mTLS
- Distributed tracing
- Load balancing, circuit breakers, retries

**Why rejected:**

1. **Team too small** — Need dedicated DevOps team
2. **No scale problem** — Monolith works fine at current traffic
3. **Over-engineered** — Adds complexity without benefit
4. **Operational burden** — Would slow down development

**What would make us reconsider:**

- Team grows to >20 engineers
- Monolith performance degrades under load
- Specific services need independent scaling
- Hired senior DevOps/SRE engineers

**Code deleted:** Removed `src/lib/mesh/`, `src/lib/sharding/`, `src/lib/discovery/`, `src/lib/loadbalancer/` (Jan 16, 2026)

---

### ❌ Machine Learning (For Now)

**What it was:**

- Damage detection from photos
- Automated estimate generation
- Fraud detection
- Smart job routing

**Why rejected (currently):**

1. **No labeled training data** — Need 1000+ labeled examples
2. **No ML expertise** — Would need to hire ML engineer
3. **Validation required** — Can't auto-generate estimates without adjuster approval
4. **Liability risk** — Wrong estimate could cause legal issues

**What would make us reconsider:**

- Collect 1000+ labeled damage photos
- Hire ML engineer or partner with ML vendor
- Build adjuster validation workflow
- Legal approves AI-assisted estimates

**Code deleted:** Removed `src/lib/ml/`, `src/lib/vision/`, `src/lib/zero-shot/`, `src/lib/transfer/`, `src/lib/transformer/`, `src/lib/cognitive/`, `src/lib/synthetic/`, `src/lib/federation/`, `src/lib/optimization/` (Jan 16, 2026)

**Status:** 🟡 **Moved to Lane 2 (Future)** — Will reconsider when data + team exist

---

### ❌ Self-Hosted / On-Premise Deployment

**What it was:**

- Docker containers for customer servers
- Kubernetes manifests for enterprise deploys
- Database replication for multi-region

**Why rejected:**

1. **SaaS-only business model** — We don't sell licenses
2. **Support burden** — Can't debug customer's infrastructure
3. **Security risk** — Can't guarantee updates are applied
4. **Fragmentation** — Every customer on different version

**What would make us reconsider:**

- Enterprise customers demand it (none have)
- Competitor wins deals with on-prem offering
- Government contracts require air-gapped deployment

**Code deleted:** Removed `src/lib/container/`, `src/lib/deploy/`, `src/lib/edge/` (Jan 16, 2026)

---

### ❌ Real-Time Collaboration (Figma-Style)

**What it was:**

- Live cursors showing other users
- Operational Transform (OT) for concurrent edits
- WebSocket-based state sync
- Conflict resolution

**Why rejected:**

1. **Extreme complexity** — CRDTs, OT, and WebSockets are hard to get right
2. **Low value** — Users don't edit claims simultaneously
3. **Performance cost** — Constant WebSocket connections expensive
4. **Maintenance burden** — Requires real-time infrastructure expertise

**What would make us reconsider:**

- User research shows collaboration pain (hasn't)
- Simple locking mechanism fails (it hasn't)
- Team size supports dedicated real-time team

**Code deleted:** Removed `src/lib/websocket/`, `src/lib/websockets/`, `src/lib/realtime/`, `src/lib/stream/`, `src/lib/streaming/` (Jan 16, 2026)

---

### ❌ Multi-Language Support (i18n)

**What it was:**

- Translate UI to Spanish, French, etc.
- Locale-specific date/currency formatting
- Multi-language support tickets

**Why rejected (currently):**

1. **Single-market focus** — US-only for now
2. **Translation cost** — Professional translation expensive
3. **Support burden** — Can't provide support in other languages
4. **Low demand** — Users haven't requested it

**What would make us reconsider:**

- Expand to Canada, Mexico, or EU markets
- User demand from non-English speakers
- Hire multilingual support team

**Code deleted:** Removed `src/lib/i18n/` (Jan 16, 2026)

**Status:** 🟡 **Moved to Lane 2 (Future)** — Reconsider if we expand markets

---

### ❌ White-Label / Multi-Tenancy (Custom Branding Per Customer)

**What it was:**

- Custom logos, colors, domains per customer
- Customer-specific UI themes
- Branded email templates

**Why rejected:**

1. **Not B2B2C model** — We sell directly to end users
2. **Fragmentation risk** — Every customer UI is different
3. **Testing nightmare** — Can't QA infinite themes
4. **No demand** — Customers don't need branded versions

**What would make us reconsider:**

- Pivot to B2B2C (selling to insurance companies to rebrand)
- Customer explicitly requests whitelabel
- Charge premium tier for custom branding

**Code deleted:** Removed `src/lib/whitelabel/`, `src/lib/multitenancy/` (Jan 16, 2026)

---

### ❌ GraphQL API

**What it was:**

- GraphQL schema for flexible queries
- Apollo Server integration
- Subscription support for real-time updates

**Why rejected:**

1. **No usage found** — Zero GraphQL imports in app
2. **REST works fine** — Existing API routes sufficient
3. **Adds complexity** — Schema, resolvers, caching
4. **No client demand** — Nobody asking for GraphQL

**What would make us reconsider:**

- Mobile app needs flexible queries
- Third-party integrations demand GraphQL
- REST API becomes unwieldy

**Code deleted:** None found (was never implemented, confirmed zero usage)

---

## 🧠 COMMON REJECTION PATTERNS

### Pattern 1: "Cool Tech, No User"

Features rejected because they're **engineering-driven**, not **user-driven**.

Examples: Blockchain, Quantum, GraphQL

**Lesson:** Build for users, not for resume.

---

### Pattern 2: "Needs Team We Don't Have"

Features rejected because they require **specialized expertise**.

Examples: ML, Service Mesh, Real-Time Collaboration

**Lesson:** Team size determines feasibility.

---

### Pattern 3: "Not Our Business Model"

Features rejected because they **don't align with SaaS strategy**.

Examples: Self-Hosted, White-Label

**Lesson:** Strategy dictates features, not vice versa.

---

### Pattern 4: "Too Complex for Value"

Features rejected because **cost >> benefit**.

Examples: Real-Time Collaboration, Service Mesh

**Lesson:** Boring tech wins. Complexity is a cost.

---

## 🔄 QUARTERLY REVIEW

**Every 90 days, review this list:**

1. Any conditions changed that warrant reconsideration?
2. Any new features proposed that match existing rejections?
3. Any patterns emerging that should update `DECISION_FRAMEWORK.md`?

**Document changes:**

- Update status (🔴 Rejected → 🟡 Lane 2 if conditions changed)
- Link to RFC if moved to Lane 2
- Update commit messages

---

## 🆘 IF SOMEONE PROPOSES A REJECTED FEATURE

**Don't just say "no":**

1. Link to this document
2. Explain the specific rejection reason
3. Show what conditions would need to change
4. Suggest alternatives that align with strategy

**If they insist:**

- Escalate to team discussion
- Vote on reconsideration
- Update this document with decision

---

**Remember:** Saying "no" protects focus. Every rejection is a strategic choice.
