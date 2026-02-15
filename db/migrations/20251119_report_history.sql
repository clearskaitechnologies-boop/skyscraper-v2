-- Report History Storage
-- Tracks generated reports (PDFs, analyses) for later retrieval

CREATE TABLE report_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- claim_pdf | retail_pdf | rebuttal | bad_faith | supplement | other
  source_id TEXT,     -- related claim/retail/lead id
  title TEXT,
  file_url TEXT,      -- storage location of file (S3, etc.)
  metadata JSONB,     -- additional contextual data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_history_org_id ON report_history(org_id);
CREATE INDEX idx_report_history_type ON report_history(type);
CREATE INDEX idx_report_history_created_at ON report_history(created_at DESC);
CREATE INDEX idx_report_history_source_id ON report_history(source_id);

-- (Comments removed for cross-dialect compatibility)
