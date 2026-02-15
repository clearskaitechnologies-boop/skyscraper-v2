-- Migration: Enhance Document Signatures Table
-- Date: 2024-12-16
-- Purpose: Add tamper detection and audit trail fields

CREATE TABLE IF NOT EXISTS document_signatures (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CLIENT', 'CONTRACTOR', 'ADJUSTER')),
  signature TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  checksum TEXT NOT NULL,
  
  FOREIGN KEY (document_id) REFERENCES generated_documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_signer_email ON document_signatures(signer_email);

COMMENT ON TABLE document_signatures IS 'Signatures for generated documents with tamper detection';
COMMENT ON COLUMN document_signatures.checksum IS 'Document hash at time of signing - must match generated_documents.checksum';
COMMENT ON COLUMN document_signatures.ip_address IS 'Signer IP address for audit trail';
COMMENT ON COLUMN document_signatures.role IS 'Signing party role for multi-party signing workflows';
