-- Idempotent migration for SkaiScraper™ Intake System
ALTER TABLE public.org_branding
  ADD COLUMN IF NOT EXISTS roc_number text,
  ADD COLUMN IF NOT EXISTS service_area_presets text[] DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'org_branding_org_id_unique'
  ) THEN
    CREATE UNIQUE INDEX org_branding_org_id_unique ON public.org_branding(org_id);
  END IF;
END$$;

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.owner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  label text,
  owner jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.insurance_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  label text,
  insurance jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  report_number text,
  owner jsonb,
  insurance jsonb,
  licenses jsonb,
  service_area text,
  rep jsonb,
  meet_the_team jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  user_id uuid,
  kind text NOT NULL,
  unit_cost_cents int,
  qty int DEFAULT 1,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS enabled and basic org-scoped policies exist. current_org_id() must be defined in your DB.
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_profiles_org_access ON public.owner_profiles FOR ALL USING (org_id = current_org_id());

ALTER TABLE public.report_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY report_intake_org_access ON public.report_intake FOR ALL USING (org_id = current_org_id());

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_events_org_access ON public.usage_events FOR ALL USING (org_id = current_org_id());

-- Helper functions: derive org_id and user_id from JWT claims
CREATE OR REPLACE FUNCTION public.current_org_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF((current_setting('request.jwt.claims', true)::jsonb->>'org_id')::text,'')::uuid;
$$;

CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF((current_setting('request.jwt.claims', true)::jsonb->>'sub')::text,'')::uuid;
$$;

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

-- RPC to increment pending charges atomically
CREATE OR REPLACE FUNCTION public.increment_pending_charges(p_org_id uuid, p_amount int)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.org_billing
  SET charges_pending_cents = COALESCE(charges_pending_cents,0) + p_amount,
      updated_at = now()
  WHERE org_id = p_org_id;
END; $$;

-- Org plan limits and billing tables
CREATE TABLE IF NOT EXISTS public.org_plan_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  ai_included int NOT NULL,
  dol_check_included int NOT NULL,
  dol_full_included int NOT NULL,
  ai_overage_cents int NOT NULL,
  dol_check_overage_cents int NOT NULL,
  dol_full_overage_cents int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.org_billing (
  org_id uuid PRIMARY KEY,
  plan_name text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  charges_pending_cents int DEFAULT 0,
  founders_circle boolean DEFAULT false,
  lifetime_discount_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.org_plan_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_plan_limits_read ON public.org_plan_limits FOR SELECT USING (true);

ALTER TABLE public.org_billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_billing_org_access ON public.org_billing FOR ALL USING (org_id = current_org_id());

-- Ensure usage_events.kind conforms to allowed kinds (add constraint if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usage_events_kind_check'
  ) THEN
    ALTER TABLE public.usage_events ADD CONSTRAINT usage_events_kind_check CHECK (kind IN ('AI_MOCKUP','DOL_CHECK','DOL_FULL'));
  END IF;
END$$;

-- Seed plan limits (idempotent)
INSERT INTO public.org_plan_limits (plan_name, ai_included, dol_check_included, dol_full_included, ai_overage_cents, dol_check_overage_cents, dol_full_overage_cents)
VALUES
  ('SOLO', 5, 3, 2, 199, 199, 899),
  ('PRO', 2000, 15, 3, 4, 250, 1250),
  ('BUSINESS', 30, 15, 10,  99, 149, 699),
  ('ENTERPRISE',50,30,25,  89, 139, 689)
ON CONFLICT (plan_name) DO NOTHING;
