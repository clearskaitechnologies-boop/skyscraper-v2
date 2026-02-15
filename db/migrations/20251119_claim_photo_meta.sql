-- Migration: create claim_photo_meta table for persistent photo tags & notes
-- Date: 2025-11-19
-- Depends on existing claims & file_assets tables

CREATE TABLE IF NOT EXISTS claim_photo_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id VARCHAR(191) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  photo_id VARCHAR(191) NOT NULL REFERENCES file_assets(id) ON DELETE CASCADE,
  tag TEXT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_photo_meta_claim_photo ON claim_photo_meta (claim_id, photo_id);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION claim_photo_meta_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS claim_photo_meta_updated_at ON claim_photo_meta;
CREATE TRIGGER claim_photo_meta_updated_at
BEFORE UPDATE ON claim_photo_meta
FOR EACH ROW EXECUTE FUNCTION claim_photo_meta_touch_updated_at();