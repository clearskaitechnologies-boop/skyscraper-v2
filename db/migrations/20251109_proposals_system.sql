-- AI Proposals System Database Schema
-- Created: 2025-11-09
-- Purpose: Complete proposal generation with damage analysis

-- =============================================================================
-- PROPOSALS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('claims', 'retail')),
  add_ons TEXT[] DEFAULT '{}',
  input JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','running','complete','failed')),
  output JSONB DEFAULT '{}',
  artifact_url TEXT,
  tokens_charged INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  queued_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_proposals_org_status ON proposals(org_id, status);
CREATE INDEX idx_proposals_user ON proposals(user_id);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();

-- =============================================================================
-- PROPOSAL PHOTOS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS proposal_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposal_photos_proposal ON proposal_photos(proposal_id);
CREATE INDEX idx_proposal_photos_org ON proposal_photos(org_id);

-- =============================================================================
-- PHOTO FINDINGS TABLE (AI Damage Analysis Results)
-- =============================================================================
CREATE TABLE IF NOT EXISTS photo_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES proposal_photos(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  findings JSONB NOT NULL,
  severity TEXT CHECK (severity IN ('none','minor','moderate','severe')),
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photo_findings_proposal ON photo_findings(proposal_id);
CREATE INDEX idx_photo_findings_photo ON photo_findings(photo_id);
CREATE INDEX idx_photo_findings_severity ON photo_findings(severity);

-- =============================================================================
-- PROPOSAL EVENTS TABLE (Progress Tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS proposal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposal_events_proposal ON proposal_events(proposal_id, created_at DESC);
CREATE INDEX idx_proposal_events_type ON proposal_events(event_type);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get latest draft for user
CREATE OR REPLACE FUNCTION proposals_get_latest_draft(
  p_org_id UUID,
  p_user_id TEXT
)
RETURNS TABLE (
  id UUID,
  kind TEXT,
  add_ons TEXT[],
  input JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.kind, p.add_ons, p.input, p.created_at
  FROM proposals p
  WHERE p.org_id = p_org_id
    AND p.user_id = p_user_id
    AND p.status = 'draft'
  ORDER BY p.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Update proposal status
CREATE OR REPLACE FUNCTION proposals_set_status(
  p_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  UPDATE proposals
  SET 
    status = p_status,
    error_message = p_error_message,
    queued_at = CASE WHEN p_status = 'queued' THEN v_now ELSE queued_at END,
    completed_at = CASE WHEN p_status IN ('complete', 'failed') THEN v_now ELSE completed_at END
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Update proposal output and artifact
CREATE OR REPLACE FUNCTION proposals_set_complete(
  p_id UUID,
  p_output JSONB,
  p_artifact_url TEXT,
  p_tokens_charged INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE proposals
  SET 
    status = 'complete',
    output = p_output,
    artifact_url = p_artifact_url,
    tokens_charged = p_tokens_charged,
    completed_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Record proposal event
CREATE OR REPLACE FUNCTION proposals_record_event(
  p_proposal_id UUID,
  p_event_type TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO proposal_events (proposal_id, event_type, message, metadata)
  VALUES (p_proposal_id, p_event_type, p_message, p_metadata)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Get proposal with all related data
CREATE OR REPLACE FUNCTION proposals_get_full(p_id UUID, p_org_id UUID)
RETURNS TABLE (
  id UUID,
  org_id UUID,
  user_id TEXT,
  kind TEXT,
  add_ons TEXT[],
  input JSONB,
  status TEXT,
  output JSONB,
  artifact_url TEXT,
  tokens_charged INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  photo_count BIGINT,
  finding_count BIGINT,
  event_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.org_id,
    p.user_id,
    p.kind,
    p.add_ons,
    p.input,
    p.status,
    p.output,
    p.artifact_url,
    p.tokens_charged,
    p.error_message,
    p.created_at,
    p.updated_at,
    p.completed_at,
    (SELECT COUNT(*) FROM proposal_photos pp WHERE pp.proposal_id = p.id) as photo_count,
    (SELECT COUNT(*) FROM photo_findings pf WHERE pf.proposal_id = p.id) as finding_count,
    (SELECT COUNT(*) FROM proposal_events pe WHERE pe.proposal_id = p.id) as event_count
  FROM proposals p
  WHERE p.id = p_id AND p.org_id = p_org_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE proposals IS 'AI-generated proposals with damage analysis';
COMMENT ON TABLE proposal_photos IS 'Photos uploaded for damage analysis';
COMMENT ON TABLE photo_findings IS 'AI damage detection results per photo';
COMMENT ON TABLE proposal_events IS 'Progress tracking and audit log';

COMMENT ON COLUMN proposals.kind IS 'Proposal type: claims or retail';
COMMENT ON COLUMN proposals.add_ons IS 'Selected features: photos, weather, code_refs, vendor_quotes, depreciation';
COMMENT ON COLUMN proposals.input IS 'User input: address, notes, dates, etc';
COMMENT ON COLUMN proposals.output IS 'Generated sections and composed document';
COMMENT ON COLUMN proposals.artifact_url IS 'Signed URL to generated PDF';

COMMENT ON COLUMN photo_findings.findings IS 'Structured AI analysis (DamageReport schema)';
COMMENT ON COLUMN photo_findings.severity IS 'Overall damage severity from analysis';
COMMENT ON COLUMN photo_findings.confidence IS 'AI confidence score 0-1';

-- =============================================================================
-- GRANTS (adjust for your user)
-- =============================================================================
-- GRANT ALL ON proposals TO your_app_user;
-- GRANT ALL ON proposal_photos TO your_app_user;
-- GRANT ALL ON photo_findings TO your_app_user;
-- GRANT ALL ON proposal_events TO your_app_user;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'proposal%';
-- SELECT proname FROM pg_proc WHERE proname LIKE 'proposals_%';
