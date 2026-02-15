-- Consolidated legacy claims columns migration (idempotent)
-- Adds policy/contact/timeline tracking fields if absent.

ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS policy_number TEXT,
  ADD COLUMN IF NOT EXISTS adjuster_packet_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS homeowner_email TEXT,
  ADD COLUMN IF NOT EXISTS homeowner_summary_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catStormEventId TEXT;

DO $$ BEGIN RAISE NOTICE '✅ Consolidated claims legacy columns applied (or already present)'; END $$;
