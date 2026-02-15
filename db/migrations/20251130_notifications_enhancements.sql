-- Add category, orgId, fileId, tradeJobId to notifications table
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS org_id TEXT,
  ADD COLUMN IF NOT EXISTS file_id TEXT,
  ADD COLUMN IF NOT EXISTS trade_job_id TEXT;

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(org_id);

-- Create ClaimFileComment table for document-specific messages
CREATE TABLE IF NOT EXISTS claim_file_comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  claim_file_id TEXT NOT NULL REFERENCES claim_documents(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('CLIENT', 'PRO', 'SYSTEM')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Create indexes for claim_file_comments
CREATE INDEX IF NOT EXISTS idx_claim_file_comments_claim_id ON claim_file_comments(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_file_comments_claim_file_id ON claim_file_comments(claim_file_id);
CREATE INDEX IF NOT EXISTS idx_claim_file_comments_author_id ON claim_file_comments(author_id);

COMMENT ON TABLE claim_file_comments IS 'Document-specific messages/comments from clients and pros';
COMMENT ON COLUMN notifications.category IS 'TEAM_UPDATE | CLIENT_UPDATE | TRADES_UPDATE';
COMMENT ON COLUMN notifications.file_id IS 'Reference to claim_documents.id for document-related notifications';
COMMENT ON COLUMN notifications.trade_job_id IS 'Reference to trades network job for trades-related notifications';
