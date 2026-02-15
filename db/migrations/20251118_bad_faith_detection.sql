-- MASTER PROMPT #42: Bad Faith Detection Schema
-- Tracks bad faith indicators for insurance carrier behavior

CREATE TABLE IF NOT EXISTS claim_bad_faith_analysis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  org_id VARCHAR(255) NOT NULL,
  
  -- Analysis Results
  analysis JSONB NOT NULL, -- Complete BadFaithAnalysis object
  overall_severity VARCHAR(50) NOT NULL, -- 'none' | 'low' | 'medium' | 'high' | 'critical'
  indicator_count INTEGER NOT NULL DEFAULT 0,
  legal_action_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  attorney_referral_suggested BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Indexes
  UNIQUE(claim_id, analyzed_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bad_faith_claim_id ON claim_bad_faith_analysis(claim_id);
CREATE INDEX IF NOT EXISTS idx_bad_faith_org_id ON claim_bad_faith_analysis(org_id);
CREATE INDEX IF NOT EXISTS idx_bad_faith_severity ON claim_bad_faith_analysis(overall_severity);
CREATE INDEX IF NOT EXISTS idx_bad_faith_analyzed_at ON claim_bad_faith_analysis(analyzed_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_bad_faith_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bad_faith_updated_at
  BEFORE UPDATE ON claim_bad_faith_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_bad_faith_updated_at();

COMMENT ON TABLE claim_bad_faith_analysis IS 'Master Prompt #42: Tracks insurance carrier bad faith indicators and legal recommendations';
COMMENT ON COLUMN claim_bad_faith_analysis.analysis IS 'Complete BadFaithAnalysis object with indicators array, evidence, and recommendations';
COMMENT ON COLUMN claim_bad_faith_analysis.overall_severity IS 'Aggregated severity level: none, low, medium, high, or critical';
COMMENT ON COLUMN claim_bad_faith_analysis.legal_action_recommended IS 'Whether legal action is recommended based on detected indicators';
