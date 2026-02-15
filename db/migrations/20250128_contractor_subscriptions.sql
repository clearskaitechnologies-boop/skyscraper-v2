-- Add subscription fields to contractor_profiles for Pro tier management
-- Master Prompt #34-B: Payment Integration & Subscription Activation

-- Add subscription columns to contractor_profiles
ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS leads_remaining INT DEFAULT 0;
ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Add claimed_at timestamp to public_leads
ALTER TABLE public_leads ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_contractor_subscriptions 
ON contractor_profiles(subscription_tier, subscription_status);

-- Comments to document the subscription tiers
COMMENT ON COLUMN contractor_profiles.subscription_tier IS 'free: Pay-per-lead ($25), pro: Unlimited leads ($99/mo)';
COMMENT ON COLUMN contractor_profiles.subscription_status IS 'active, inactive, canceled, past_due';
COMMENT ON COLUMN contractor_profiles.leads_remaining IS 'NULL = unlimited (pro tier), 0+ = remaining credits (free tier)';
COMMENT ON COLUMN public_leads.claimed_at IS 'Timestamp when contractor claimed/purchased this lead';
