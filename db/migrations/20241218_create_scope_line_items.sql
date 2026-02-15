-- COMMIT 15: Scope Line Items for Estimate Import
-- Creates scope_line_items table for normalized adjuster/contractor estimates

CREATE TABLE scope_line_items (
  id VARCHAR(30) PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,
  claim_id VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'ADJUSTER' or 'CONTRACTOR'
  import_id VARCHAR(30), -- Groups items from same import batch
  category VARCHAR(100) NOT NULL, -- Normalized: ROOFING, GUTTERS, SIDING, etc.
  description TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) NOT NULL, -- SQ, LF, EA, etc.
  unit_price DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  original_code VARCHAR(50), -- Xactimate code (e.g., RFG COMP 30)
  metadata JSONB, -- Original import data, custom fields
  matched_item_id VARCHAR(30), -- Foreign key to opposing source item
  match_score DOUBLE PRECISION, -- Confidence 0-1 for auto-match
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_scope_line_items_org_claim_source ON scope_line_items(org_id, claim_id, source);
CREATE INDEX idx_scope_line_items_claim_source ON scope_line_items(claim_id, source);
CREATE INDEX idx_scope_line_items_import_id ON scope_line_items(import_id);

-- Comments for documentation
COMMENT ON TABLE scope_line_items IS 'Normalized line items from adjuster and contractor estimates';
COMMENT ON COLUMN scope_line_items.source IS 'ADJUSTER = from insurance company estimate, CONTRACTOR = from contractor bid';
COMMENT ON COLUMN scope_line_items.import_id IS 'UUID grouping items from same CSV/XML import batch';
COMMENT ON COLUMN scope_line_items.category IS 'Normalized category for matching (ROOFING, GUTTERS, SIDING, WINDOWS, DOORS, INTERIOR, EXTERIOR, HVAC, PLUMBING, ELECTRICAL, OTHER)';
COMMENT ON COLUMN scope_line_items.matched_item_id IS 'Links to opposing source item (adjuster item matched to contractor item)';
COMMENT ON COLUMN scope_line_items.match_score IS 'Auto-match confidence 0-1 (>0.8 = high confidence, <0.5 = manual review)';
COMMENT ON COLUMN scope_line_items.original_code IS 'Preserve original codes from Xactimate, Symbility, etc. for reference';
