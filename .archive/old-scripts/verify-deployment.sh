#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          VERIFYING PRODUCTION DEPLOYMENT                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣  Health Check..."
curl -I https://skaiscrape.com/api/health/live 2>&1 | head -5
echo ""

echo "2️⃣  Auth Headers Check..."
curl -I https://skaiscrape.com 2>&1 | grep -i clerk || echo "✅ No clerk auth errors"
echo ""

echo "3️⃣  Checking Clerk Environment Variables..."
echo "Visit: https://skaiscrape.com/clerk-check"
echo "You should see:"
echo "  ✅ Publishable: pk_live_..."
echo "  ✅ Secret: sk_live_..."
echo ""

echo "4️⃣  Sign-In Test..."
echo "Visit: https://skaiscrape.com/sign-in"
echo "Expected flow:"
echo "  → Sign in with credentials"
echo "  → Redirect to /after-sign-in"
echo "  → Then redirect to /dashboard"
echo ""

echo "5️⃣  Debug Page (if needed)..."
echo "Visit: https://skaiscrape.com/clerk-debug"
echo "Should show:"
echo "  Valid: ✅ YES"
echo "  Clerk Loaded: ✅ YES"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "If all checks pass, Phase 1A is LIVE! 🎉"
echo "═══════════════════════════════════════════════════════════"
