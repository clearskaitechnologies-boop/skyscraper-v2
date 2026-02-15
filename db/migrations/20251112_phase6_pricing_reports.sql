-- Phase 6: Pricing & Reports Infrastructure
-- Add data sheet URL support and ensure snake_case columns

-- 1. Add data_sheet_url to vendor_product
ALTER TABLE app."VendorProduct"
ADD COLUMN IF NOT EXISTS data_sheet_url TEXT;

COMMENT ON COLUMN app."VendorProduct".data_sheet_url IS 'URL to product data sheet/spec document';

-- 2. Create vendor_prices table for pricing data
CREATE TABLE IF NOT EXISTS app.vendor_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  market VARCHAR(10) NOT NULL DEFAULT 'US',
  unit VARCHAR(20) NOT NULL DEFAULT 'ea',
  price BIGINT NOT NULL, -- Price in cents
  source VARCHAR(20) NOT NULL, -- 'manual', 'ai', 'scrape'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_prices_product_market 
  ON app.vendor_prices(product_id, market);

CREATE INDEX IF NOT EXISTS idx_vendor_prices_updated 
  ON app.vendor_prices(updated_at DESC);

COMMENT ON TABLE app.vendor_prices IS 'Product pricing data from various sources';
COMMENT ON COLUMN app.vendor_prices.price IS 'Price in cents (e.g., 1299 = $12.99)';
COMMENT ON COLUMN app.vendor_prices.source IS 'manual (user entered), ai (LLM estimate), scrape (vendor site)';

-- 3. Ensure trades_feed_engagement uses snake_case (if table exists with wrong names)
-- This is handled by Prisma @map directives, but we can add a comment
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'app' AND table_name = 'TradesFeedEngagement'
  ) THEN
    COMMENT ON TABLE app."TradesFeedEngagement" IS 'Engagement tracking for trades network posts - uses snake_case columns via Prisma mapping';
  END IF;
END$$;

-- 4. Create storage buckets policy (this is informational - buckets must be created in Supabase UI)
-- Bucket names:
--   - reports-claims
--   - reports-retail
-- Policies: Allow authenticated users to upload/read their org's reports

-- 5. Add updated_at trigger for vendor_prices
CREATE OR REPLACE FUNCTION app.update_vendor_prices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendor_prices_updated_at ON app.vendor_prices;
CREATE TRIGGER vendor_prices_updated_at
  BEFORE UPDATE ON app.vendor_prices
  FOR EACH ROW
  EXECUTE FUNCTION app.update_vendor_prices_timestamp();

-- 6. Add indexes for report generation queries
CREATE INDEX IF NOT EXISTS idx_claim_material_claim_id 
  ON app."ClaimMaterial"(claim_id);

CREATE INDEX IF NOT EXISTS idx_retail_estimate_item_estimate_id 
  ON app."RetailEstimateItem"(estimate_id);

COMMENT ON INDEX app.idx_claim_material_claim_id IS 'Optimize PDF report generation for claims';
COMMENT ON INDEX app.idx_retail_estimate_item_estimate_id IS 'Optimize PDF report generation for retail estimates';
