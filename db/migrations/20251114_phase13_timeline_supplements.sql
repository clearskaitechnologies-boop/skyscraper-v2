-- ============================================================================
-- PHASE 13.2 & 13.3: AI PHOTO TIMELINE & SUPPLEMENT BUILDER
-- Migration: Enhanced photo tracking, timeline generation, supplement detection
-- Date: November 14, 2025
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PART 1: ENHANCE completion_photos TABLE
-- Add AI analysis fields, timeline ordering, supplement detection
-- ----------------------------------------------------------------------------

ALTER TABLE completion_photos
  ADD COLUMN IF NOT EXISTS timestamp_guess TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS build_stage TEXT,
  ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS supplement_flags JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS timeline_order INTEGER;

-- Add comment for build_stage values
COMMENT ON COLUMN completion_photos.build_stage IS 
  'Build stage classification: tearoff, deck_inspection, midbuild, underlayment, flashings, shingle_install, completion, cleanup';

-- Create index for timeline ordering
CREATE INDEX IF NOT EXISTS idx_completion_photos_timeline_order 
  ON completion_photos(claim_id, timeline_order);

-- Create index for build stage filtering
CREATE INDEX IF NOT EXISTS idx_completion_photos_build_stage 
  ON completion_photos(claim_id, build_stage);

-- Create GIN index for supplement_flags JSONB queries
CREATE INDEX IF NOT EXISTS idx_completion_photos_supplement_flags 
  ON completion_photos USING GIN (supplement_flags);

-- ----------------------------------------------------------------------------
-- PART 2: CREATE completion_timeline TABLE
-- Stores AI-generated timelines with narratives and supplement opportunities
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS completion_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timeline Data
  timeline JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ stage, order, description, photoIds, aiNarrative, detectedItems }]
  
  -- Supplement Opportunities
  supplements JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ item, severity, reason, photoId, recommendedLineItem, estimatedCost }]
  
  -- Build Narrative (AI-generated story)
  narrative_text TEXT,
  narrative_version TEXT DEFAULT 'carrier', -- carrier, homeowner, attorney
  
  -- AI Analysis Metadata
  ai_model_version TEXT,
  ai_confidence_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  total_photos_analyzed INTEGER,
  
  -- Detection Stats
  total_supplements_detected INTEGER DEFAULT 0,
  high_severity_count INTEGER DEFAULT 0,
  medium_severity_count INTEGER DEFAULT 0,
  low_severity_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, finalized, sent_to_adjuster
  finalized_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_completion_timeline_claim 
  ON completion_timeline(claim_id);

CREATE INDEX idx_completion_timeline_org 
  ON completion_timeline(organization_id);

CREATE INDEX idx_completion_timeline_status 
  ON completion_timeline(status);

-- GIN indexes for JSONB queries
CREATE INDEX idx_completion_timeline_timeline 
  ON completion_timeline USING GIN (timeline);

CREATE INDEX idx_completion_timeline_supplements 
  ON completion_timeline USING GIN (supplements);

-- Comments
COMMENT ON TABLE completion_timeline IS 
  'AI-generated build timelines with photo analysis, narratives, and supplement detection';

COMMENT ON COLUMN completion_timeline.timeline IS 
  'Ordered array of build stages with photos and AI descriptions';

COMMENT ON COLUMN completion_timeline.supplements IS 
  'Auto-detected supplement opportunities with photo proof and justifications';

-- ----------------------------------------------------------------------------
-- PART 3: CREATE supplement_requests TABLE
-- Tracks supplement packages sent to carriers
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS supplement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES completion_timeline(id) ON DELETE SET NULL,
  
  -- Reference to financial analysis (if exists)
  financial_snapshot_id UUID,
  -- TODO: Add FK when ai_financial_reports table exists
  
  -- Supplement Data
  supplement JSONB NOT NULL DEFAULT '{}',
  -- Structure: { totalAddedRCV, items: [{ code, description, qty, unit, unitCost, total, reason, photoProof }] }
  
  -- Packet Data (for PDF generation)
  packet JSONB NOT NULL DEFAULT '{}',
  -- Structure: { executiveSummary, itemizedList, codeCitations, timelineEvidence, photoAppendix }
  
  -- Supplement Metadata
  supplement_number TEXT, -- User-friendly number like "SUPP-001"
  supplement_date DATE DEFAULT CURRENT_DATE,
  
  -- Financial Summary
  total_added_rcv DECIMAL(10, 2),
  total_items_count INTEGER DEFAULT 0,
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'DRAFT',
  -- Status values: DRAFT, READY, SENT, UNDER_REVIEW, APPROVED, PARTIAL, DENIED, WITHDRAWN
  
  -- Approval Tracking
  sent_at TIMESTAMPTZ,
  sent_to TEXT, -- Email/adjuster name
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  
  -- Approval Details
  approved_amount DECIMAL(10, 2), -- If partially approved
  denial_reason TEXT,
  adjuster_notes TEXT,
  
  -- PDF & Email
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_supplement_requests_claim 
  ON supplement_requests(claim_id);

