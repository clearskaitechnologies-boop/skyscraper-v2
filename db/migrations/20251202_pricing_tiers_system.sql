-- ============================================================================
-- H-7: Pricing Tier System Backend
-- ============================================================================
-- 
-- Creates pricing tiers and usage tracking for commercial launch
-- 
-- Tiers:
--   - STARTER: 10 claims/month, 100 AI credits, 5GB storage
--   - PROFESSIONAL: 50 claims/month, 500 AI credits, 25GB storage
--   - ENTERPRISE: Unlimited claims, unlimited AI, unlimited storage
-- 
-- Usage tracking:
--   - Claims created counter
--   - AI generations counter
--   - Storage used (bytes)
--   - Monthly reset mechanism
-- 
-- ============================================================================

-- Add tier column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'STARTER' CHECK (tier IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE'));

-- Add usage tracking columns
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS claims_used_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_credits_used_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_bytes_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_period_start TIMESTAMP DEFAULT NOW();

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price_monthly_cents INT NOT NULL,
  price_yearly_cents INT NOT NULL,
  
  -- Limits
  claims_per_month INT NOT NULL,
  ai_credits_per_month INT NOT NULL,
  storage_gb INT NOT NULL,
  team_members_max INT NOT NULL,
  
  -- Features
  features JSONB DEFAULT '[]',
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (
  id, 
  name, 
  description, 
  price_monthly_cents, 
  price_yearly_cents,
  claims_per_month,
  ai_credits_per_month,
  storage_gb,
  team_members_max,
  features,
  sort_order
) VALUES 
(
  'STARTER',
  'Starter',
  'Perfect for small contractors getting started',
  4900, -- $49/month
  49000, -- $490/year ($40.83/month)
  10,
  100,
  5,
  3,
  '["Basic claims management", "AI damage analysis", "Weather reports", "Client portal", "Email support"]',
  1
),
(
  'PROFESSIONAL',
  'Professional',
  'For growing contractors managing multiple projects',
  14900, -- $149/month
  149000, -- $1,490/year ($124.17/month)
  50,
  500,
  25,
  10,
  '["Everything in Starter", "Unlimited supplements", "Advanced AI tools", "Trades network", "Priority support", "Custom branding"]',
  2
),
(
  'ENTERPRISE',
  'Enterprise',
  'For large contractors with high volume',
  29900, -- $299/month
  299000, -- $2,990/year ($249.17/month)
  999999, -- Unlimited
  999999, -- Unlimited
  999999, -- Unlimited
  999999, -- Unlimited
  '["Everything in Professional", "Unlimited claims & AI", "Dedicated account manager", "Custom integrations", "SLA guarantee", "White-label option"]',
  3
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  price_yearly_cents = EXCLUDED.price_yearly_cents,
  claims_per_month = EXCLUDED.claims_per_month,
  ai_credits_per_month = EXCLUDED.ai_credits_per_month,
  storage_gb = EXCLUDED.storage_gb,
  team_members_max = EXCLUDED.team_members_max,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Create usage_metrics table for historical tracking
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id VARCHAR(255) NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage
  claims_created INT DEFAULT 0,
  ai_credits_used INT DEFAULT 0,
  storage_bytes_used BIGINT DEFAULT 0,
  uploads_count INT DEFAULT 0,
  
  -- Metadata
  tier VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(org_id, period_start)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_usage_metrics_org_period 
ON public.usage_metrics(org_id, period_start DESC);

-- Create function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  -- Archive current month's usage
  INSERT INTO public.usage_metrics (
    org_id,
    period_start,
    period_end,
    claims_created,
    ai_credits_used,
    storage_bytes_used,
    tier
  )
  SELECT 
    id,
    usage_period_start::date,
    NOW()::date,
    claims_used_this_month,
    ai_credits_used_this_month,
    storage_bytes_used,
    tier
  FROM public.organizations
  WHERE usage_period_start < DATE_TRUNC('month', NOW());
  
  -- Reset counters for new month
  UPDATE public.organizations
  SET 
    claims_used_this_month = 0,
    ai_credits_used_this_month = 0,
    usage_period_start = DATE_TRUNC('month', NOW())
  WHERE usage_period_start < DATE_TRUNC('month', NOW());
  
  RAISE NOTICE 'Monthly usage reset completed';
END;
$$ LANGUAGE plpgsql;

-- Create function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_org_id VARCHAR(255),
  p_limit_type VARCHAR(20), -- 'claims', 'ai_credits', 'storage'
  p_amount INT DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier VARCHAR(20);
  v_current_usage INT;
  v_limit INT;
BEGIN
  -- Get org tier and current usage
  SELECT 
    tier,
    CASE 
      WHEN p_limit_type = 'claims' THEN claims_used_this_month
      WHEN p_limit_type = 'ai_credits' THEN ai_credits_used_this_month
      WHEN p_limit_type = 'storage' THEN (storage_bytes_used / (1024*1024*1024))::INT -- Convert to GB
      ELSE 0
    END
  INTO v_tier, v_current_usage
  FROM public.organizations
  WHERE id = p_org_id;
  
  -- Get tier limit
  SELECT
    CASE
      WHEN p_limit_type = 'claims' THEN claims_per_month
      WHEN p_limit_type = 'ai_credits' THEN ai_credits_per_month
      WHEN p_limit_type = 'storage' THEN storage_gb
      ELSE 999999
    END
  INTO v_limit
  FROM public.pricing_tiers
  WHERE id = v_tier;
  
  -- Check if within limit
  RETURN (v_current_usage + p_amount) <= v_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if pricing tiers exist
SELECT id, name, price_monthly_cents, claims_per_month, ai_credits_per_month 
FROM public.pricing_tiers 
ORDER BY sort_order;

-- Check organizations with tier info
SELECT id, name, tier, claims_used_this_month, ai_credits_used_this_month, storage_bytes_used
FROM public.organizations
LIMIT 5;

-- Test usage limit check
-- SELECT check_usage_limit('org-id', 'claims', 1);

-- ============================================================================
-- ROLLBACK (If needed)
-- ============================================================================

/*
DROP FUNCTION IF EXISTS check_usage_limit(VARCHAR, VARCHAR, INT);
DROP FUNCTION IF EXISTS reset_monthly_usage();
DROP TABLE IF EXISTS public.usage_metrics CASCADE;
DROP TABLE IF EXISTS public.pricing_tiers CASCADE;

ALTER TABLE public.organizations 
DROP COLUMN IF EXISTS tier,
DROP COLUMN IF EXISTS claims_used_this_month,
DROP COLUMN IF EXISTS ai_credits_used_this_month,
DROP COLUMN IF EXISTS storage_bytes_used,
DROP COLUMN IF EXISTS usage_period_start;
*/
