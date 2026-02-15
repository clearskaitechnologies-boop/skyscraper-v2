-- Migration: Activity Events, Notifications, and Tool Histories
-- Created: 2025-11-06
-- Description: Add tables for tracking activity events, notifications, and tool run histories

-- 1) Activity events (drives dashboard Recent Activity)
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT,
  clerk_user_id TEXT NOT NULL,
  kind TEXT NOT NULL,             -- 'report.created' | 'wizard.completed' | 'mockup.generated' | 'carrier.exported' | ...
  ref_type TEXT,                  -- 'report' | 'job' | 'lead' | 'export'
  ref_id TEXT,
  title TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_org_created ON activity_events (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity_events (clerk_user_id, created_at DESC);

-- 2) Notifications (personal + org broadcast)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT,
  clerk_user_id TEXT,             -- NULL = org broadcast
  level TEXT DEFAULT 'info',      -- info | success | warning | error
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_org_created ON notifications (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_user_created ON notifications (clerk_user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_notif_read ON notifications_reads (notification_id, clerk_user_id);

-- 3) Tool histories (per user)
CREATE TABLE IF NOT EXISTS tool_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT,
  clerk_user_id TEXT NOT NULL,
  tool TEXT NOT NULL,             -- 'mockup' | 'quick_dol' | 'weather' | 'quick_pdf' | 'claims_wizard'
  status TEXT DEFAULT 'success',  -- success | error
  tokens_used INT DEFAULT 0,
  input JSONB,
  output JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_toolruns_user_created ON tool_runs (clerk_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_toolruns_org_tool ON tool_runs (org_id, tool);
CREATE INDEX IF NOT EXISTS idx_toolruns_user_tool ON tool_runs (clerk_user_id, tool, created_at DESC);

-- 4) Share links (public, time-bound URLs for reports/exports)
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type TEXT NOT NULL,        -- 'report' | 'export' | 'mockup'
  ref_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_token ON share_links (token);
CREATE INDEX IF NOT EXISTS idx_share_ref ON share_links (ref_type, ref_id);
CREATE INDEX IF NOT EXISTS idx_share_expires ON share_links (expires_at);
