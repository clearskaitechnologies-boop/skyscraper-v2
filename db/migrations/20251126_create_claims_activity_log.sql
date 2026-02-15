-- Create claims_activity_log table
-- Tracks all activity on claims (status changes, comments, uploads, assignments, etc.)

CREATE TABLE IF NOT EXISTS claims_activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  claim_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT fk_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_claims_activity_log_claim_id ON claims_activity_log(claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_activity_log_created_at ON claims_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_activity_log_user_id ON claims_activity_log(user_id);

-- Common action_type values:
-- 'created', 'status_changed', 'comment_added', 'file_uploaded', 
-- 'assigned', 'estimate_updated', 'payment_received', 'inspection_scheduled'

COMMENT ON TABLE claims_activity_log IS 'Audit log of all activities on claims';
COMMENT ON COLUMN claims_activity_log.action_type IS 'Type of action: created, status_changed, comment_added, file_uploaded, etc.';
COMMENT ON COLUMN claims_activity_log.metadata IS 'Additional context as JSON (old_value, new_value, file_url, etc.)';
