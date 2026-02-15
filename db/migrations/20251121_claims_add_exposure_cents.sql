-- Idempotent add using IF NOT EXISTS for safety; use BIGINT for larger monetary range
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS exposure_cents BIGINT NOT NULL DEFAULT 0;
