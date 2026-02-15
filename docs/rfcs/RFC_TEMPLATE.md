# 📋 RFC TEMPLATE

**RFC Number:** RFC-###  
**Title:** [Short descriptive title]  
**Author:** [Your name]  
**Date:** [YYYY-MM-DD]  
**Status:** `DRAFT` | `PROPOSED` | `APPROVED` | `REJECTED` | `SHIPPED`

---

## 📌 PROBLEM STATEMENT

**What problem does this solve?**

<!--
Be specific. Describe the pain point from a user's perspective.
If you can't articulate the problem clearly, stop here.
-->

**Who experiences this problem?**

<!--
Which user personas? (Homeowners, Adjusters, Contractors, etc.)
How often? (Daily, weekly, once per claim?)
-->

**What happens today without this feature?**

<!--
Describe the current workaround or failure mode.
If there's no pain, there's no feature.
-->

---

## 🎯 PROPOSED SOLUTION

**High-level description:**

<!--
Explain the solution in 2-3 sentences.
Focus on WHAT it does, not HOW it works.
-->

**User-facing behavior:**

<!--
Walk through the user flow step-by-step:
1. User does X
2. System responds with Y
3. User sees Z
-->

**Triggering action:**

<!--
What specific user action kicks this off?
- Button click?
- Form submission?
- API call?
- Scheduled job?
-->

---

## 🗄️ DATA MODEL

**Prisma models (new or modified):**

```prisma
// Example:
model AuditLog {
  id          String   @id @default(cuid())
  orgId       String   // REQUIRED: ownership
  userId      String   // Who did the action
  action      String   // What they did
  entityType  String   // What table (Job, Claim, etc.)
  entityId    String   // Which record
  timestamp   DateTime @default(now())

  organization Organization @relation(fields: [orgId])
}
```

**Ownership:**

<!--
Every model MUST have:
- orgId (for org-scoped data)
- workspaceId (for workspace-scoped data)
- userId (for user-scoped data)

Which one applies here?
-->

**Data source:**

<!--
Where does the data come from?
- User input (forms)?
- External API (Stripe, weather)?
- Background job (scraping, analysis)?
- Derived from existing data?
-->

---

## 🔌 API DESIGN

**New routes:**

```typescript
// Example:
POST /api/audit/log
  Body: { action: string, entityType: string, entityId: string }
  Auth: Required (Clerk)
  Response: { success: boolean }

GET /api/audit/events
  Query: { orgId: string, limit?: number }
  Auth: Required (Clerk, orgId must match auth.orgId)
  Response: { events: AuditLog[] }
```

**Authentication:**

<!--
How is this route protected?
- Clerk auth() check?
- API key?
- Public (only for webhooks/marketing)?
-->

**Authorization:**

<!--
After auth, how do we verify permission?
- Check orgId matches user's org?
- Check workspace membership?
- Check role (admin only)?
-->

---

## 🎨 UI DESIGN

**New pages/components:**

<!--
List new pages or major components:
- /dashboard/audit-trail
- AuditLogTable.tsx
- FilterByDateRange.tsx
-->

**Mockups/wireframes:**

<!--
Attach screenshots, Figma links, or ASCII diagrams.
Even rough sketches help.
-->

**User feedback:**

<!--
How does the UI communicate success/failure?
- Toast notifications?
- Inline error messages?
- Loading states?
-->

---

## ⚠️ FAILURE MODES

**What can go wrong?**

<!--
List everything that might fail:
- Network errors
- Database timeouts
- External API unavailable
- Invalid user input
- Race conditions
-->

**How do we handle each failure?**

<!--
For each failure mode:
1. Log the error (where?)
2. Notify the user (how?)
3. Retry (if applicable)
4. Degrade gracefully (fallback behavior)

NO SILENT FAILURES.
-->

**Retry strategy:**

<!--
Should failed operations retry?
- Queue for background processing?
- Exponential backoff?
- Manual retry button?
-->

---

## 🧪 TESTING STRATEGY

**Unit tests:**

<!--
What functions need unit tests?
- API route handlers
- Data transformations
- Validation logic
-->

**Integration tests:**

<!--
What database interactions need testing?
- Prisma queries
- Transaction rollbacks
- Constraint violations
-->

