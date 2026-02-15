-- ============================================================================
-- BRIDGE EXISTING TABLES TO GENERATED DOCUMENTS
-- Add generatedDocumentId to proposals and contractor_packets
-- ============================================================================

-- Add bridge to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS generated_document_id UUID REFERENCES generated_documents(id);

CREATE INDEX IF NOT EXISTS idx_proposals_generated_document_id 
ON proposals(generated_document_id) WHERE generated_document_id IS NOT NULL;

-- Add bridge to contractor_packets table
ALTER TABLE contractor_packets 
ADD COLUMN IF NOT EXISTS generated_document_id UUID REFERENCES generated_documents(id);

CREATE INDEX IF NOT EXISTS idx_contractor_packets_generated_document_id 
ON contractor_packets(generated_document_id) WHERE generated_document_id IS NOT NULL;

COMMENT ON COLUMN proposals.generated_document_id IS 'Link to canonical generated_documents record';
COMMENT ON COLUMN contractor_packets.generated_document_id IS 'Link to canonical generated_documents record';
