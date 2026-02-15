-- ============================================================================
-- EVIDENCE PIPELINE - PHOTO & DOCUMENT MANAGEMENT
-- Secure storage and organization of claim evidence with signed URL access
-- ============================================================================

-- Evidence assets: individual photos, videos, documents
CREATE TABLE IF NOT EXISTS evidence_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  claim_id UUID NOT NULL,
  
  -- File information
  file_name VARCHAR(255) NOT NULL, -- UUID-based safe filename
  original_name VARCHAR(255) NOT NULL, -- User's original filename
  storage_path TEXT NOT NULL, -- Full path in storage bucket
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  -- Upload tracking
  uploaded_by VARCHAR(255) NOT NULL, -- Clerk user ID
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- User metadata
  title VARCHAR(255),
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB, -- EXIF, geolocation, camera info, etc.
  
  -- Thumbnail for quick preview
  thumbnail_path TEXT
);

-- Evidence collections: organize assets into report sections
CREATE TABLE IF NOT EXISTS evidence_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  org_id UUID NOT NULL,
  
  -- Section mapping (matches report template sections)
  section_key VARCHAR(100) NOT NULL, -- roof, siding, gutters, interior, etc.
  title VARCHAR(255) NOT NULL,
  order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One collection per section per claim
  UNIQUE(claim_id, section_key)
);

-- Evidence collection items: many-to-many with ordering
CREATE TABLE IF NOT EXISTS evidence_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES evidence_collections(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES evidence_assets(id) ON DELETE CASCADE,
  
  -- Drag-and-drop ordering within section
  "order" INT DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Asset can only be in a collection once
  UNIQUE(collection_id, asset_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_assets_org_id ON evidence_assets(org_id);
CREATE INDEX IF NOT EXISTS idx_evidence_assets_claim_id ON evidence_assets(claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_assets_uploaded_at ON evidence_assets(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_collections_claim_id ON evidence_collections(claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_collections_org_id ON evidence_collections(org_id);

CREATE INDEX IF NOT EXISTS idx_evidence_collection_items_collection_id ON evidence_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_evidence_collection_items_asset_id ON evidence_collection_items(asset_id);

-- Storage path format: evidence/{orgId}/{claimId}/{yyyy-mm}/{assetId}-{sanitizedOriginalName}
-- Example: evidence/org_123/claim_456/2024-12/uuid-roof-damage.jpg

-- Security:
-- 1. All queries must filter by org_id (RLS enforcement)
-- 2. Signed URLs expire after configurable TTL (default 7 days)
-- 3. Storage bucket requires authentication
-- 4. UUID-based filenames prevent enumeration

COMMENT ON TABLE evidence_assets IS 'Individual evidence files (photos, videos, docs) for claims';
COMMENT ON TABLE evidence_collections IS 'Organizational buckets for evidence by report section';
COMMENT ON TABLE evidence_collection_items IS 'Join table linking assets to collections with ordering';

COMMENT ON COLUMN evidence_assets.storage_path IS 'Full path in Supabase Storage bucket: evidence/{orgId}/{claimId}/{yyyy-mm}/{assetId}-{original}';
COMMENT ON COLUMN evidence_assets.metadata IS 'EXIF data, geolocation, camera info, dimensions, etc.';
COMMENT ON COLUMN evidence_collections.section_key IS 'Maps to report template section keys (roof, siding, gutters, etc.)';
