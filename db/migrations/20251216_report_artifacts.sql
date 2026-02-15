-- ============================================================================
-- REPORT ARTIFACT STORAGE TABLE
-- Tracks all generated report artifacts with signed URLs for secure access
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
  
  -- Artifact metadata
  report_type VARCHAR(100) NOT NULL,  -- 'estimate_narrative', 'supplement', 'rebuttal', etc.
  format VARCHAR(20) NOT NULL,        -- 'pdf', 'docx', 'html'
  file_size_bytes INTEGER,
  
  -- Storage
  storage_path TEXT NOT NULL,         -- GCS/S3 path
  signed_url TEXT,                    -- Temporary signed URL (expires in 1 hour)
  signed_url_expires_at TIMESTAMPTZ,  -- When signed URL expires
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  access_count INTEGER DEFAULT 0,
  
  -- Audit trail
  created_by VARCHAR(255),            -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  
  -- Indexing
  CONSTRAINT report_artifacts_claim_idx FOREIGN KEY (claim_id) REFERENCES claims(id),
  CONSTRAINT report_artifacts_org_idx FOREIGN KEY (org_id) REFERENCES org(id)
);

CREATE INDEX idx_report_artifacts_claim_id ON report_artifacts(claim_id);
CREATE INDEX idx_report_artifacts_org_id ON report_artifacts(org_id);
CREATE INDEX idx_report_artifacts_created_at ON report_artifacts(created_at DESC);
CREATE INDEX idx_report_artifacts_type ON report_artifacts(report_type);

-- Add comment
COMMENT ON TABLE report_artifacts IS 'Tracks generated report artifacts with signed URLs for secure, time-limited access';
