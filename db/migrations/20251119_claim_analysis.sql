-- Migration: 20251119_claim_analysis.sql
-- Adds claim_analysis table and extends file_assets with AI metadata columns
-- Safe to run multiple times (uses IF NOT EXISTS / checks for columns)

-- 1. Extend file_assets table
ALTER TABLE file_assets
  ADD COLUMN IF NOT EXISTS file_type VARCHAR(32),
  ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(32),
  ADD COLUMN IF NOT EXISTS photo_angle VARCHAR(32),
  ADD COLUMN IF NOT EXISTS camera_height INT,
  ADD COLUMN IF NOT EXISTS ai_tags TEXT[],
  ADD COLUMN IF NOT EXISTS ai_damage TEXT[];

-- Supporting index for analysis status filtering
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_assets_org_claim_analysis_status'
  ) THEN
    CREATE INDEX idx_file_assets_org_claim_analysis_status
      ON file_assets(orgId, claimId, analysis_status);
  END IF;
END $$;

-- 2. Create claim_analysis table
CREATE TABLE IF NOT EXISTS claim_analysis (
  id VARCHAR(191) PRIMARY KEY,
  claim_id VARCHAR(191) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  slopes JSONB,
  roof_map JSONB,
  materials JSONB,
  damages JSONB,
  code_flags JSONB,
  risk_flags JSONB,
  scope JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick claim analysis lookups
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_claim_analysis_claim_id'
  ) THEN
    CREATE INDEX idx_claim_analysis_claim_id ON claim_analysis(claim_id);
  END IF;
END $$;

-- Verification queries (optional)
-- SELECT column_name FROM information_schema.columns WHERE table_name='file_assets';
-- SELECT column_name FROM information_schema.columns WHERE table_name='claim_analysis';
