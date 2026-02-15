-- Ensure pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create usage table if missing
CREATE TABLE IF NOT EXISTS public.network_usage_monthly (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  year_month    text NOT NULL, -- e.g. '2025-10'
  ai_tokens_used integer NOT NULL DEFAULT 0,
  dol_checks     integer NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

-- FK to organizations(id) if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='public'
      AND table_name='network_usage_monthly'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='network_usage_monthly_org_id_fkey'
  ) THEN
    ALTER TABLE public.network_usage_monthly
      ADD CONSTRAINT network_usage_monthly_org_id_fkey
      FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;
