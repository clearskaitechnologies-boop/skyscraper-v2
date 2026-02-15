-- Add organization branding table
-- Requires pgcrypto or builtin uuid support; uses gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  org_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  logo_url text,
  primary_color text,
  secondary_color text,
  font_family text,
  template_defaults jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed a TEST_ORG row if not exists (replace name as needed)
INSERT INTO organizations (org_id, name, logo_url, primary_color)
SELECT gen_random_uuid(), 'Test Org', NULL, '#0055aa'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE org_id = '00000000-0000-0000-0000-000000000000');
