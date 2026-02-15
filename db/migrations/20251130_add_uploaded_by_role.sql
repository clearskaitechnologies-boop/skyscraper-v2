-- Add uploadedByRole to claim_documents to track who uploaded (CLIENT vs PRO)
ALTER TABLE claim_documents 
ADD COLUMN IF NOT EXISTS "uploadedByRole" TEXT DEFAULT 'PRO';

-- Add index for filtering by role
CREATE INDEX IF NOT EXISTS idx_claim_documents_uploaded_by_role 
ON claim_documents("uploadedByRole");

-- Comment for clarity
COMMENT ON COLUMN claim_documents."uploadedByRole" IS 'Role of uploader: CLIENT | PRO | SYSTEM';
