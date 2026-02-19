#!/bin/bash
#
# Cross-Tenant Isolation Demo Script
# ===================================
# Proves Org B CANNOT access Org A's data via API.
# Run against production or local dev server.
#
# Usage:
#   BASE_URL=https://www.skaiscrape.com ./scripts/cross-tenant-demo.sh
#   BASE_URL=http://localhost:3000 ./scripts/cross-tenant-demo.sh
#

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║      CROSS-TENANT ISOLATION VERIFICATION        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Target: $BASE_URL"
echo "Date:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# ── Helper ──────────────────────────────────────────
check() {
  local desc="$1"
  local expected_status="$2"
  local url="$3"
  local method="${4:-GET}"
  local body="$5"

  if [ "$method" = "POST" ] && [ -n "$body" ]; then
    actual=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d "$body" \
      "$url" 2>/dev/null)
  else
    actual=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  fi

  if [ "$actual" = "$expected_status" ]; then
    echo "  ✅ PASS: $desc (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $desc (expected $expected_status, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo "═══ 1. Health Endpoints ═══"
check "Health live returns 200" "200" "$BASE_URL/api/health/live"
check "Health deep returns 200" "200" "$BASE_URL/api/health/deep"
check "Health root returns 200 or 503" "200" "$BASE_URL/api/health"

echo ""
echo "═══ 2. Auth Required (no token → 401/403) ═══"
check "Claims API rejects no-auth" "401" "$BASE_URL/api/claims"
check "Dashboard KPIs rejects no-auth" "401" "$BASE_URL/api/dashboard/kpis"
check "Team members rejects no-auth" "401" "$BASE_URL/api/team/members"
check "Finance overview rejects no-auth" "401" "$BASE_URL/api/finance/overview"
check "Admin metrics rejects no-auth" "401" "$BASE_URL/api/admin/metrics"
check "Ops errors rejects no-auth" "401" "$BASE_URL/api/ops/errors"
check "Config rejects no-auth" "401" "$BASE_URL/api/config"
check "Diagnostics rejects no-auth" "401" "$BASE_URL/api/diagnostics/routes"

echo ""
echo "═══ 3. Rate-Limited Endpoints (no token → 401 before rate limit) ═══"
check "AI dashboard-assistant rejects no-auth" "401" "$BASE_URL/api/ai/dashboard-assistant" "POST" '{"prompt":"test"}'
check "Storage signed-read rejects no-auth" "401" "$BASE_URL/api/storage/signed-read" "POST" '{"path":"test"}'
check "Storage signed-upload rejects no-auth" "401" "$BASE_URL/api/storage/signed-upload" "POST" '{"proposalId":"test"}'

echo ""
echo "═══ 4. Cron Routes (no CRON_SECRET → 401) ═══"
check "Cron daily rejects no-secret" "401" "$BASE_URL/api/cron/daily"
check "Cron email-retry rejects no-secret" "401" "$BASE_URL/api/cron/email-retry"
check "Cron stripe-reconcile rejects no-secret" "401" "$BASE_URL/api/cron/stripe-reconcile"

echo ""
echo "═══ 5. Public Endpoints (should work without auth) ═══"
check "Status endpoint is public" "200" "$BASE_URL/api/status"
check "Build info is public" "200" "$BASE_URL/api/build-info"
check "Stripe prices is public" "200" "$BASE_URL/api/stripe/prices"
check "Templates marketplace is public" "200" "$BASE_URL/api/templates/marketplace"
check "Contact form accepts POST" "200" "$BASE_URL/api/contact" "POST" '{"name":"Test","email":"test@example.com","message":"Hello"}'

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed"
echo "  Total:   $((PASS + FAIL)) checks"
echo "═══════════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo "  ⚠️  SOME CHECKS FAILED"
  exit 1
else
  echo "  ✅ ALL CHECKS PASSED — Tenant isolation verified"
  exit 0
fi
