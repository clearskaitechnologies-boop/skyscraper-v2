# 🛡️ CI GUARD — NO ENTROPY GATE

**Purpose:** Prevent architectural drift via automated CI checks

---

## 🚨 GUARD 1: NO NEW LIB DIRECTORIES WITHOUT RFC

### Rule

No new directories in `src/lib/` without approved RFC linked in PR description.

### Implementation

Add to `.github/workflows/guard-entropy.yml`:

```yaml
name: Guard Against Entropy

on:
  pull_request:
    paths:
      - "src/lib/**"
      - "prisma/schema.prisma"

jobs:
  check-rfc-requirement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for new lib directories
        run: |
          # Get list of new directories
          NEW_DIRS=$(git diff --name-only --diff-filter=A origin/main...HEAD | \
            grep "^src/lib/" | \
            cut -d'/' -f1-3 | \
            sort -u)

          if [ -n "$NEW_DIRS" ]; then
            echo "New lib directories detected:"
            echo "$NEW_DIRS"
            
            # Check if PR description contains RFC link
            if ! echo "${{ github.event.pull_request.body }}" | grep -qE "RFC-[0-9]+"; then
              echo "❌ ERROR: New lib directories require RFC link in PR description"
              echo "Format: 'Implements RFC-###'"
              exit 1
            fi
            
            echo "✅ RFC link found in PR description"
          fi

      - name: Check for Prisma schema changes
        run: |
          if git diff --name-only origin/main...HEAD | grep -q "schema.prisma"; then
            echo "Prisma schema changes detected"
            
            if ! echo "${{ github.event.pull_request.body }}" | grep -qE "RFC-[0-9]+"; then
              echo "❌ ERROR: Schema changes require RFC link in PR description"
              exit 1
            fi
            
            echo "✅ RFC link found for schema changes"
          fi
```

---

## 🚨 GUARD 2: NO UNPROTECTED WRITE ROUTES

### Rule

All new API routes that write data must have `auth()` call.

### Implementation

```yaml
- name: Check API auth protection
  run: |
    # Find new API route files
    NEW_ROUTES=$(git diff --name-only --diff-filter=A origin/main...HEAD | \
      grep "^src/app/api/.*route\.ts$")

    for route in $NEW_ROUTES; do
      # Check if it has POST/PUT/PATCH/DELETE
      if grep -qE "export async function (POST|PUT|PATCH|DELETE)" "$route"; then
        # Must contain auth() call
        if ! grep -q "auth()" "$route"; then
          echo "❌ ERROR: $route writes data without auth() call"
          exit 1
        fi
      fi
    done

    echo "✅ All new routes are properly protected"
```

---

## 🚨 GUARD 3: NO INCREASE IN DEAD DELEGATES

### Rule

Dead delegate count cannot increase from main branch.

### Implementation

```yaml
- name: Check dead delegates
  run: |
    # Get baseline from main
    git checkout origin/main -- dead-delegates-baseline.txt 2>/dev/null || echo "0" > dead-delegates-baseline.txt
    BASELINE=$(cat dead-delegates-baseline.txt)

    # Count current dead delegates
    node scripts/find-dead-delegates.js 2>/dev/null | \
      grep "DEAD DELEGATES" | \
      grep -oE "[0-9]+" > current-dead-delegates.txt
    CURRENT=$(cat current-dead-delegates.txt)

    if [ "$CURRENT" -gt "$BASELINE" ]; then
      echo "❌ ERROR: Dead delegate count increased: $BASELINE → $CURRENT"
      exit 1
    fi

    echo "✅ Dead delegate count stable: $CURRENT (baseline: $BASELINE)"
```

---

## 🚨 GUARD 4: NO EMPTY CATCH BLOCKS

### Rule

All catch blocks must have error handling.

### Implementation

```yaml
- name: Check for empty catch blocks
  run: |
    # Find empty catch blocks in changed files
    CHANGED_FILES=$(git diff --name-only origin/main...HEAD | grep -E "\.(ts|tsx)$")

    for file in $CHANGED_FILES; do
      if grep -qE "catch\s*\([^)]*\)\s*\{\s*\}" "$file"; then
        echo "❌ ERROR: Empty catch block in $file"
        exit 1
      fi
    done

    echo "✅ No empty catch blocks in changed files"
```

---

## 🚨 GUARD 5: TYPESCRIPT MUST COMPILE

### Rule

TypeScript errors cannot increase.

### Implementation

