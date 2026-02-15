-- sync_migrations.sql
-- Purpose: Ensure new/renamed tables & constraints exist for Final Launch Step 1
-- Safe to run multiple times.

-- 1. Ensure unique constraint on claim_analysis.claim_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'claim_analysis_claim_id_key'
  ) THEN
    ALTER TABLE claim_analysis ADD CONSTRAINT claim_analysis_claim_id_key UNIQUE (claim_id);
  END IF;
END $$;

-- 2. Ensure users.headshot_url column exists (redundant safeguard)
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot_url TEXT;

-- 3. Ensure feature_flags table exists (delegated to earlier migration, but create if missing)
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES org(id) ON DELETE CASCADE,
  key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Ensure api_tokens table exists
CREATE TABLE IF NOT EXISTS api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES org(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

-- 5. Verify claim_bad_faith_analysis table (create if missing minimal structure)
CREATE TABLE IF NOT EXISTS claim_bad_faith_analysis (
  id varchar(191) PRIMARY KEY,
  claim_id varchar(191) UNIQUE REFERENCES claims(id) ON DELETE CASCADE,
  analysis jsonb,
  severity int,
  created_at timestamptz DEFAULT now()
);

-- 6. Verify report_history table (create if missing)
CREATE TABLE IF NOT EXISTS report_history (
  id varchar(191) PRIMARY KEY,
  claim_id varchar(191) REFERENCES claims(id) ON DELETE CASCADE,
  org_id varchar(191) REFERENCES org(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  title text,
  payload jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_history_claim_id ON report_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_report_history_org_type ON report_history(org_id, type);

-- 7. Verify claim_event_reconstruction table (create if missing)
CREATE TABLE IF NOT EXISTS claim_event_reconstruction (
  id varchar(191) PRIMARY KEY,
  claim_id varchar(191) UNIQUE REFERENCES claims(id) ON DELETE CASCADE,
  timeline jsonb,
  sources jsonb,
  confidence float,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_claim_event_reconstruction_claim_id ON claim_event_reconstruction(claim_id);

-- 8. Headshot URL verification query (commented, run manually if needed)
-- SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='headshot_url';

-- 9. Summary sentinel
INSERT INTO feature_flags(key, enabled) VALUES ('sync_migrations_ran', true)
ON CONFLICT (key) DO NOTHING;
