# 📜 RFC PROCESS — REQUEST FOR COMMENTS

**Purpose:** Prevent scope creep, fantasy architecture, and unapproved feature development

---

## 🎯 WHAT IS AN RFC?

A **Request for Comments** is a **design document** that must be approved **before** any code is written for a new feature.

RFCs answer:

- **Why** this feature exists
- **Who** needs it (user personas)
- **What** data it uses (Prisma models, ownership)
- **How** it fails safely (error handling, retry logic)
- **Why NOT** building it now (if deferred)

---

## 📋 WHEN TO WRITE AN RFC

**REQUIRED for:**

- New Prisma models or migrations
- New API routes that write data
- New UI pages with backend logic
- New integrations (Stripe, email, external APIs)
- Major refactors affecting >10 files

**NOT REQUIRED for:**

- Bug fixes
- UI-only changes (CSS, layout)
- Documentation updates
- Test additions
- Performance optimizations (unless architecture changes)

---

## 🚦 RFC LIFECYCLE

```
1. DRAFT    → Author writes RFC, seeks feedback
2. PROPOSED → Team reviews, asks questions
3. APPROVED → Implementation can begin
4. REJECTED → Moved to docs/parking-lot.md
5. SHIPPED  → Feature is live in production
```

**Key Rule:** Code CANNOT be merged until RFC status = `APPROVED`

---

## 📝 HOW TO CREATE AN RFC

1. Copy `docs/rfcs/RFC_TEMPLATE.md` to `docs/rfcs/RFC-###-FEATURE-NAME.md`
2. Fill out all required sections
3. Create PR with RFC only (no implementation code)
4. Get approval from 2+ team members
5. Update status to `APPROVED`
6. Implement in separate PR, referencing RFC number

---

## 🗂️ RFC NAMING CONVENTION

```
docs/rfcs/RFC-###-SHORT-TITLE.md
```

**Examples:**

- `RFC-001-CLIENT-PRO-BRIDGE.md` — Initial bridge design
- `RFC-012-ML-DAMAGE-DETECTION.md` — Future ML feature (deferred)
- `RFC-023-AUDIT-TRAIL.md` — Activity logging system

**Number assignment:** Use next available number (check `ls docs/rfcs/`)

---

## 🧠 RFC PHILOSOPHY

> **Ideas are cheap. Implementation is expensive.**

RFCs force us to:

- **Think before coding** (avoid wasted work)
- **Debate design early** (before code is written)
- **Preserve intent** (future context for why we built something)
- **Reject bad ideas** (before they pollute the codebase)

---

## 🔒 RELATIONSHIP TO CORE CONTRACT

All RFCs must comply with `docs/CORE_CONTRACT.md`:

- ✅ Uses Clerk for auth
- ✅ Data has ownership (orgId, workspaceId)
- ✅ Failures are logged/retried
- ✅ No fantasy architecture

If an RFC violates the contract → **auto-rejected**

---

## 📊 CURRENT RFCs

<!-- Update this list when new RFCs are created -->

| RFC #      | Title | Status | Author | Date |
| ---------- | ----- | ------ | ------ | ---- |
| (none yet) |       |        |        |      |

---

## 🆘 HELP

**Questions about RFCs?**

- Read existing approved RFCs (when available)
- Check `docs/DECISION_FRAMEWORK.md` for evaluation criteria
- Ask in team chat before writing

**Need help writing an RFC?**

- Use the template — it guides you through everything
- Start with "Problem Statement" — if you can't articulate the problem, don't build
- Show to a teammate for feedback before submitting

---

**Remember:** RFCs protect the system from rot. They're not bureaucracy — they're discipline.
