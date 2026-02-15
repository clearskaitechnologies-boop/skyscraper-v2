-- ============================================================================
-- CANONICAL GENERATED DOCUMENTS - VERSIONING & HISTORY
-- Single source of truth for all AI-generated documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  
  -- Document classification
  type VARCHAR(50) NOT NULL, -- PROPOSAL, PACKET, CLAIM_MASTER, SUPPLEMENT, REBUTTAL
  version INT NOT NULL DEFAULT 1, -- v1, v2, v3...
  
  -- Parent relationships
  claim_id UUID, -- Link to claims table
  proposal_id UUID, -- Link to proposals table (if applicable)
  parent_document_id UUID, -- For supplements/rebuttals (points to original doc)
  template_id UUID, -- Link to report_templates
  
  -- Document metadata
  document_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Generation status
  status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, generating, ready, signed, error
  
  -- Storage
  file_url TEXT, -- Storage path or signed URL
  file_format VARCHAR(10) DEFAULT 'pdf', -- pdf, docx, zip
  file_size_bytes BIGINT,
  checksum VARCHAR(64), -- SHA-256 of file for integrity
  
  -- Content snapshot
  generated_content JSONB, -- Full generation payload
  sections TEXT[], -- Section keys included
  
  -- AI usage
  tokens_used INT DEFAULT 0,
  estimated_cost_cents INT DEFAULT 0,
  
  -- Signing
  signed_at TIMESTAMPTZ,
  signed_by VARCHAR(255), -- User ID who signed
  signature_hash VARCHAR(128), -- Cryptographic signature
  is_immutable BOOLEAN DEFAULT FALSE, -- TRUE after signing
  
  -- Error handling
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  -- Audit trail
  created_by VARCHAR(255) NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure version uniqueness per parent
  UNIQUE(claim_id, type, version),
  UNIQUE(proposal_id, type, version)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_documents_org_id ON generated_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_claim_id ON generated_documents(claim_id) WHERE claim_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_generated_documents_proposal_id ON generated_documents(proposal_id) WHERE proposal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(type);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON generated_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_documents_parent ON generated_documents(parent_document_id) WHERE parent_document_id IS NOT NULL;

-- Version constraint: ensure versions increment properly
CREATE OR REPLACE FUNCTION check_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modifying immutable (signed) documents
  IF TG_OP = 'UPDATE' AND OLD.is_immutable = TRUE AND OLD.status = 'signed' THEN
    RAISE EXCEPTION 'Cannot modify signed/immutable document';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_document_immutability
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION check_document_version();

COMMENT ON TABLE generated_documents IS 'Canonical record for all AI-generated documents with versioning and signing';
