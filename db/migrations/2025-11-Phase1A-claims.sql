-- db/migrations/2025-11-Phase1A-claims.sql
-- Claims autosave storage (JSONB) + updated_at trigger
-- Similar to retail_packets but for claim_reports

-- 1) Reuse the updated-at trigger function from retail migration
--    (already created in 2025-11-Phase1A-retail.sql, so this is idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at_timestamp'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- 2) Table: claim_reports (idempotent create)
CREATE TABLE IF NOT EXISTS public.claim_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_step INT NOT NULL DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Indexes (safe create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_claim_reports_user' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_claim_reports_user ON public.claim_reports (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_claim_reports_updated_at' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_claim_reports_updated_at ON public.claim_reports (updated_at DESC);
  END IF;
END $$;

-- 4) Trigger (idempotent create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_claim_reports_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_claim_reports_set_updated_at
    BEFORE UPDATE ON public.claim_reports
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;
