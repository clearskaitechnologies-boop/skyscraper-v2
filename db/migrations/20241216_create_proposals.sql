-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  property_address TEXT NOT NULL,
  claim_id UUID,
  loss_type VARCHAR(100),
  template_id UUID NOT NULL,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, generating, ready, failed
  generated_content JSONB,
  error_message TEXT,
  tokens_used INT DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_proposals_org_id ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_template_id ON proposals(template_id);

-- Add comment
COMMENT ON TABLE proposals IS 'AI-generated proposals with report content';
