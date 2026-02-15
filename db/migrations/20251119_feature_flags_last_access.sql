-- Add last_access_at column for flag evaluation metrics
ALTER TABLE app.feature_flags ADD COLUMN IF NOT EXISTS last_access_at timestamp with time zone;
-- Backfill existing rows with created_at to avoid NULL if desired (optional)
UPDATE app.feature_flags SET last_access_at = COALESCE(last_access_at, created_at);
