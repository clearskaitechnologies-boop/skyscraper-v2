-- ============================================
-- RETAIL PACKETS TABLE MIGRATION
-- ============================================
-- Purpose: Enable Retail Proposal Builder auto-save functionality
-- Date: November 19, 2025
-- Required for: /retail/generate 8-step wizard
-- API Routes: /api/retail/save, /api/retail/start, /api/retail/resume
-- ============================================

-- Create retail_packets table for proposal wizard auto-save
CREATE TABLE IF NOT EXISTS retail_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  current_step INTEGER DEFAULT 1,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT retail_packets_step_range CHECK (current_step >= 1 AND current_step <= 8),
  CONSTRAINT retail_packets_status_check CHECK (status IN ('draft', 'pending', 'sent', 'accepted', 'rejected'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_retail_packets_user ON retail_packets(user_id);
CREATE INDEX IF NOT EXISTS idx_retail_packets_org ON retail_packets(org_id);
CREATE INDEX IF NOT EXISTS idx_retail_packets_status ON retail_packets(status);
CREATE INDEX IF NOT EXISTS idx_retail_packets_created ON retail_packets(created_at DESC);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_retail_packets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for re-running migration)
DROP TRIGGER IF EXISTS retail_packets_updated_at ON retail_packets;

-- Create trigger
CREATE TRIGGER retail_packets_updated_at
  BEFORE UPDATE ON retail_packets
  FOR EACH ROW
  EXECUTE FUNCTION update_retail_packets_updated_at();

-- Table comments for documentation
COMMENT ON TABLE retail_packets IS 'Retail proposal builder autosave storage (8-step wizard)';
COMMENT ON COLUMN retail_packets.id IS 'Unique packet identifier (UUID)';
COMMENT ON COLUMN retail_packets.user_id IS 'Clerk user ID who created the proposal';
COMMENT ON COLUMN retail_packets.org_id IS 'Organization ID for multi-tenant isolation';
COMMENT ON COLUMN retail_packets.status IS 'Proposal lifecycle status: draft, pending, sent, accepted, rejected';
COMMENT ON COLUMN retail_packets.current_step IS 'Highest step number reached in wizard (1-8)';
COMMENT ON COLUMN retail_packets.data IS 'JSONB fragments from 8 wizard steps (client info, materials, financing, photos, signature, etc.)';
COMMENT ON COLUMN retail_packets.created_at IS 'Timestamp when proposal was first created';
COMMENT ON COLUMN retail_packets.updated_at IS 'Timestamp of last auto-save (triggers on UPDATE)';

-- Verification queries
-- SELECT COUNT(*) FROM retail_packets;
-- SELECT * FROM retail_packets WHERE status = 'draft' ORDER BY updated_at DESC LIMIT 5;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'retail_packets table created successfully';
  RAISE NOTICE 'Indexes created: idx_retail_packets_user, idx_retail_packets_org, idx_retail_packets_status, idx_retail_packets_created';
  RAISE NOTICE 'Trigger created: retail_packets_updated_at (auto-updates updated_at column)';
  RAISE NOTICE 'Ready for /retail/generate wizard auto-save functionality';
END $$;