CREATE INDEX idx_supplement_requests_org 
  ON supplement_requests(organization_id);

CREATE INDEX idx_supplement_requests_timeline 
  ON supplement_requests(timeline_id);

CREATE INDEX idx_supplement_requests_status 
  ON supplement_requests(status);

CREATE INDEX idx_supplement_requests_sent_at 
  ON supplement_requests(sent_at);

-- GIN indexes for JSONB
CREATE INDEX idx_supplement_requests_supplement 
  ON supplement_requests USING GIN (supplement);

CREATE INDEX idx_supplement_requests_packet 
  ON supplement_requests USING GIN (packet);

-- Unique constraint for supplement number per org
CREATE UNIQUE INDEX idx_supplement_requests_number 
  ON supplement_requests(organization_id, supplement_number) 
  WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE supplement_requests IS 
  'AI-generated supplement requests with photo proof, code citations, and carrier-ready packets';

COMMENT ON COLUMN supplement_requests.status IS 
  'Lifecycle: DRAFT → READY → SENT → UNDER_REVIEW → APPROVED/PARTIAL/DENIED';

COMMENT ON COLUMN supplement_requests.supplement IS 
  'Complete supplement data with line items, quantities, costs, and photo proof';

COMMENT ON COLUMN supplement_requests.packet IS 
  'Carrier-ready packet with executive summary, code citations, and evidence';