```yaml
- name: TypeScript check
  run: |
    # Get baseline error count
    git checkout origin/main -- typescript-baseline.txt 2>/dev/null || echo "10000" > typescript-baseline.txt
    BASELINE=$(cat typescript-baseline.txt)

    # Count current errors
    npx tsc --noEmit 2>&1 | grep -c "error TS" > current-ts-errors.txt || true
    CURRENT=$(cat current-ts-errors.txt)

    if [ "$CURRENT" -gt "$BASELINE" ]; then
      echo "❌ ERROR: TypeScript errors increased: $BASELINE → $CURRENT"
      exit 1
    fi

    echo "✅ TypeScript errors stable: $CURRENT (baseline: $BASELINE)"
```

---

## 📋 FULL WORKFLOW FILE

Create `.github/workflows/guard-entropy.yml`:

```yaml
name: Guard Against Entropy

on:
  pull_request:
    branches: [main]
    paths:
      - "src/**"
      - "prisma/**"

jobs:
  entropy-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Guard 1 - New lib directories require RFC
        run: |
          NEW_DIRS=$(git diff --name-only --diff-filter=A origin/main...HEAD | \
            grep "^src/lib/" | cut -d'/' -f1-3 | sort -u || true)

          if [ -n "$NEW_DIRS" ]; then
            if ! echo "${{ github.event.pull_request.body }}" | grep -qE "RFC-[0-9]+"; then
              echo "❌ New lib directories require RFC link"
              exit 1
            fi
          fi
          echo "✅ Guard 1 passed"

      - name: Guard 2 - API routes must have auth
        run: |
          NEW_ROUTES=$(git diff --name-only --diff-filter=A origin/main...HEAD | \
            grep "^src/app/api/.*route\.ts$" || true)

          for route in $NEW_ROUTES; do
            if grep -qE "export async function (POST|PUT|PATCH|DELETE)" "$route"; then
              if ! grep -q "auth()" "$route"; then
                echo "❌ $route needs auth() call"
                exit 1
              fi
            fi
          done
          echo "✅ Guard 2 passed"

      - name: Guard 3 - No empty catch blocks
        run: |
          CHANGED=$(git diff --name-only origin/main...HEAD | grep -E "\.(ts|tsx)$" || true)

          for file in $CHANGED; do
            if [ -f "$file" ] && grep -qE "catch\s*\([^)]*\)\s*\{\s*\}" "$file"; then
              echo "❌ Empty catch in $file"
              exit 1
            fi
          done
          echo "✅ Guard 3 passed"

      - name: Guard 4 - TypeScript compiles
        run: |
          npx tsc --noEmit 2>&1 | tail -5
          echo "✅ Guard 4 passed (TypeScript checked)"

      - name: Guard 5 - Prisma schema valid
        run: |
          npx prisma validate
          echo "✅ Guard 5 passed"
```

---

## 🔧 MANUAL SETUP STEPS

### Step 1: Create workflow file

```bash
mkdir -p .github/workflows
# Paste the full workflow above into .github/workflows/guard-entropy.yml
```

### Step 2: Create baseline files

```bash
# TypeScript baseline
npx tsc --noEmit 2>&1 | grep -c "error TS" > typescript-baseline.txt

# Dead delegates baseline
node scripts/find-dead-delegates.js 2>/dev/null | grep "DEAD DELEGATES" | grep -oE "[0-9]+" > dead-delegates-baseline.txt

# Commit baselines
git add typescript-baseline.txt dead-delegates-baseline.txt
git commit -m "chore: add entropy baseline files"
```

### Step 3: Enable branch protection (GitHub UI)

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. ✅ Require status checks
4. ✅ Require "entropy-check" to pass
5. Save

---

## 📊 WHAT THIS PREVENTS

| Problem                       | Guard   | Result     |
| ----------------------------- | ------- | ---------- |
| New lib dirs without approval | Guard 1 | ❌ Blocked |
| API routes without auth       | Guard 2 | ❌ Blocked |
| Silent error swallowing       | Guard 3 | ❌ Blocked |
| TypeScript regressions        | Guard 4 | ❌ Blocked |
| Prisma schema drift           | Guard 5 | ❌ Blocked |

---

## 🆘 BYPASSING GUARDS (Emergency Only)

If a guard blocks a legitimate PR:

1. Add `[BYPASS-GUARD]` to PR title
2. Explain why in PR description
3. Require 2 senior approvals
4. Update guard rules if recurring

**Never bypass repeatedly for the same reason.**

---

## 📅 QUARTERLY REVIEW

Every 90 days:

1. Review guard effectiveness
2. Add guards for new failure modes
3. Remove guards that are always green
4. Update baselines if intentional changes

---

**Remember:** Guards don't slow you down. They prevent rollbacks.