**E2E tests (Playwright):**

<!--
What user flows need E2E coverage?
Example:
1. User clicks "View Audit Log"
2. Table loads with events
3. User filters by date
4. Results update correctly
-->

---

## 🔒 COMPLIANCE WITH CORE CONTRACT

**Check all that apply:**

- [ ] Uses Clerk for authentication (no custom auth)
- [ ] Every model has ownership (orgId, workspaceId, or userId)
- [ ] No cross-org data access
- [ ] All failures are logged and user-visible
- [ ] No "future use" code (everything has immediate purpose)
- [ ] If bridge-related: uses ClientWorkRequest correctly

**If any box is unchecked, explain why:**

<!--
Valid reasons:
- "This is a marketing page, no auth needed"
- "This is system-level data (migrations), no orgId"

Invalid reasons:
- "We'll add auth later"
- "Ownership not decided yet"
-->

---

## 📦 DEPENDENCIES

**External services:**

<!--
Does this feature depend on:
- Stripe?
- Email provider (Resend)?
- External APIs?
- S3/Supabase storage?
-->

**Blocked by:**

<!--
What needs to exist first?
- Other features?
- Migrations?
- Team approval?
- User research?
-->

**Blocking:**

<!--
What features depend on this?
-->

---

## 🚀 IMPLEMENTATION PLAN

**Estimated effort:**

<!--
Rough sizing:
- Small (1-2 days)
- Medium (3-5 days)
- Large (1-2 weeks)
- Extra Large (>2 weeks — consider breaking into smaller RFCs)
-->

**Phased rollout:**

<!--
Can this be shipped incrementally?

Phase 1: Backend + basic UI
Phase 2: Filters + pagination
Phase 3: Export feature

Or all-at-once?
-->

**Rollback plan:**

<!--
If this breaks in production, how do we roll back?
- Feature flag to disable?
- Database migration reversible?
- UI can be hidden without breaking app?
-->

---

## 🧠 WHY NOT NOW? (If status = PROPOSED or REJECTED)

**Reasons to defer:**

<!--
Valid reasons:
- Needs user research first
- Blocked by missing infrastructure
- Lower priority than other work
- Data not available yet (e.g., ML needs labeled examples)

Be honest. "Not ready" is better than "half-built and rotting".
-->

**What would make this ready?**

<!--
Concrete criteria:
- "After we have 100 labeled damage photos"
- "After user interviews with 5 adjusters"
- "After Stripe integration is stable"
-->

---

## 📊 SUCCESS METRICS

**How do we know this works?**

<!--
Define measurable outcomes:
- "90% of audit log page loads in <2s"
- "Zero email delivery failures in first week"
- "Users report 50% reduction in manual tracking"
-->

**What would cause us to remove this feature?**

<!--
Kill criteria:
- "If <5% of users access it in 90 days"
- "If maintenance cost exceeds value"
- "If it causes >3 production incidents"
-->

---

## 🔗 REFERENCES

**Related RFCs:**

<!--
Link to related or dependent RFCs
-->

**Prior art:**

<!--
Similar features in other apps?
Industry best practices?
-->

**User research:**

<!--
Link to user interviews, surveys, or feedback
-->

---

## ✅ APPROVAL CHECKLIST

Before marking as `APPROVED`:

- [ ] Problem statement is clear and specific
- [ ] Solution includes user flow and triggering action
- [ ] Data model includes ownership (orgId, workspaceId, userId)
- [ ] All failure modes have handling strategies
- [ ] Testing strategy covers unit/integration/E2E
- [ ] Complies with all Core Contract rules
- [ ] Implementation plan includes effort estimate and rollback
- [ ] Approved by at least 2 team members

**Approvals:**

- [ ] [Name 1] — [Date]
- [ ] [Name 2] — [Date]

---

## 📝 IMPLEMENTATION NOTES (Post-Approval)

**PR links:**

<!--
Link to implementation PRs once work begins
-->

**Deviations from RFC:**

<!--
Did implementation differ from design?
Document why, for future reference.
-->

**Lessons learned:**

<!--
After shipping, what would you do differently?
Update this section to help future RFCs.
-->
