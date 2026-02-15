-- 001_create_org_branding.sql
-- Create branding-related tables: org_branding, org_licenses, org_insurance, org_staff, org_disclaimers
-- Uses pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS org_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  roc text,
  ein text,
  phone text,
  email text,
  website text,
  address jsonb,
  colors jsonb,
  logos jsonb,
  defaults jsonb,
  theme jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_branding_org_id ON org_branding (org_id);

CREATE TABLE IF NOT EXISTS org_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  type text NOT NULL,
  number text,
  state text,
  expires_on date,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_licenses_org_id ON org_licenses (org_id);

CREATE TABLE IF NOT EXISTS org_insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  gl_carrier text,
  policy_no text,
  limits jsonb,
  pdf_url text,
  wc_info jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_insurance_org_id ON org_insurance (org_id);

CREATE TABLE IF NOT EXISTS org_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid,
  role text,
  display_name text,
  title text,
  headshot_url text,
  contact jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_staff_org_id ON org_staff (org_id);

CREATE TABLE IF NOT EXISTS org_disclaimers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  key text NOT NULL,
  text_block text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_disclaimers_org_id ON org_disclaimers (org_id);

-- Helper trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_org_branding_update BEFORE UPDATE ON org_branding
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_org_staff_update BEFORE UPDATE ON org_staff
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
