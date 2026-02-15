-- Add cover photo fields to claims table
-- Created: 2025-12-16 (Claim Workspace Enhancement)

ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_id TEXT;

COMMENT ON COLUMN claims.cover_photo_url IS 'URL of the cover photo for this claim (displayed in sidebar)';
COMMENT ON COLUMN claims.cover_photo_id IS 'Optional reference to the photo ID in claim_photos table';
