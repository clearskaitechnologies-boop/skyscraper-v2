-- ============================================================================
-- Trade Reviews & Pro Engagement System
-- Created: 2026-01-29
-- Purpose: Enable client reviews of contractors and engagement-based ranking
-- ============================================================================

-- Trade Reviews Table
-- Stores client reviews of contractors/pros
CREATE TABLE IF NOT EXISTS trade_reviews (
  id               TEXT PRIMARY KEY,
  contractor_id    UUID NOT NULL REFERENCES trades_company_members(id) ON DELETE CASCADE,
  client_id        TEXT NOT NULL REFERENCES "Client"(id) ON DELETE CASCADE,
  
  -- Review content
  rating           INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title            TEXT,
  comment          TEXT NOT NULL,
  
  -- Job context
  job_type         TEXT,
  project_cost     TEXT,
  
  -- Verification & status
  verified         BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'published',
  helpful          INT NOT NULL DEFAULT 0,
  
  -- Pro response
  pro_response     TEXT,
  responded_at     TIMESTAMPTZ,
  
  -- Imported review tracking
  import_source    TEXT,
  external_id      TEXT,
  
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One review per client per contractor
  CONSTRAINT trade_reviews_client_contractor_unique UNIQUE (contractor_id, client_id),
  -- Prevent duplicate imports
  CONSTRAINT trade_reviews_import_unique UNIQUE (import_source, external_id)
);

-- Indexes for trade_reviews
CREATE INDEX IF NOT EXISTS idx_trade_reviews_contractor ON trade_reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_trade_reviews_client ON trade_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_trade_reviews_rating ON trade_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_trade_reviews_status ON trade_reviews(status);

COMMENT ON TABLE trade_reviews IS 'Client reviews of contractors/pros in the trades network';
COMMENT ON COLUMN trade_reviews.import_source IS 'Source of imported review: google, facebook, yelp, or null for native reviews';
COMMENT ON COLUMN trade_reviews.verified IS 'True if review is verified from a completed job';

-- Pro Engagement Metrics Table
-- Tracks engagement for search ranking
CREATE TABLE IF NOT EXISTS pro_engagement (
  id               TEXT PRIMARY KEY,
  contractor_id    UUID NOT NULL UNIQUE REFERENCES trades_company_members(id) ON DELETE CASCADE,
  
  -- Engagement counts
  profile_views    INT NOT NULL DEFAULT 0,
  search_appears   INT NOT NULL DEFAULT 0,
  card_clicks      INT NOT NULL DEFAULT 0,
  saves            INT NOT NULL DEFAULT 0,
  messages_sent    INT NOT NULL DEFAULT 0,
  connect_requests INT NOT NULL DEFAULT 0,
  
  -- Calculated score
  engagement_score FLOAT NOT NULL DEFAULT 0,
  last_calculated  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for sorting by engagement
CREATE INDEX IF NOT EXISTS idx_pro_engagement_score ON pro_engagement(engagement_score DESC);

COMMENT ON TABLE pro_engagement IS 'Engagement metrics for pro search ranking';

-- Function to update engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  p_profile_views INT,
  p_search_appears INT,
  p_card_clicks INT,
  p_saves INT,
  p_messages_sent INT,
  p_connect_requests INT
) RETURNS FLOAT AS $$
BEGIN
  -- Weighted scoring:
  -- Profile views: 1 point
  -- Search appears: 0.1 points (high volume, low signal)
  -- Card clicks: 2 points
  -- Saves: 5 points
  -- Messages: 10 points
  -- Connect requests: 15 points
  RETURN (
    p_profile_views * 1.0 +
    p_search_appears * 0.1 +
    p_card_clicks * 2.0 +
    p_saves * 5.0 +
    p_messages_sent * 10.0 +
    p_connect_requests * 15.0
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update engagement score
CREATE OR REPLACE FUNCTION update_engagement_score() RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_score := calculate_engagement_score(
    NEW.profile_views,
    NEW.search_appears,
    NEW.card_clicks,
    NEW.saves,
    NEW.messages_sent,
    NEW.connect_requests
  );
  NEW.last_calculated := NOW();
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_engagement_score ON pro_engagement;
CREATE TRIGGER trg_update_engagement_score
  BEFORE INSERT OR UPDATE OF profile_views, search_appears, card_clicks, saves, messages_sent, connect_requests
  ON pro_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_engagement_score();

-- Add average rating and review count to trades_company_members if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trades_company_members' AND column_name = 'avg_rating'
  ) THEN
    ALTER TABLE trades_company_members ADD COLUMN avg_rating FLOAT DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trades_company_members' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE trades_company_members ADD COLUMN review_count INT DEFAULT 0;
  END IF;
END $$;

-- Function to update contractor rating stats
CREATE OR REPLACE FUNCTION update_contractor_rating_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE trades_company_members 
    SET 
      avg_rating = COALESCE((
        SELECT AVG(rating)::FLOAT FROM trade_reviews 
        WHERE contractor_id = OLD.contractor_id AND status = 'published'
      ), 0),
      review_count = (
        SELECT COUNT(*) FROM trade_reviews 
        WHERE contractor_id = OLD.contractor_id AND status = 'published'
      )
    WHERE id = OLD.contractor_id;
    RETURN OLD;
  ELSE
    UPDATE trades_company_members 
    SET 
      avg_rating = COALESCE((
        SELECT AVG(rating)::FLOAT FROM trade_reviews 
        WHERE contractor_id = NEW.contractor_id AND status = 'published'
      ), 0),
      review_count = (
        SELECT COUNT(*) FROM trade_reviews 
        WHERE contractor_id = NEW.contractor_id AND status = 'published'
      )
    WHERE id = NEW.contractor_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_contractor_rating ON trade_reviews;
CREATE TRIGGER trg_update_contractor_rating
  AFTER INSERT OR UPDATE OR DELETE
  ON trade_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_contractor_rating_stats();

-- Verification
DO $$ BEGIN
  RAISE NOTICE '✅ trade_reviews table created';
  RAISE NOTICE '✅ pro_engagement table created';
  RAISE NOTICE '✅ Engagement score calculation function created';
  RAISE NOTICE '✅ Rating stats trigger created';
END $$;
