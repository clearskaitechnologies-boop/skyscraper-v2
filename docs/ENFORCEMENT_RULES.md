# 🛡️ ENFORCEMENT RULES — SYSTEM PROTECTION MECHANISMS

**Purpose:** Prevent regressions, drift, and unapproved feature development

---

## 🚨 RULE 1: NO NEW PRISMA MODELS WITHOUT RFC

**Rule:** Every new Prisma model or model modification MUST have an approved RFC

**Enforcement:**

1. **Pre-merge check:**

   ```bash
   # In PR review, check if schema.prisma changed
   git diff main...HEAD -- prisma/schema.prisma

   # If changed, verify RFC link in PR description
   # Format: "Implements RFC-###"
   ```

2. **Automated check (future):**
   ```yaml
   # .github/workflows/enforce-rfc.yml
   - name: Check for schema changes
     run: |
       if git diff --name-only main...HEAD | grep -q "schema.prisma"; then
         if ! grep -q "RFC-" PR_DESCRIPTION; then
           echo "ERROR: schema.prisma changed without RFC link"
           exit 1
         fi
       fi
   ```

**Violations:**

- PR is blocked until RFC is created and approved
- No emergency exceptions (create RFC first, even if 10 minutes)

**Valid exceptions:** None

---

## 🚨 RULE 2: NO NEW API ROUTES WITHOUT AUTH

**Rule:** Every `/api` route that writes data MUST call `auth()` from Clerk

**Enforcement:**

1. **Manual check (current):**

   ```bash
   # Run API auth audit
   node scripts/audit-api-auth.js

   # Output must show:
   # - Unprotected Routes: 0 (for write routes)
   # - Protected Routes: [count]
   ```

2. **Automated check:**
   ```bash
   # Check new API files in PR
   git diff main...HEAD --name-only | grep "app/api/" | while read file; do
     # If contains POST/PUT/PATCH/DELETE
     if grep -qE "export async function (POST|PUT|PATCH|DELETE)" "$file"; then
       # Must contain auth() call
       if ! grep -q "auth()" "$file"; then
         echo "ERROR: $file writes data without auth()"
         exit 1
       fi
     fi
   done
   ```

**Violations:**

- PR blocked until `auth()` check added
- Unprotected routes reported in code review

**Valid exceptions:**

- Public webhooks (Stripe, external integrations)
  - MUST verify webhook signature instead
  - MUST document in code comment why auth() not used
- Marketing pages (no data writes)

---

## 🚨 RULE 3: NO UI WITHOUT DATA OWNERSHIP

**Rule:** Every user-facing page MUST filter data by `orgId`, `workspaceId`, or `userId`

**Enforcement:**

1. **Code review checklist:**

   ```markdown
   - [ ] Page queries Prisma with ownership filter
   - [ ] Query includes `where: { orgId: user.orgId }` or equivalent
   - [ ] No `findMany()` without `where` clause
   ```

2. **Automated check:**
   ```bash
   # Check for unscoped Prisma queries
   grep -r "\.findMany()" src/app --include='*.ts' --include='*.tsx' | \
   grep -v "where:" | \
   grep -v "// SYSTEM QUERY" # Allow commented exceptions
   ```

**Violations:**

- PR blocked until ownership filter added
- Security review flagged

**Valid exceptions:**

- System-level pages (admin tools)
  - MUST have admin role check
  - MUST document in code comment
- Marketing pages (no Prisma queries)

---

## 🚨 RULE 4: NO "FUTURE USE" CODE

**Rule:** Code without execution path, users, or data MUST be removed or moved to RFC

**Enforcement:**

1. **Quarterly audit:**

   ```bash
   # Find dead delegates
   node scripts/find-dead-delegates.js

   # Find unused lib directories
   for dir in src/lib/*/; do
     count=$(grep -r "from '@/lib/$(basename $dir)" src/app | wc -l)
     if [ "$count" -eq 0 ]; then
       echo "Unused: $dir"
     fi
   done

   # Find unused API routes
   node scripts/verify-routes.js
   ```

2. **PR review:**
   - Reviewer asks: "Is this used right now?"
   - If "no" or "later" → reject PR
   - If "yes" → require proof (import, route, user flow)

**Violations:**

- Feature moved to RFC (Lane 2)
- Code deleted
- PR rejected

**Valid exceptions:**

- Explicitly marked as infrastructure (e.g., `formTracker.ts`)
  - MUST have at least 1 import
  - MUST document purpose in comment

---

## 🚨 RULE 5: NO EMPTY CATCH BLOCKS

**Rule:** Every `catch` block MUST log error or notify user

**Enforcement:**

1. **Automated check:**

   ```bash
   # Find empty catch blocks
   grep -rE "catch.*\{\s*\}" src/app src/lib --include='*.ts' --include='*.tsx'

   # Must return 0 results
   ```

2. **ESLint rule (future):**
   ```javascript
   // .eslintrc.js
   rules: {
     "no-empty": ["error", { "allowEmptyCatch": false }]
   }
   ```

**Violations:**

