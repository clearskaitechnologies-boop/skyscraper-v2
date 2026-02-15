-- Migration: Add notifications table for pro-client communication
-- Date: 2025-11-30

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  claim_id TEXT,
  type TEXT NOT NULL, -- PHOTO_UPLOADED | DOCUMENT_SHARED | QUESTION_ANSWERED | WORK_ORDER | GENERAL
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read 
  ON notifications(user_id, read);

-- Index for claim-specific notifications
CREATE INDEX IF NOT EXISTS idx_notifications_claim_id 
  ON notifications(claim_id);

COMMENT ON TABLE notifications IS 'In-app notifications for pros and clients';
COMMENT ON COLUMN notifications.user_id IS 'Clerk userId (pro or client)';
COMMENT ON COLUMN notifications.claim_id IS 'Optional FK to claims table';
COMMENT ON COLUMN notifications.link IS 'Optional deep link URL for notification action';
