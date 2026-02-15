-- Add composite unique index for per-org flags while keeping global fallback
BEGIN;
ALTER TABLE app.feature_flags DROP CONSTRAINT IF EXISTS feature_flags_key_key;
-- Ensure nulls in org_id allowed; unique index treats NULL values as distinct, so global record (NULL org_id) coexists with org-specific
CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_key_org_idx ON app.feature_flags (key, org_id);
COMMIT;
