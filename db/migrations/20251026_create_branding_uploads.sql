-- Create extension for UUID gen
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS branding_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  key text NOT NULL,
  public_url text NOT NULL,
  filename text,
  status text DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now()
);

-- optional index by org
CREATE INDEX IF NOT EXISTS idx_branding_uploads_org ON branding_uploads (org_id);
