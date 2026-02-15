-- Add pipeline_stage column to claims table
-- This column tracks the lifecycle stage: CLAIMS | CONSTRUCTION | COMPLETED

ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'CLAIMS';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_claims_pipeline_stage ON claims(pipeline_stage);

-- Update existing claims to CLAIMS stage
UPDATE claims 
SET pipeline_stage = 'CLAIMS' 
WHERE pipeline_stage IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN claims.pipeline_stage IS 'Tracks claim lifecycle: CLAIMS (active claim processing) | CONSTRUCTION (repair work in progress) | COMPLETED (closed/archived)';
