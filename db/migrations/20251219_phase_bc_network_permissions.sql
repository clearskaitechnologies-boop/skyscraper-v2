-- Phase B+C: Network Interconnection + Centralized Permissions
-- Date: 2025-12-19
-- Description: Add vendor-to-trade profile linkage and vendor usage history tracking

-- ============================================================================
-- PHASE B: Vendor ↔ Trade Profile Linkage
-- ============================================================================

-- Add trade_profile_id to vendors table (linking vendors to trades profiles)
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS trade_profile_id TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_vendors_trade_profile_id ON vendors(trade_profile_id);

-- ============================================================================
-- PHASE C: Vendor Usage History Tracking
-- ============================================================================

-- Create vendor_usage_history table to track vendor attachments to claims
CREATE TABLE IF NOT EXISTS vendor_usage_history (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  claim_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  attached_by TEXT NOT NULL, -- userId who attached vendor
  attached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detached_at TIMESTAMPTZ,
  notes TEXT,
  
  CONSTRAINT fk_vendor_usage_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT fk_vendor_usage_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_usage_vendor_id ON vendor_usage_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_usage_claim_id ON vendor_usage_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_vendor_usage_org_id ON vendor_usage_history(org_id);
CREATE INDEX IF NOT EXISTS idx_vendor_usage_attached_at ON vendor_usage_history(attached_at);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify vendors.trade_profile_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendors' AND column_name = 'trade_profile_id'
  ) THEN
    RAISE NOTICE '✓ vendors.trade_profile_id column exists';
  ELSE
    RAISE EXCEPTION '✗ vendors.trade_profile_id column missing!';
  END IF;
END $$;

-- Verify vendor_usage_history table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'vendor_usage_history'
  ) THEN
    RAISE NOTICE '✓ vendor_usage_history table exists';
  ELSE
    RAISE EXCEPTION '✗ vendor_usage_history table missing!';
  END IF;
END $$;

RAISE NOTICE '✓ Phase B+C migration complete!';
