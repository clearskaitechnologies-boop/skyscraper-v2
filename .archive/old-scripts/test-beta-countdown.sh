#!/bin/bash

# 🧪 Beta Countdown System Test Script
# Run this script to validate the beta countdown system is working correctly

echo "🎯 Beta Countdown System Validation Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="${BASE_URL:-https://skaiscrape.com}"
if [[ "$BASE_URL" == "https://skaiscrape.com" ]]; then
    echo "🌐 Testing against PRODUCTION: $BASE_URL"
    echo "⚠️  Make sure NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT is set to a future date!"
else
    echo "🏠 Testing against: $BASE_URL"
fi
echo ""

# Function to check HTTP status
check_status() {
    local url=$1
    local expected=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "$expected" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $status, expected $expected)"
        return 1
    fi
}

# Function to check if text exists in response
check_text() {
    local url=$1
    local text=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$text"; then
        echo -e "${GREEN}✅ PASS${NC} (Text found)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Text not found)"
        echo "  Expected to find: '$text'"
        return 1
    fi
}

# Test 1: Homepage loads and shows beta banner
echo -e "${BLUE}Test 1: Homepage Beta Banner${NC}"
check_status "$BASE_URL" "200" "Homepage loads"
check_text "$BASE_URL" "Beta Notice" "Beta banner appears on homepage"
echo ""

# Test 2: Pricing page shows countdown chips
echo -e "${BLUE}Test 2: Pricing Page Countdown${NC}"
check_status "$BASE_URL/pricing" "200" "Pricing page loads"
check_text "$BASE_URL/pricing" "Subscriptions open in" "Countdown chip appears on pricing"
check_text "$BASE_URL/pricing" "Create a free account and leave feedback" "Support microcopy appears"
echo ""

# Test 3: Admin panel loads (if accessible)
echo -e "${BLUE}Test 3: Admin Dashboard${NC}"
admin_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin")
if [ "$admin_status" = "200" ]; then
    echo -e "${GREEN}✅ Admin panel accessible${NC}"
    check_text "$BASE_URL/admin" "Launch Status Dashboard" "Admin dashboard loads properly"
elif [ "$admin_status" = "401" ] || [ "$admin_status" = "403" ]; then
    echo -e "${YELLOW}⚠️  Admin panel requires authentication (HTTP $admin_status)${NC}"
else
    echo -e "${RED}❌ Admin panel error (HTTP $admin_status)${NC}"
fi
echo ""

# Test 4: API endpoints return expected responses
echo -e "${BLUE}Test 4: API Endpoints${NC}"
check_status "$BASE_URL/api/health" "200" "Health check endpoint"

# Test feedback API (without actually submitting)
echo -n "Testing: Feedback API structure... "
feedback_response=$(curl -s -X POST "$BASE_URL/api/feedback" \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}' 2>/dev/null)

if echo "$feedback_response" | grep -q "error"; then
    echo -e "${GREEN}✅ PASS${NC} (API responds with validation)"
else
    echo -e "${YELLOW}⚠️  Unexpected response${NC}"
fi
echo ""

# Test 5: Environment variable check
echo -e "${BLUE}Test 5: Environment Configuration${NC}"
echo -n "Checking launch time configuration... "

# Check if we can get the countdown info from the frontend
countdown_check=$(curl -s "$BASE_URL/pricing" | grep -o "Subscriptions open in [^<]*" | head -1)

if [ -n "$countdown_check" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  Found: $countdown_check"
else
    echo -e "${YELLOW}⚠️  Could not detect countdown${NC}"
    echo "  This might mean subscriptions are already open or env var is not set"
fi
echo ""

# Test 6: Checkout blocking (requires manual verification)
echo -e "${BLUE}Test 6: Manual Verification Required${NC}"
echo "🔍 Please manually verify the following:"
echo "   1. Go to $BASE_URL/pricing in incognito mode"
echo "   2. Try clicking 'Subscribe' on any plan"
echo "   3. Should be blocked with helpful message"
echo "   4. Try signing up for free account"
echo "   5. Submit feedback and check for token bonus"
echo ""

# Summary
echo -e "${BLUE}📋 Test Summary${NC}"
echo "=================================="
echo "✅ Automated tests completed"
echo "⚠️  Manual verification steps provided above"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review any failed tests above"
echo "2. Complete manual verification"
echo "3. Check admin panel at $BASE_URL/admin"
echo "4. Monitor logs for blocked checkout attempts"
echo ""
echo -e "${GREEN}🚀 Ready for launch when countdown reaches zero!${NC}"
