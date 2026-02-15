-- Phase 3.6: Add claim_memory_chunks table for semantic search
-- Migration: add_claim_memory_chunks
-- Created: 2025-11-26

CREATE TABLE IF NOT EXISTS claim_memory_chunks (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    claim_id TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'document' | 'note' | 'letter' | 'email' | 'estimate' | 'photo_caption' | 'other'
    source_id TEXT, -- Reference to source record (claim_documents.id, etc)
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding BYTEA NOT NULL, -- Vector stored as bytea (float32 array)
    metadata JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS claim_memory_chunks_org_claim_idx ON claim_memory_chunks (org_id, claim_id);
CREATE INDEX IF NOT EXISTS claim_memory_chunks_claim_source_idx ON claim_memory_chunks (claim_id, source_type);
CREATE INDEX IF NOT EXISTS claim_memory_chunks_source_id_idx ON claim_memory_chunks (source_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_claim_memory_chunks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER claim_memory_chunks_updated_at
    BEFORE UPDATE ON claim_memory_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_claim_memory_chunks_updated_at();

-- Comments for documentation
COMMENT ON TABLE claim_memory_chunks IS 'Phase 3.6: Vectorized claim memory for semantic search and Copilot retrieval';
COMMENT ON COLUMN claim_memory_chunks.embedding IS 'Float32 vector stored as bytea (3072 dimensions for text-embedding-3-large)';
COMMENT ON COLUMN claim_memory_chunks.source_type IS 'Type of source document: document, note, letter, email, estimate, photo_caption, other';
COMMENT ON COLUMN claim_memory_chunks.metadata IS 'Additional context: chunkIndex, totalChunks, tokenEstimate, documentUrl, ocrConfidence, etc';
