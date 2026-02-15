-- Add support_tickets table for bug reports and feature requests
-- Migration: 20241221_create_support_tickets

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY DEFAULT ('ticket_' || gen_random_uuid()::text),
  org_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'support', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Auto-captured context
  build_sha TEXT,
  current_page TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_support_tickets_org_id ON support_tickets(org_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_type ON support_tickets(type);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

COMMENT ON TABLE support_tickets IS 'User-submitted bug reports, feature requests, and support tickets';
COMMENT ON COLUMN support_tickets.build_sha IS 'Git commit SHA when ticket was created (for debugging)';
COMMENT ON COLUMN support_tickets.current_page IS 'URL path where ticket was submitted from';