- PR blocked until error handling added
- Options:
  - `console.error("[Context]", error)`
  - `return { error: "User-friendly message" }`
  - `await logError(error)`

**Valid exceptions:** None (logging is always possible)

---

## 🚨 RULE 6: NO CROSS-ORG DATA ACCESS

**Rule:** Users can NEVER query data from other organizations

**Enforcement:**

1. **Code review checklist:**

   ```markdown
   - [ ] Query filters by orgId from auth context
   - [ ] No hardcoded orgId values
   - [ ] No admin bypass without explicit permission check
   ```

2. **Automated check:**
   ```bash
   # Check for queries without orgId filter
   grep -r "prisma\." src/app/api --include='*.ts' | \
   grep -E "\.(findMany|findFirst|update|delete)" | \
   grep -v "orgId" | \
   grep -v "userId" | \
   grep -v "// SYSTEM QUERY"
   ```

**Violations:**

- Security incident
- PR immediately blocked
- Team notified

**Valid exceptions:**

- System-level operations (migrations, health checks)
  - MUST have admin auth check
  - MUST document in code comment
- Bridge operations (ClientWorkRequest)
  - MUST verify both orgs involved
  - MUST validate workspace membership

---

## 📋 PR REVIEW CHECKLIST

**Before approving ANY PR, verify:**

### ✅ If schema.prisma changed:

- [ ] RFC link in PR description
- [ ] RFC status = APPROVED
- [ ] New models have ownership (orgId, workspaceId, userId)

### ✅ If new API route added:

- [ ] Calls `auth()` if it writes data
- [ ] Returns 401 if not authenticated
- [ ] Filters data by ownership
- [ ] Has error handling (no empty catch)

### ✅ If new UI page added:

- [ ] Queries include ownership filter
- [ ] No global data queries
- [ ] Loading states implemented
- [ ] Error states implemented

### ✅ If new lib directory added:

- [ ] At least 1 import from src/app
- [ ] Purpose documented in README or code comment
- [ ] Not duplicating existing lib

### ✅ General checks:

- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] No dead delegates introduced
- [ ] Tests pass (unit + E2E)
- [ ] No silent failures (all catch blocks log)

---

## 🔒 CI/CD GATES (Future Implementation)

### Gate 1: Pre-Merge Checks

```yaml
# .github/workflows/pre-merge.yml
jobs:
  enforce-rules:
    runs-on: ubuntu-latest
    steps:
      - name: TypeScript Check
        run: npx tsc --noEmit

      - name: API Auth Audit
        run: |
          node scripts/audit-api-auth.js > audit.txt
          if grep -q "Unprotected Routes: [1-9]" audit.txt; then
            echo "ERROR: Unprotected write routes found"
            exit 1
          fi

      - name: Dead Delegate Check
        run: |
          BEFORE=$(cat baseline-dead-delegates.txt)
          AFTER=$(node scripts/find-dead-delegates.js | grep "DEAD DELEGATES" | cut -d'(' -f2 | cut -d')' -f1)
          if [ "$AFTER" -gt "$BEFORE" ]; then
            echo "ERROR: Dead delegate count increased"
            exit 1
          fi

      - name: Empty Catch Block Check
        run: |
          if grep -rE "catch.*\{\s*\}" src/app src/lib; then
            echo "ERROR: Empty catch blocks found"
            exit 1
          fi
```

### Gate 2: Post-Merge Monitoring

```yaml
# .github/workflows/post-merge.yml
jobs:
  update-baselines:
    runs-on: ubuntu-latest
    steps:
      - name: Update Dead Delegate Baseline
        run: |
          node scripts/find-dead-delegates.js | grep "DEAD DELEGATES" | \
          cut -d'(' -f2 | cut -d')' -f1 > baseline-dead-delegates.txt
          git add baseline-dead-delegates.txt
          git commit -m "chore: update dead delegate baseline"
```

---

## 📊 ENFORCEMENT METRICS

**Track these weekly:**

| Metric                   | Target | Current     |
| ------------------------ | ------ | ----------- |
| Unprotected write routes | 0      | [run audit] |
| Dead delegates           | <25    | 242         |
| TypeScript errors        | <500   | 2,942       |
| Empty catch blocks       | 0      | [run check] |
| Unused lib directories   | 0      | 26          |
| RFCs without code        | <10    | 0           |

**Dashboard:** `docs/SYSTEM_HEALTH.md` (to be created)

---

## 🆘 ENFORCEMENT FAILURES

**If rules are violated in production:**

1. **Immediate:** Revert the commit
2. **Within 24h:** Root cause analysis
3. **Within 48h:** Update enforcement checks to catch this class of error
4. **Within 1 week:** Team retrospective on why check failed

**Document in:** `docs/incidents/INCIDENT-[DATE]-[TITLE].md`

---

## 🔄 QUARTERLY REVIEW

**Every 90 days:**

1. Review all enforcement rules
2. Check if automated checks need updates
3. Add new rules for new classes of violations
4. Remove rules that are always followed (internalized)

---

**Remember:** Rules exist to protect the system. If a rule feels unnecessary, question it. If a rule is broken frequently, automate enforcement.
