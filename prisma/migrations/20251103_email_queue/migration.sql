-- =====================================================
-- EMAIL QUEUE TABLE
-- =====================================================
-- Stores failed emails for retry
-- Enables email failover and monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  to_emails TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  html TEXT,
  react_json JSONB,          -- optional: serialized props to re-render template
  status TEXT NOT NULL DEFAULT 'pending',  -- pending|sent|failed
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS email_queue_status_idx ON email_queue(status, created_at);

-- Index for org-level monitoring
CREATE INDEX IF NOT EXISTS email_queue_org_idx ON email_queue(org_id, created_at);

-- Comment
COMMENT ON TABLE email_queue IS 'Email retry queue for failed deliveries';
COMMENT ON COLUMN email_queue.status IS 'pending = queued, sent = delivered, failed = permanent failure';
COMMENT ON COLUMN email_queue.attempts IS 'Number of delivery attempts made';
