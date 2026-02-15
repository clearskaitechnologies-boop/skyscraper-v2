-- PHASE 3: Add source tracking to claims table
-- Tracks where claim originated: portal, manual, import

ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

COMMENT ON COLUMN claims.source IS 'Origin of claim: portal (client portal), manual (pro dashboard), import (data import)';
