-- Add optional inspection date to claims for editable metadata
ALTER TABLE claims
    ADD COLUMN IF NOT EXISTS "dateOfInspection" timestamptz;
