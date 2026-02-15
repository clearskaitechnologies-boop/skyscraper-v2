-- 20251026_add_usage_events_org_billing.sql
-- Adds usage_events table and billing columns to org_billing

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  event_type text,
  metadata jsonb,
  amount_cents integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_org_id ON usage_events (org_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON usage_events (event_type);

-- Ensure org_billing exists and add pending_charges_cents
ALTER TABLE IF EXISTS org_billing
  ADD COLUMN IF NOT EXISTS pending_charges_cents integer DEFAULT 0;

ALTER TABLE IF EXISTS org_billing
  ADD COLUMN IF NOT EXISTS last_billed_at timestamptz NULL;
