-- Phase R: Report Presets for quick report generation
CREATE TABLE IF NOT EXISTS report_presets (
  id VARCHAR(255) PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  sections JSONB NOT NULL,
  options JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_presets_org_id ON report_presets(org_id);
CREATE INDEX IF NOT EXISTS idx_report_presets_type ON report_presets(type);
CREATE INDEX IF NOT EXISTS idx_report_presets_is_default ON report_presets(is_default);

-- Comment for documentation
COMMENT ON TABLE report_presets IS 'Phase R: Report generation presets for quick builder configuration';
