-- =====================================================
-- REPORTS ACCEPTANCE & DOCUMENTS SYSTEM
-- =====================================================
-- Enables: Generate → Save → Send → Accept workflow
-- Features: Public sharing, client acceptance, document management
-- =====================================================

-- 1. Reports table enhancements (acceptance + sharing)
-- =====================================================
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS public_key UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS client_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_by_email TEXT,
  ADD COLUMN IF NOT EXISTS accepted_by_name TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_to_email TEXT;

-- Create unique index on public_key for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS reports_public_key_idx 
  ON reports(public_key);

-- Index for client token validation
CREATE INDEX IF NOT EXISTS reports_public_client_token_idx 
  ON reports(public_key, client_token);

-- Index for acceptance tracking
CREATE INDEX IF NOT EXISTS reports_accepted_at_idx 
  ON reports(org_id, accepted_at DESC NULLS LAST);

-- 2. Documents table (saved reports + file management)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime TEXT DEFAULT 'application/pdf',
  size_bytes BIGINT,
  folder TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS documents_org_id_idx 
  ON documents(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS documents_org_folder_idx 
  ON documents(org_id, folder);

CREATE INDEX IF NOT EXISTS documents_org_tags_gin 
  ON documents USING gin(tags);

CREATE INDEX IF NOT EXISTS documents_report_id_idx 
  ON documents(report_id);

-- 3. Report events audit log (optional but recommended)
-- =====================================================
CREATE TABLE IF NOT EXISTS report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'generated', 'saved', 'sent', 'viewed', 'accepted', 'declined'
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS report_events_report_id_idx 
  ON report_events(report_id, created_at DESC);

CREATE INDEX IF NOT EXISTS report_events_type_idx 
  ON report_events(event_type, created_at DESC);

-- 4. RLS Policies (Supabase)
-- =====================================================

-- Documents: Users can only see their org's documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_org_read ON documents
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY documents_org_write ON documents
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Report events: org-scoped read
ALTER TABLE report_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_events_org_read ON report_events
  FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM reports WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 5. Helper functions
-- =====================================================

-- Auto-update documents.updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Log report events automatically
CREATE OR REPLACE FUNCTION log_report_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.sent_at IS NOT NULL AND OLD.sent_at IS NULL THEN
      INSERT INTO report_events (report_id, event_type, metadata)
      VALUES (NEW.id, 'sent', jsonb_build_object('to_email', NEW.sent_to_email));
    END IF;
    
    IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL THEN
      INSERT INTO report_events (report_id, event_type, metadata)
      VALUES (NEW.id, 'accepted', jsonb_build_object(
        'by_email', NEW.accepted_by_email,
        'by_name', NEW.accepted_by_name
      ));
    END IF;
    
    IF NEW.declined_at IS NOT NULL AND OLD.declined_at IS NULL THEN
      INSERT INTO report_events (report_id, event_type, metadata)
      VALUES (NEW.id, 'declined', jsonb_build_object(
        'by_email', NEW.accepted_by_email
      ));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_event_log_trigger
  AFTER UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION log_report_event();

-- 6. Verification queries
-- =====================================================

-- Check reports enhancements
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'reports'
  AND column_name IN ('public_key', 'client_token', 'accepted_at', 'sent_at')
ORDER BY ordinal_position;

-- Check documents table
SELECT COUNT(*) as documents_table_exists
FROM information_schema.tables
WHERE table_name = 'documents';

-- Check indexes
SELECT 
  indexname,
  tablename
FROM pg_indexes
WHERE tablename IN ('reports', 'documents', 'report_events')
ORDER BY tablename, indexname;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Next steps:
-- 1. Update Prisma schema with new models
-- 2. Run: npx prisma db pull && npx prisma generate
-- 3. Create storage buckets: reports, documents
-- 4. Implement API routes for save/send/accept
-- =====================================================
