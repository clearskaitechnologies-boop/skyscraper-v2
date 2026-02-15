-- Migration: Add DocumentQuestion table for AI Q&A on claim documents
-- Date: 2025-11-30

CREATE TABLE IF NOT EXISTS document_questions (
  id TEXT PRIMARY KEY,
  claim_document_id TEXT NOT NULL REFERENCES claim_documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  asked_by_user_id TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by document
CREATE INDEX IF NOT EXISTS idx_document_questions_claim_document_id 
  ON document_questions(claim_document_id);

-- Index for user history
CREATE INDEX IF NOT EXISTS idx_document_questions_asked_by_user_id 
  ON document_questions(asked_by_user_id);

COMMENT ON TABLE document_questions IS 'Stores AI-powered Q&A about specific claim documents';
COMMENT ON COLUMN document_questions.claim_document_id IS 'FK to claim_documents - which doc the question is about';
COMMENT ON COLUMN document_questions.asked_by_user_id IS 'Clerk userId who asked the question (pro or client)';
COMMENT ON COLUMN document_questions.answered_at IS 'When AI generated the answer';
