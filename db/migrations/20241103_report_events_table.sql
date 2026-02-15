-- =====================================================
-- REPORT EVENTS TABLE - Acceptance Audit Trail
-- =====================================================
-- Tracks: sent, viewed, accepted, declined events
-- Stores: IP address, user agent, metadata for compliance
-- =====================================================

-- 1. Create report_events table
-- =====================================================
CREATE TABLE IF NOT EXISTS report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  user_id UUID,  -- Internal actor (optional)
  kind TEXT NOT NULL,  -- 'sent', 'viewed', 'accepted', 'declined', 'generated', 'saved'
  meta JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS report_events_org_created_idx 
  ON report_events(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS report_events_report_id_idx 
  ON report_events(report_id, created_at DESC);

CREATE INDEX IF NOT EXISTS report_events_kind_idx 
  ON report_events(kind, created_at DESC);

-- 3. Add RLS policy (org-scoped access)
-- =====================================================
ALTER TABLE report_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_events_org_read ON report_events
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY report_events_org_write ON report_events
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- 4. Helper function: log event easily
-- =====================================================
CREATE OR REPLACE FUNCTION log_report_event(
  p_report_id UUID,
  p_org_id UUID,
  p_kind TEXT,
  p_meta JSONB DEFAULT '{}'::jsonb,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO report_events (report_id, org_id, user_id, kind, meta, ip, user_agent)
  VALUES (p_report_id, p_org_id, p_user_id, p_kind, p_meta, p_ip, p_user_agent)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Verification queries
-- =====================================================

-- Check table exists
SELECT COUNT(*) as report_events_table_exists
FROM information_schema.tables
WHERE table_name = 'report_events';

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'report_events'
ORDER BY indexname;

-- Sample query: recent events
/*
SELECT 
  re.id,
  re.kind,
  re.created_at,
  re.ip,
  r.id as report_id,
  o.name as org_name
FROM report_events re
JOIN reports r ON r.id = re.report_id
JOIN organizations o ON o.id = re.org_id
ORDER BY re.created_at DESC
LIMIT 50;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Usage Example:
-- SELECT log_report_event(
--   'report-uuid',
--   'org-uuid',
--   'accepted',
--   '{"client_email": "user@example.com", "client_name": "John Doe"}'::jsonb,
--   '192.168.1.1',
--   'Mozilla/5.0...'
-- );
-- =====================================================
