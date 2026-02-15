-- ============================================================================
-- TOKEN SYSTEM VERIFICATION QUERIES
-- ============================================================================
-- Run these against your database to verify the token system is working
-- ============================================================================

-- 1. ENSURE CUSTOMER ROW EXISTS & MAPPED
-- ============================================================================
-- Find user by Stripe customer ID
SELECT 
  id, 
  stripe_customer_id, 
  email, 
  created_at
FROM users
WHERE stripe_customer_id = 'cus_REPLACE_WITH_ACTUAL_ID'
LIMIT 1;

-- Find all users with Stripe customers
SELECT 
  id, 
  stripe_customer_id, 
  email, 
  created_at
FROM users
WHERE stripe_customer_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;


-- 2. VERIFY USAGE TOKEN LEDGER
-- ============================================================================
-- Check token status for a specific user
SELECT 
  user_id,
  mockup_remaining,
  dol_remaining,
  weather_remaining,
  last_reset_at,
  updated_at,
  created_at
FROM usage_tokens
WHERE user_id = 'REPLACE_WITH_USER_UUID'::uuid;

-- Show all users with tokens
SELECT 
  ut.user_id,
  u.email,
  ut.mockup_remaining,
  ut.dol_remaining,
  ut.weather_remaining,
  ut.last_reset_at
FROM usage_tokens ut
JOIN users u ON ut.user_id = u.id
ORDER BY ut.updated_at DESC
LIMIT 20;


-- 3. RECENT WEBHOOK EVENTS (if idempotency table exists)
-- ============================================================================
SELECT 
  event_id,
  event_type,
  processed_at,
  metadata
FROM webhook_events
ORDER BY processed_at DESC
LIMIT 50;

-- Count events by type
SELECT 
  event_type,
  COUNT(*) as count,
  MAX(processed_at) as last_processed
FROM webhook_events
GROUP BY event_type
ORDER BY count DESC;


-- 4. AUDIT TRAIL: Token Changes
-- ============================================================================
-- Show token activity (requires updated_at timestamp)
SELECT 
  ut.user_id,
  u.email,
  ut.mockup_remaining,
  ut.dol_remaining,
  ut.weather_remaining,
  ut.updated_at,
  ut.last_reset_at
FROM usage_tokens ut
JOIN users u ON ut.user_id = u.id
WHERE ut.updated_at > NOW() - INTERVAL '7 days'
ORDER BY ut.updated_at DESC;


-- 5. HEALTH CHECK: Find Issues
-- ============================================================================
-- Users with Stripe customer but no tokens
SELECT 
  u.id,
  u.email,
  u.stripe_customer_id,
  u.created_at
FROM users u
LEFT JOIN usage_tokens ut ON u.id = ut.user_id
WHERE u.stripe_customer_id IS NOT NULL
  AND ut.user_id IS NULL;

-- Users with tokens but no Stripe customer (should be none)
SELECT 
  ut.user_id,
  u.email,
  u.stripe_customer_id
FROM usage_tokens ut
JOIN users u ON ut.user_id = u.id
WHERE u.stripe_customer_id IS NULL;

-- Token balances that look suspicious (negative, extremely high)
SELECT 
  ut.user_id,
  u.email,
  ut.mockup_remaining,
  ut.dol_remaining,
  ut.weather_remaining
FROM usage_tokens ut
JOIN users u ON ut.user_id = u.id
WHERE ut.mockup_remaining < 0 
   OR ut.dol_remaining < 0 
   OR ut.weather_remaining < 0
   OR ut.mockup_remaining > 1000
   OR ut.dol_remaining > 1000
   OR ut.weather_remaining > 1000;


-- 6. CLEANUP & MAINTENANCE
-- ============================================================================
-- Reset tokens for a specific user (manual intervention)
-- UPDATE usage_tokens
-- SET mockup_remaining = 10,
--     dol_remaining = 10,
--     weather_remaining = 7,
--     last_reset_at = NOW()
-- WHERE user_id = 'REPLACE_WITH_USER_UUID'::uuid;

-- Grant bonus tokens to a user
-- UPDATE usage_tokens
-- SET mockup_remaining = mockup_remaining + 100,
--     dol_remaining = dol_remaining + 100,
--     weather_remaining = weather_remaining + 100
-- WHERE user_id = 'REPLACE_WITH_USER_UUID'::uuid;
