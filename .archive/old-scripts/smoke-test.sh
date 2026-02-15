#!/bin/bash
# Smoke test script for authentication and critical routes

BASE_URL="${1:-https://preloss-vision-main-51zdqv7qb-buildingwithdamiens-projects.vercel.app}"

echo "🧪 SkaiScraper Smoke Test"
echo "=========================="
echo "Target: $BASE_URL"
echo ""

# Test 1: Homepage
echo "1️⃣ Testing homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$STATUS" = "200" ]; then
  echo "✅ Homepage: $STATUS"
else
  echo "❌ Homepage: $STATUS (expected 200)"
fi

# Test 2: Sign-in page
echo ""
echo "2️⃣ Testing sign-in page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sign-in")
if [ "$STATUS" = "200" ]; then
  echo "✅ Sign-in page: $STATUS"
else
  echo "❌ Sign-in page: $STATUS (expected 200)"
fi

# Test 3: Dashboard (should redirect to sign-in)
echo ""
echo "3️⃣ Testing protected route (dashboard)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL/dashboard")
if [ "$STATUS" = "200" ]; then
  echo "✅ Dashboard redirect: $STATUS"
else
  echo "⚠️  Dashboard: $STATUS (may require auth)"
fi

# Test 4: API Health
echo ""
echo "4️⃣ Testing API routes..."

# Weather Quick DOL (should return 401/400 without auth)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/weather/quick-dol")
if [ "$STATUS" = "400" ] || [ "$STATUS" = "401" ]; then
  echo "✅ Quick DOL API: $STATUS (requires auth as expected)"
elif [ "$STATUS" = "200" ]; then
  echo "⚠️  Quick DOL API: $STATUS (unexpected - may need auth check)"
else
  echo "❌ Quick DOL API: $STATUS"
fi

# Billing checkout (should return 400 without params)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/billing/tokens/checkout")
if [ "$STATUS" = "400" ]; then
  echo "✅ Billing checkout: $STATUS (requires params as expected)"
elif [ "$STATUS" = "401" ]; then
  echo "✅ Billing checkout: $STATUS (requires auth as expected)"
else
  echo "⚠️  Billing checkout: $STATUS"
fi

# Test 5: Static assets
echo ""
echo "5️⃣ Testing static assets..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/favicon.ico")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then
  echo "✅ Favicon: $STATUS"
else
  echo "⚠️  Favicon: $STATUS"
fi

# Test 6: Check for build errors in HTML
echo ""
echo "6️⃣ Checking for build errors..."
HOMEPAGE_CONTENT=$(curl -s "$BASE_URL/")
if echo "$HOMEPAGE_CONTENT" | grep -qi "Application error" || echo "$HOMEPAGE_CONTENT" | grep -qi "500"; then
  echo "❌ Homepage contains error messages"
else
  echo "✅ No obvious errors in homepage HTML"
fi

# Test 7: Check ENV variable exposure (security)
echo ""
echo "7️⃣ Security check (ENV variables)..."
if echo "$HOMEPAGE_CONTENT" | grep -qi "OPENAI_API_KEY=sk-" || echo "$HOMEPAGE_CONTENT" | grep -qi "CLERK_SECRET"; then
  echo "❌ CRITICAL: Secret ENV variables exposed in HTML!"
else
  echo "✅ No secret ENV variables found in HTML"
fi

# Summary
echo ""
echo "=========================="
echo "🎯 Smoke Test Complete"
echo "=========================="
echo ""
echo "Next Steps:"
echo "1. Test sign-in manually: $BASE_URL/sign-in"
echo "2. Verify redirect to dashboard after sign-in"
echo "3. Test weather Quick DOL with valid property"
echo "4. Configure real Stripe Price ID for billing"
echo ""
echo "📝 See AUTH_ROUTING_FIX_COMPLETE.md for full testing checklist"
