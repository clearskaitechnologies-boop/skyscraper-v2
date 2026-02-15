-- Migration: create carrier_submissions and carrier_templates
-- Date: 2025-10-28

-- carrier_templates: optional templates for common carrier emails
CREATE TABLE IF NOT EXISTS carrier_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- carrier_submissions: record of outbound submissions to carriers
CREATE TABLE IF NOT EXISTS carrier_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  lead_id uuid,
  carrier_email text NOT NULL,
  subject text NOT NULL,
  body text,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'queued',
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Minimal index for lookups
CREATE INDEX IF NOT EXISTS idx_carrier_submissions_org_id ON carrier_submissions(org_id);
CREATE INDEX IF NOT EXISTS idx_carrier_submissions_lead_id ON carrier_submissions(lead_id);

-- Grant execute to service_role (if present in target DB)
-- GRANT SELECT, INSERT, UPDATE ON carrier_submissions TO service_role;
