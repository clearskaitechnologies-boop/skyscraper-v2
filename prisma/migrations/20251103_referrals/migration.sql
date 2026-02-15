-- =====================================================
-- REFERRAL SYSTEM MIGRATION
-- =====================================================
-- Creates referrals and referral_rewards tables
-- Adds referralCode to organizations for open beta
-- =====================================================

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  ref_code TEXT NOT NULL UNIQUE,
  invited_email TEXT,
  invitee_org_id TEXT,
  status TEXT NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS referrals_org_status_idx ON referrals(org_id, status);
CREATE INDEX IF NOT EXISTS referrals_ref_code_idx ON referrals(ref_code);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  type TEXT NOT NULL,
  months_awarded INT,
  tokens_awarded INT,
  source_referral UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for referral_rewards
CREATE INDEX IF NOT EXISTS referral_rewards_org_idx ON referral_rewards(org_id);
CREATE INDEX IF NOT EXISTS referral_rewards_type_idx ON referral_rewards(type);

-- Add referral_code column to existing orgs table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Org' AND column_name = 'referralCode'
  ) THEN
    ALTER TABLE "Org" ADD COLUMN "referralCode" TEXT UNIQUE;
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE referrals IS 'Tracks referral links and email invites sent by organizations';
COMMENT ON COLUMN referrals.status IS 'Status: invited | signed_up | subscribed | expired';
COMMENT ON TABLE referral_rewards IS 'Records rewards earned from successful referrals';
COMMENT ON COLUMN referral_rewards.type IS 'Reward type: month | tokens (first = month, subsequent = tokens)';
