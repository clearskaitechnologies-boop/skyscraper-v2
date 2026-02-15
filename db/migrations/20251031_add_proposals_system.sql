-- PHASE 3 SPRINT 3: AI Proposals & Claims Packets System
-- Migration: Add ProposalDraft and ProposalFile tables

-- Create proposal_drafts table
CREATE TABLE IF NOT EXISTS proposal_drafts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  packet_type TEXT NOT NULL, -- 'retail' | 'claims'
  context_json JSONB NOT NULL, -- normalized ProposalContext
  ai_summary TEXT,
  ai_scope TEXT,
  ai_terms TEXT,
  ai_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | rendered | published
  template TEXT, -- 'retail/v1' | 'claims/v1'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for proposal_drafts
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_org_id ON proposal_drafts(org_id);
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_user_id ON proposal_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_lead_id ON proposal_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_job_id ON proposal_drafts(job_id);
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_status ON proposal_drafts(status);
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_packet_type ON proposal_drafts(packet_type);

-- Create proposal_files table
CREATE TABLE IF NOT EXISTS proposal_files (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposal_drafts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- 'pdf' | 'cover' | 'attachment'
  url TEXT NOT NULL,
  pages INTEGER,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for proposal_files
CREATE INDEX IF NOT EXISTS idx_proposal_files_proposal_id ON proposal_files(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_files_kind ON proposal_files(kind);

-- Create trigger for updated_at on proposal_drafts
CREATE OR REPLACE FUNCTION update_proposal_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposal_drafts_updated_at
  BEFORE UPDATE ON proposal_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_drafts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE proposal_drafts IS 'AI-generated proposal drafts (retail proposals and claims-ready packets)';
COMMENT ON TABLE proposal_files IS 'Generated PDF files and attachments for proposals';
COMMENT ON COLUMN proposal_drafts.context_json IS 'Normalized snapshot of org branding, client, job, evidence, weather, DOL';
COMMENT ON COLUMN proposal_drafts.packet_type IS 'retail = sales proposal, claims = carrier-ready packet';
COMMENT ON COLUMN proposal_drafts.status IS 'draft = editable, rendered = PDF generated, published = locked and shared';
COMMENT ON COLUMN proposal_files.kind IS 'pdf = main document, cover = standalone cover page, attachment = supporting docs';
