-- Add rollout strategy columns
ALTER TABLE app.feature_flags ADD COLUMN IF NOT EXISTS rollout_percent integer NOT NULL DEFAULT 100;
ALTER TABLE app.feature_flags ADD COLUMN IF NOT EXISTS targeting jsonb;