-- ----------------------------------------------------------------------------
-- PART 4: CREATE supplement_line_items TABLE
-- Individual line items for easier querying and reporting
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS supplement_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_request_id UUID NOT NULL REFERENCES supplement_requests(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  
  -- Line Item Details
  item_code TEXT, -- Xactimate code like "RFG IWS"
  description TEXT NOT NULL,
  category TEXT, -- tearoff, decking, underlayment, flashings, shingles, etc.
  
  -- Quantities & Pricing
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- SQ, LF, SF, EA
  unit_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  
  -- Justification
  reason TEXT NOT NULL,
  code_citations JSONB DEFAULT '[]', -- IRC codes, manufacturer specs
  photo_proof JSONB DEFAULT '[]', -- Array of photo IDs
  
  -- Detection Info
  detected_by TEXT DEFAULT 'ai', -- ai, manual, timeline, damage_builder
  confidence_score DECIMAL(5, 4), -- AI confidence
  severity TEXT, -- HIGH, MEDIUM, LOW
  
  -- Approval Status
  status TEXT DEFAULT 'pending', -- pending, approved, partial, denied
  approved_quantity DECIMAL(10, 2),
  approved_amount DECIMAL(10, 2),
  denial_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_supplement_line_items_request 
  ON supplement_line_items(supplement_request_id);

CREATE INDEX idx_supplement_line_items_claim 
  ON supplement_line_items(claim_id);

CREATE INDEX idx_supplement_line_items_category 
  ON supplement_line_items(category);

CREATE INDEX idx_supplement_line_items_status 
  ON supplement_line_items(status);

-- GIN indexes
CREATE INDEX idx_supplement_line_items_code_citations 
  ON supplement_line_items USING GIN (code_citations);

CREATE INDEX idx_supplement_line_items_photo_proof 
  ON supplement_line_items USING GIN (photo_proof);

-- Comments
COMMENT ON TABLE supplement_line_items IS 
  'Individual line items from supplement requests for detailed tracking and reporting';

-- ----------------------------------------------------------------------------
-- PART 5: TRIGGERS FOR AUTO-UPDATING
-- ----------------------------------------------------------------------------

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_phase13_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Completion timeline trigger
DROP TRIGGER IF EXISTS update_completion_timeline_timestamp ON completion_timeline;
CREATE TRIGGER update_completion_timeline_timestamp
  BEFORE UPDATE ON completion_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_phase13_timestamp();

-- Supplement requests trigger
DROP TRIGGER IF EXISTS update_supplement_requests_timestamp ON supplement_requests;
CREATE TRIGGER update_supplement_requests_timestamp
  BEFORE UPDATE ON supplement_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_phase13_timestamp();

-- Supplement line items trigger
DROP TRIGGER IF EXISTS update_supplement_line_items_timestamp ON supplement_line_items;
CREATE TRIGGER update_supplement_line_items_timestamp
  BEFORE UPDATE ON supplement_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_phase13_timestamp();

-- Auto-calculate total_added_rcv and item count for supplement requests
CREATE OR REPLACE FUNCTION calculate_supplement_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract total from supplement JSONB
  NEW.total_added_rcv = COALESCE(
    (NEW.supplement->>'totalAddedRCV')::DECIMAL(10, 2),
    0
  );
  
  -- Count items
  NEW.total_items_count = COALESCE(
    jsonb_array_length(NEW.supplement->'items'),
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_supplement_totals_trigger ON supplement_requests;
CREATE TRIGGER calculate_supplement_totals_trigger
  BEFORE INSERT OR UPDATE ON supplement_requests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_supplement_totals();

-- Auto-calculate detection stats for completion timeline
CREATE OR REPLACE FUNCTION calculate_timeline_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Count total supplements
  NEW.total_supplements_detected = COALESCE(
    jsonb_array_length(NEW.supplements),
    0
  );
  
  -- Count by severity (requires iterating through JSONB array)
  NEW.high_severity_count = (
    SELECT COUNT(*)
    FROM jsonb_array_elements(NEW.supplements) elem
    WHERE elem->>'severity' = 'HIGH'
  );
  
  NEW.medium_severity_count = (
    SELECT COUNT(*)
    FROM jsonb_array_elements(NEW.supplements) elem
    WHERE elem->>'severity' = 'MEDIUM'
  );
  
  NEW.low_severity_count = (
    SELECT COUNT(*)
    FROM jsonb_array_elements(NEW.supplements) elem
    WHERE elem->>'severity' = 'LOW'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_timeline_stats_trigger ON completion_timeline;
CREATE TRIGGER calculate_timeline_stats_trigger
  BEFORE INSERT OR UPDATE ON completion_timeline
  FOR EACH ROW
  EXECUTE FUNCTION calculate_timeline_stats();

-- ----------------------------------------------------------------------------
-- PART 6: HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to generate supplement number
CREATE OR REPLACE FUNCTION generate_supplement_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN supplement_number ~ '^SUPP-[0-9]+$' 
      THEN CAST(SUBSTRING(supplement_number FROM 'SUPP-([0-9]+)') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_num
  FROM supplement_requests
  WHERE organization_id = org_id
    AND deleted_at IS NULL;
  
  RETURN 'SUPP-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_supplement_number IS 
  'Generates next supplement number for an organization (SUPP-001, SUPP-002, etc.)';

-- ----------------------------------------------------------------------------
-- PART 7: SAMPLE DATA & VIEWS (for development)
-- ----------------------------------------------------------------------------

-- View for supplement request summary
CREATE OR REPLACE VIEW supplement_request_summary AS
SELECT 
  sr.id,
  sr.supplement_number,
  sr.claim_id,
  c.claim_number,
  sr.status,
  sr.total_added_rcv,
  sr.total_items_count,
  sr.sent_at,
  sr.approved_at,
  sr.denied_at,
  sr.created_at,
  -- Timeline info
  ct.total_supplements_detected as timeline_supplements,
  ct.high_severity_count,
  -- Claim info
  c.property_address,
  c.insured_name,
  c.carrier
FROM supplement_requests sr
LEFT JOIN completion_timeline ct ON sr.timeline_id = ct.id
LEFT JOIN claims c ON sr.claim_id = c.id
WHERE sr.deleted_at IS NULL;

COMMENT ON VIEW supplement_request_summary IS 
  'Summary view of supplement requests with claim and timeline data';

-- ----------------------------------------------------------------------------
-- PART 8: GRANT PERMISSIONS (adjust for your auth setup)
-- ----------------------------------------------------------------------------

-- Grant permissions to authenticated users (adjust role name as needed)
-- GRANT ALL ON completion_timeline TO authenticated;
-- GRANT ALL ON supplement_requests TO authenticated;
-- GRANT ALL ON supplement_line_items TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- Phase 13.2 & 13.3 database foundation ready
-- Next: Build AI engines (timelineEngine.ts, supplementFromTimeline.ts)
-- ============================================================================
