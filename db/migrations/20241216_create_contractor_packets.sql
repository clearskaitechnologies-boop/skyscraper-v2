-- ============================================================================
-- CONTRACTOR PACKET GENERATION TRACKING
-- Stores generated contractor packets with status and content
-- ============================================================================

CREATE TABLE IF NOT EXISTS contractor_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  
  -- Packet metadata
  packet_name VARCHAR(255) NOT NULL DEFAULT 'Contractor Packet',
  sections TEXT[] NOT NULL, -- Array of section keys
  export_format VARCHAR(10) NOT NULL DEFAULT 'pdf', -- pdf, docx, zip
  
  -- Optional context
  claim_id UUID, -- Optional link to claim
  job_id UUID, -- Optional link to job
  notes TEXT,
  
  -- Generation status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, generating, ready, failed
  generated_content JSONB, -- Stores full generated packet data
  file_url TEXT, -- Storage URL for downloaded file
  error_message TEXT,
  
  -- Tracking
  tokens_used INT DEFAULT 0,
  created_by VARCHAR(255), -- Clerk user ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contractor_packets_org_id ON contractor_packets(organization_id);
CREATE INDEX IF NOT EXISTS idx_contractor_packets_status ON contractor_packets(status);
CREATE INDEX IF NOT EXISTS idx_contractor_packets_created_at ON contractor_packets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contractor_packets_claim_id ON contractor_packets(claim_id) WHERE claim_id IS NOT NULL;

COMMENT ON TABLE contractor_packets IS 'Contractor packet generation jobs with AI-generated content';
