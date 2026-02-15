#!/bin/bash
# Production Verification Script - Run after hard refresh
# Nov 3, 2025

echo "🔍 PRODUCTION VERIFICATION SCRIPT"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="https://skaiscrape.com"

echo "Testing: $DOMAIN"
echo ""

# Test 1: Health Check
echo "1️⃣  Health Endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/health/live)
if [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓${NC} Health check: 200 OK"
else
  echo -e "${RED}✗${NC} Health check failed: $STATUS"
fi

# Test 2: Clerk Headers
echo ""
echo "2️⃣  Clerk Authentication Headers..."
CLERK_STATUS=$(curl -sI $DOMAIN/api/health/live | grep -i "x-clerk-auth-status" | cut -d: -f2 | tr -d ' \r')
if [ "$CLERK_STATUS" = "signed-out" ]; then
  echo -e "${GREEN}✓${NC} Clerk headers present: $CLERK_STATUS"
else
  echo -e "${YELLOW}⚠${NC}  Unexpected Clerk status: $CLERK_STATUS"
fi

# Test 3: Environment Variables
echo ""
echo "3️⃣  Environment Configuration..."
ENV_CHECK=$(curl -s $DOMAIN/api/health/env)
APP_URL=$(echo $ENV_CHECK | grep -o '"appUrl":"[^"]*"' | cut -d'"' -f4 | tr -d '\n')
CLERK_PUB=$(echo $ENV_CHECK | grep -o '"clerkPublishable":[^,]*' | cut -d: -f2)
CLERK_SEC=$(echo $ENV_CHECK | grep -o '"clerkSecret":[^,]*' | cut -d: -f2)
NODE_ENV=$(echo $ENV_CHECK | grep -o '"nodeEnv":"[^"]*"' | cut -d'"' -f4)

echo "   App URL: $APP_URL"
if [ "$CLERK_PUB" = "true" ]; then
  echo -e "   Clerk Publishable: ${GREEN}✓ true${NC}"
else
  echo -e "   Clerk Publishable: ${RED}✗ false${NC}"
fi

if [ "$CLERK_SEC" = "true" ]; then
  echo -e "   Clerk Secret: ${GREEN}✓ true${NC}"
else
  echo -e "   Clerk Secret: ${RED}✗ false${NC}"
fi

echo "   Node Environment: $NODE_ENV"

# Test 4: No Dev Browser References
echo ""
echo "4️⃣  Checking for dev-browser references..."
DEV_REFS=$(curl -s $DOMAIN/sign-in | grep -c "dev-browser" || echo "0")
if [ "$DEV_REFS" -eq 0 ]; then
  echo -e "${GREEN}✓${NC} No dev-browser references (production mode)"
else
  echo -e "${RED}✗${NC} Found $DEV_REFS dev-browser references (still in dev mode?)"
fi

# Test 5: Sign-in page loads
echo ""
echo "5️⃣  Sign-in page..."
SIGNIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/sign-in)
if [ "$SIGNIN_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓${NC} Sign-in page: 200 OK"
else
  echo -e "${RED}✗${NC} Sign-in page failed: $SIGNIN_STATUS"
fi

# Test 6: Pricing page loads
echo ""
echo "6️⃣  Pricing page..."
PRICING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/pricing)
if [ "$PRICING_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓${NC} Pricing page: 200 OK"
else
  echo -e "${RED}✗${NC} Pricing page failed: $PRICING_STATUS"
fi

# Summary
echo ""
echo "=================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================="
echo ""
echo "If all checks passed:"
echo "  1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)"
echo "  2. Try incognito mode"
echo "  3. Sign in and test dashboard"
echo ""
echo "Expected UX:"
echo "  ✓ Single chat widget (bottom-right)"
echo "  ✓ Header doesn't overlap content"
echo "  ✓ Dashboard sections clearly labeled"
echo "  ✓ Branding banner (dismissible if incomplete)"
echo ""
echo "Deployment: https://vercel.com/buildingwithdamiens-projects/preloss-vision-main"
echo "Live Site: $DOMAIN"
echo ""
