-- Drift fix: ensure latitude/longitude columns exist on properties
-- Drift fix: add columns (will error if already exist; run once)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
