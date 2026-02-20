#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# SkaiScraper Pro — Titan Demo Smoke Script
# Run: chmod +x scripts/titan-demo-smoke.sh && ./scripts/titan-demo-smoke.sh
#
# Prerequisites:
#   - Dev server running (pnpm dev)
#   - Logged in as Pro Admin in browser
#   - Manager hierarchy migration applied
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASS=0; FAIL=0; SKIP=0

green()  { printf "\033[32m✅ %s\033[0m\n" "$1"; }
red()    { printf "\033[31m❌ %s\033[0m\n" "$1"; }
yellow() { printf "\033[33m⚠️  %s\033[0m\n" "$1"; }
header() { printf "\n\033[1;36m━━━ %s ━━━\033[0m\n" "$1"; }

check() {
  local label="$1" expected="$2" url="$3"
  local status
  status=$(curl -sS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [[ "$status" == "$expected" ]]; then
    green "$label → $status"; ((PASS++))
  else
    red  "$label → $status (expected $expected)"; ((FAIL++))
  fi
}

# ─── 1. Health Checks ──────────────────────────────────────────────────
header "1. HEALTH CHECKS"
check "Health live"   "200" "$BASE_URL/api/health/live"
check "Health deep"   "200" "$BASE_URL/api/health/deep"
check "Health root"   "200" "$BASE_URL/api/health"

# ─── 2. Public Routes (should return 200 or redirect) ──────────────────
header "2. PUBLIC ROUTES"
check "Landing page"       "200" "$BASE_URL/"
check "Sign-in page"       "200" "$BASE_URL/sign-in"
check "Client sign-in"     "200" "$BASE_URL/client/sign-in"
check "Pricing page"       "200" "$BASE_URL/pricing"

# ─── 3. Auth-Guarded Routes (should redirect 307 when not logged in) ──
header "3. AUTH GUARDS (expect 307 redirects)"
check "Dashboard (no auth)"    "307" "$BASE_URL/dashboard"
check "Claims (no auth)"      "307" "$BASE_URL/claims"
check "Portal (no auth)"      "307" "$BASE_URL/portal"
check "Teams (no auth)"       "307" "$BASE_URL/teams"

# ─── 4. API Routes (require auth → 401 without) ───────────────────────
header "4. API AUTH GUARDS (expect 401)"
check "Claims API (no auth)"       "401" "$BASE_URL/api/claims"
check "Company API (no auth)"      "401" "$BASE_URL/api/trades/company"
check "Leaderboard API (no auth)"  "401" "$BASE_URL/api/finance/leaderboard"

# ─── 5. Deleted Features (should 404) ──────────────────────────────────
header "5. DELETED FEATURES (expect 404)"
check "Batch proposals (deleted)"    "404" "$BASE_URL/batch-proposals"
check "Community feed (deleted)"     "404" "$BASE_URL/portal/community/feed"
check "Batch reports API (deleted)"  "404" "$BASE_URL/api/batch-proposals"
check "Community maps (deleted)"     "404" "$BASE_URL/maps/communities/new"

# ─── 6. Sentry Test (dev only) ─────────────────────────────────────────
header "6. SENTRY VERIFICATION"
if [[ "$BASE_URL" != *"skaiscrape.com"* ]]; then
  check "Sentry test endpoint"  "307" "$BASE_URL/api/dev/sentry-test"
  yellow "Sentry test requires auth — test manually in browser: $BASE_URL/api/dev/sentry-test"
else
  yellow "Skipping Sentry test in production"
  ((SKIP++))
fi

# ─── Summary ───────────────────────────────────────────────────────────
header "RESULTS"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Skipped: $SKIP"
echo ""

if [[ $FAIL -gt 0 ]]; then
  red "Some checks failed — review above"
  exit 1
else
  green "All checks passed!"
fi
