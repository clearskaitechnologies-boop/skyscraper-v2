-- Phase 4: Add missing homeowner_email column to claims table
-- This column exists in prisma/schema.prisma but was never added to the DB

ALTER TABLE claims
ADD COLUMN IF NOT EXISTS homeowner_email VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_claims_homeowner_email ON claims(homeowner_email);

-- Backfill from insured_name if needed (optional)
-- UPDATE claims SET homeowner_email = insured_name WHERE homeowner_email IS NULL AND insured_name LIKE '%@%';
