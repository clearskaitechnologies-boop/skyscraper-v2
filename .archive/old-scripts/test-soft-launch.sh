#!/bin/bash

# 🎉 Soft Launch 3-Day Trial System Test Script
# Test all aspects of the trial functionality

echo "🎉 SkaiScraper™ Soft Launch Trial System Test"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="${BASE_URL:-https://skaiscrape.com}"
echo "🌐 Testing against: $BASE_URL"
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

# Test 1: Soft Launch Banner
echo -e "${BLUE}Test 1: Soft Launch Banner${NC}"
check_status "$BASE_URL" "200" "Homepage loads"
check_text "$BASE_URL" "Soft Launch Live" "Soft launch banner appears"
check_text "$BASE_URL" "3-day free trial event" "Trial messaging in banner"
echo ""

# Test 2: Pricing Page Trial Messaging
echo -e "${BLUE}Test 2: Pricing Page Trial Features${NC}"
check_status "$BASE_URL/pricing" "200" "Pricing page loads"
check_text "$BASE_URL/pricing" "3-day free trial" "Trial message on pricing page"
check_text "$BASE_URL/pricing" "no charge until November 4th" "Trial terms clearly stated"
check_text "$BASE_URL/pricing" "Celebrate our Beta Soft Launch" "Soft launch messaging present"
echo ""

# Test 3: Subscription Chip Updates
echo -e "${BLUE}Test 3: Subscription Status Chips${NC}"
pricing_response=$(curl -s "$BASE_URL/pricing")
if echo "$pricing_response" | grep -q "Subscriptions: Now Open\|Subscriptions open in"; then
    echo -e "${GREEN}✅ Subscription status chips working${NC}"
else
    echo -e "${YELLOW}⚠️  Subscription chips not detected${NC}"
fi
echo ""

# Test 4: API Endpoints
echo -e "${BLUE}Test 4: New API Endpoints${NC}"
check_status "$BASE_URL/api/verify-session" "401" "Session verification requires auth"
check_status "$BASE_URL/api/admin/launch-status" "401" "Admin launch status requires auth"
echo ""

# Test 5: Success Page
echo -e "${BLUE}Test 5: Success Page${NC}"
check_status "$BASE_URL/success" "200" "Success page loads"
check_text "$BASE_URL/success" "3-day free trial has started" "Trial confirmation messaging"
check_text "$BASE_URL/success" "November 4th" "Trial end date mentioned"
echo ""

# Test 6: Analytics Library
echo -e "${BLUE}Test 6: Analytics Integration${NC}"
echo -n "Testing: Analytics library exists... "
if [ -f "/Users/admin/Downloads/preloss-vision-main/src/lib/analytics.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC} (File exists)"
else
    echo -e "${RED}❌ FAIL${NC} (Analytics library missing)"
fi
echo ""

# Test 7: Stripe Configuration Check
echo -e "${BLUE}Test 7: Stripe Integration Points${NC}"
echo "🔍 Manual verification needed for Stripe:"
echo "   1. Checkout sessions include trial_period_days: 3"
echo "   2. Webhook handles customer.subscription.trial_will_end"
echo "   3. Success URL redirects to /success?session_id={CHECKOUT_SESSION_ID}"
echo ""

# Test 8: Webhook Events
echo -e "${BLUE}Test 8: Webhook Event Handling${NC}"
echo -n "Testing: Webhook route exists... "
if curl -s "$BASE_URL/api/stripe/webhook" | grep -q "Method Not Allowed\|405"; then
    echo -e "${GREEN}✅ PASS${NC} (Webhook endpoint exists)"
else
    echo -e "${YELLOW}⚠️  Webhook endpoint response unclear${NC}"
fi
echo ""

# Test 9: GA4 Integration Check
echo -e "${BLUE}Test 9: GA4 Event Tracking${NC}"
echo "📊 GA4 Events to verify manually:"
echo "   • trial_start (when checkout initiated)"
echo "   • trial_end (from webhook)"
echo "   • begin_checkout (when checkout starts)"
echo "   • purchase (when subscription completes)"
echo ""

# Test 10: Complete User Flow Test
echo -e "${BLUE}Test 10: Complete User Flow (Manual)${NC}"
echo "🧪 Manual test steps:"
echo ""
echo "1. Visit $BASE_URL/pricing in incognito"
echo "2. Click 'Subscribe' on any plan"
echo "3. Complete checkout with test card: 4242 4242 4242 4242"
echo "4. Verify Stripe shows 'Your trial will end Nov 4'"
echo "5. Complete checkout → redirected to /success"
echo "6. Check Stripe Dashboard → Customer → Subscription status = 'trialing'"
echo "7. Wait 3 days → automatic charge (or cancel before)"
echo ""

# Test 11: Environment Check
echo -e "${BLUE}Test 11: Environment Configuration${NC}"
echo "🔧 Environment variables to verify:"
echo "   • NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT (should be past date for soft launch)"
echo "   • STRIPE_SECRET_KEY (for trial creation)"
echo "   • STRIPE_WEBHOOK_SECRET (for trial_will_end events)"
echo ""

# Test 12: Billing Flow Check
echo -e "${BLUE}Test 12: Billing Integration${NC}"
echo -n "Testing: Billing page loads... "
billing_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/billing")
if [ "$billing_status" = "200" ] || [ "$billing_status" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Billing page accessible)"
else
    echo -e "${RED}❌ FAIL${NC} (HTTP $billing_status)"
fi
echo ""

# Summary and Next Steps
echo -e "${BLUE}📋 Test Summary${NC}"
echo "=================================="
echo "✅ Automated tests completed"
echo "⚠️  Manual verification required for:"
echo "   • Stripe checkout trial functionality"
echo "   • GA4 event tracking"
echo "   • Complete user journey"
echo "   • Webhook trial_will_end processing"
echo ""

echo -e "${YELLOW}🚀 Soft Launch Readiness Checklist:${NC}"
echo "□ Trial messaging appears correctly"
echo "□ Stripe checkout shows 3-day trial"
echo "□ Success page confirms trial start"
echo "□ Analytics events fire properly"
echo "□ Webhook handles trial end"
echo "□ No charges until Nov 4th"
echo ""

echo -e "${GREEN}🎉 Ready for Nov 1st Soft Launch!${NC}"
echo ""
echo "💡 Pro tips:"
echo "• Test with real card numbers in test mode"
echo "• Monitor Stripe webhook logs"
echo "• Check GA4 real-time events"
echo "• Have support ready for trial questions"
