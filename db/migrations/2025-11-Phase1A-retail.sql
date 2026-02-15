-- 2025-11-Phase1A-retail.sql
-- Retail autosave storage (JSONB) + updated_at trigger

-- 1) Updated-at trigger function (idempotent create)
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

-- 2) Table: retail_packets (idempotent create)
CREATE TABLE IF NOT EXISTS public.retail_packets (
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
    WHERE c.relname = 'idx_retail_packets_user' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_retail_packets_user ON public.retail_packets (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_retail_packets_updated_at' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_retail_packets_updated_at ON public.retail_packets (updated_at DESC);
  END IF;
END $$;

-- 4) Trigger (idempotent create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_retail_packets_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_retail_packets_set_updated_at
    BEFORE UPDATE ON public.retail_packets
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;
