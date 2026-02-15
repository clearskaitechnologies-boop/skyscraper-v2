-- Migration: Add Elite Claim Intake Fields for Phase C
-- Created: December 6, 2025
-- Purpose: Enable professional claim intake wizard with property details, policy info, and workflow intelligence

-- Add elite intake fields to claims table
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS loss_type TEXT DEFAULT 'UNKNOWN',
  ADD COLUMN IF NOT EXISTS structure_type TEXT,
  ADD COLUMN IF NOT EXISTS roof_type TEXT,
  ADD COLUMN IF NOT EXISTS stories INTEGER,
  ADD COLUMN IF NOT EXISTS slope TEXT,
  ADD COLUMN IF NOT EXISTS square_footage INTEGER,
  ADD COLUMN IF NOT EXISTS agent_name TEXT,
  ADD COLUMN IF NOT EXISTS next_action TEXT;

-- Add indexes for filtering and performance
CREATE INDEX IF NOT EXISTS idx_claims_loss_type ON claims(loss_type);
CREATE INDEX IF NOT EXISTS idx_claims_roof_type ON claims(roof_type);
CREATE INDEX IF NOT EXISTS idx_claims_structure_type ON claims(structure_type);

-- Add comments for documentation
COMMENT ON COLUMN claims.loss_type IS 'Type of damage: HAIL, WIND, WATER, FIRE, UNKNOWN';
COMMENT ON COLUMN claims.structure_type IS 'Building type: SINGLE_FAMILY, DUPLEX, MULTI_FAMILY, COMMERCIAL, MOBILE_HOME, OTHER';
COMMENT ON COLUMN claims.roof_type IS 'Roof material: SHINGLE, TILE, METAL, TPO, FOAM, MODBIT, OTHER';
COMMENT ON COLUMN claims.stories IS 'Number of stories in structure';
COMMENT ON COLUMN claims.slope IS 'Roof pitch/slope (e.g. 4/12, flat)';
COMMENT ON COLUMN claims.square_footage IS 'Approximate square footage of structure';
COMMENT ON COLUMN claims.agent_name IS 'Insurance agent or carrier contact name';
COMMENT ON COLUMN claims.next_action IS 'Next workflow step for this claim';

-- Note: policy_number, carrier, deductible already exist in claims table
-- These were added in previous migrations and are compatible with Phase C
