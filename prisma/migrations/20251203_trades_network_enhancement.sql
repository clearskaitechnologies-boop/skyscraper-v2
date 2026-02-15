-- ============================================================================
-- TRADES NETWORK ENHANCEMENT MIGRATION
-- Created: December 3, 2025
-- Purpose: Transform SkaiScraper into a contractor-client matching marketplace
-- ============================================================================

-- 1. TRADE PROFILE ENHANCEMENTS (extends ContractorProfile)
CREATE TABLE IF NOT EXISTS "trade_profiles" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "contractor_profile_id" TEXT NOT NULL UNIQUE,
  "user_id" TEXT, -- Optional: specific user within org
  "org_id" TEXT NOT NULL,
  
  -- Core Trade Info
  "trade_type" TEXT NOT NULL, -- roofer, plumber, hvac, gc, etc
  "certification_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "portfolio_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "average_job_size" INTEGER, -- in cents
  "min_job_size" INTEGER, -- in cents
  "max_job_size" INTEGER, -- in cents
  
  -- Availability
  "accepting_new_clients" BOOLEAN DEFAULT true,
  "emergency_available" BOOLEAN DEFAULT false,
  "preferred_contact_method" TEXT DEFAULT 'phone', -- phone, email, portal
  "response_time_hours" INTEGER DEFAULT 24,
  
  -- Service Area
  "service_radius_miles" INTEGER DEFAULT 25,
  "service_zip_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "travel_fee_per_mile" INTEGER, -- in cents
  "blocked_zip_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Social Proof
  "completed_jobs_count" INTEGER DEFAULT 0,
  "average_rating" DECIMAL(3,2) DEFAULT 0.00,
  "total_reviews_count" INTEGER DEFAULT 0,
  "response_rate_pct" INTEGER DEFAULT 100,
  
  -- Marketing
  "tagline" TEXT,
  "video_intro_url" TEXT,
  "badges" TEXT[] DEFAULT ARRAY[]::TEXT[], -- verified, top_rated, fast_response
  
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_profiles_contractor" 
    FOREIGN KEY ("contractor_profile_id") 
    REFERENCES "contractor_profiles"("id") 
    ON DELETE CASCADE,
  
  CONSTRAINT "fk_trade_profiles_org" 
    FOREIGN KEY ("org_id") 
    REFERENCES "Org"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_trade_profiles_org" ON "trade_profiles"("org_id");
CREATE INDEX "idx_trade_profiles_trade_type" ON "trade_profiles"("trade_type");
CREATE INDEX "idx_trade_profiles_accepting" ON "trade_profiles"("accepting_new_clients");
CREATE INDEX "idx_trade_profiles_rating" ON "trade_profiles"("average_rating" DESC);


-- 2. TRADE REVIEWS (social proof system)
CREATE TABLE IF NOT EXISTS "trade_reviews" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trade_profile_id" TEXT NOT NULL,
  "client_id" TEXT, -- if from existing client
  "reviewer_name" TEXT NOT NULL,
  "reviewer_email" TEXT,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "title" TEXT,
  "comment" TEXT,
  "job_type" TEXT, -- roofing, plumbing, etc
  "job_size_cents" INTEGER,
  "would_recommend" BOOLEAN DEFAULT true,
  "verified_job" BOOLEAN DEFAULT false, -- linked to actual claim/job
  "claim_id" TEXT, -- link to actual completed claim
  "response_from_pro" TEXT,
  "response_at" TIMESTAMPTZ,
  "status" TEXT DEFAULT 'published', -- pending, published, flagged
  "helpful_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_reviews_profile" 
    FOREIGN KEY ("trade_profile_id") 
    REFERENCES "trade_profiles"("id") 
    ON DELETE CASCADE,
    
  CONSTRAINT "fk_trade_reviews_client" 
    FOREIGN KEY ("client_id") 
    REFERENCES "Client"("id") 
    ON DELETE SET NULL,
    
  CONSTRAINT "fk_trade_reviews_claim" 
    FOREIGN KEY ("claim_id") 
    REFERENCES "claims"("id") 
    ON DELETE SET NULL
);

CREATE INDEX "idx_trade_reviews_profile" ON "trade_reviews"("trade_profile_id");
CREATE INDEX "idx_trade_reviews_rating" ON "trade_reviews"("rating");
CREATE INDEX "idx_trade_reviews_status" ON "trade_reviews"("status");
CREATE INDEX "idx_trade_reviews_created" ON "trade_reviews"("created_at" DESC);


-- 3. ENHANCED CLIENT-PRO CONNECTIONS (extends ClientProConnection)
-- Add columns to existing client_pro_connections table
ALTER TABLE "client_pro_connections" 
  ADD COLUMN IF NOT EXISTS "connection_source" TEXT DEFAULT 'manual', -- search, referral, auto_match, manual
  ADD COLUMN IF NOT EXISTS "service_type" TEXT, -- what service needed
  ADD COLUMN IF NOT EXISTS "urgency" TEXT DEFAULT 'normal', -- urgent, normal, flexible
  ADD COLUMN IF NOT EXISTS "budget_min_cents" INTEGER,
  ADD COLUMN IF NOT EXISTS "budget_max_cents" INTEGER,
  ADD COLUMN IF NOT EXISTS "preferred_start_date" DATE,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "lead_id" TEXT, -- auto-created lead
  ADD COLUMN IF NOT EXISTS "appointment_id" TEXT, -- auto-created appointment
  ADD COLUMN IF NOT EXISTS "claim_id" TEXT, -- if connected to claim
  ADD COLUMN IF NOT EXISTS "rejected_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "accepted_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "viewed_at" TIMESTAMPTZ, -- when pro viewed request
  ADD COLUMN IF NOT EXISTS "response_time_minutes" INTEGER;

-- Add foreign keys for new columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_client_pro_connections_lead'
  ) THEN
    ALTER TABLE "client_pro_connections"
      ADD CONSTRAINT "fk_client_pro_connections_lead"
      FOREIGN KEY ("lead_id") 
      REFERENCES "leads"("id") 
      ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_client_pro_connections_appointment'
  ) THEN
    ALTER TABLE "client_pro_connections"
      ADD CONSTRAINT "fk_client_pro_connections_appointment"
      FOREIGN KEY ("appointment_id") 
      REFERENCES "appointments"("id") 
      ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_client_pro_connections_claim'
  ) THEN
    ALTER TABLE "client_pro_connections"
      ADD CONSTRAINT "fk_client_pro_connections_claim"
      FOREIGN KEY ("claim_id") 
      REFERENCES "claims"("id") 
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_client_pro_connections_lead" ON "client_pro_connections"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_client_pro_connections_appointment" ON "client_pro_connections"("appointment_id");
CREATE INDEX IF NOT EXISTS "idx_client_pro_connections_claim" ON "client_pro_connections"("claim_id");
CREATE INDEX IF NOT EXISTS "idx_client_pro_connections_source" ON "client_pro_connections"("connection_source");
CREATE INDEX IF NOT EXISTS "idx_client_pro_connections_urgency" ON "client_pro_connections"("urgency");


-- 4. SERVICE REQUEST ENHANCEMENTS (extends ServiceRequest)
-- Add columns to existing service_requests table
ALTER TABLE "ServiceRequest" 
  ADD COLUMN IF NOT EXISTS "service_category" TEXT, -- roofing, plumbing, electrical, etc
  ADD COLUMN IF NOT EXISTS "property_address" TEXT,
  ADD COLUMN IF NOT EXISTS "property_city" TEXT,
  ADD COLUMN IF NOT EXISTS "property_state" TEXT,
  ADD COLUMN IF NOT EXISTS "property_zip" TEXT,
  ADD COLUMN IF NOT EXISTS "property_lat" DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS "property_lng" DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS "budget_cents" INTEGER,
  ADD COLUMN IF NOT EXISTS "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "urgency_level" TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS "preferred_contact_time" TEXT,
  ADD COLUMN IF NOT EXISTS "matched_contractors" TEXT[] DEFAULT ARRAY[]::TEXT[], -- trade_profile_ids
  ADD COLUMN IF NOT EXISTS "match_count" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "auto_matched_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "responses_count" INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS "idx_service_requests_category" ON "ServiceRequest"("service_category");
CREATE INDEX IF NOT EXISTS "idx_service_requests_zip" ON "ServiceRequest"("property_zip");
CREATE INDEX IF NOT EXISTS "idx_service_requests_urgency" ON "ServiceRequest"("urgency_level");
CREATE INDEX IF NOT EXISTS "idx_service_requests_status" ON "ServiceRequest"("status");


-- 5. TRADE AVAILABILITY CALENDAR
CREATE TABLE IF NOT EXISTS "trade_availability" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trade_profile_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "available" BOOLEAN DEFAULT true,
  "slots_available" INTEGER DEFAULT 0, -- 0 = unlimited
  "slots_booked" INTEGER DEFAULT 0,
  "blocked_reason" TEXT, -- vacation, booked, emergency_only
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_availability_profile" 
    FOREIGN KEY ("trade_profile_id") 
    REFERENCES "trade_profiles"("id") 
    ON DELETE CASCADE,
  
  UNIQUE("trade_profile_id", "date")
);

CREATE INDEX "idx_trade_availability_profile" ON "trade_availability"("trade_profile_id");
CREATE INDEX "idx_trade_availability_date" ON "trade_availability"("date");


-- 6. TRADE SPECIALTIES (granular service offerings)
CREATE TABLE IF NOT EXISTS "trade_specialties" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trade_profile_id" TEXT NOT NULL,
  "specialty_name" TEXT NOT NULL, -- "Asphalt Shingle Roofing", "Gas Line Repair"
  "specialty_category" TEXT NOT NULL, -- "roofing", "plumbing"
  "years_experience" INTEGER,
  "certification" TEXT,
  "price_range_min_cents" INTEGER,
  "price_range_max_cents" INTEGER,
  "typical_duration_hours" INTEGER,
  "warranty_years" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_specialties_profile" 
    FOREIGN KEY ("trade_profile_id") 
    REFERENCES "trade_profiles"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_trade_specialties_profile" ON "trade_specialties"("trade_profile_id");
CREATE INDEX "idx_trade_specialties_category" ON "trade_specialties"("specialty_category");


-- 7. MATCHING ALGORITHM LOGS (for optimization)
CREATE TABLE IF NOT EXISTS "trade_match_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "service_request_id" TEXT NOT NULL,
  "matched_profiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "search_radius_miles" INTEGER,
  "filters_applied" JSONB,
  "results_count" INTEGER,
  "algorithm_version" TEXT DEFAULT 'v1',
  "processing_time_ms" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_match_logs_request" 
    FOREIGN KEY ("service_request_id") 
    REFERENCES "ServiceRequest"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_trade_match_logs_request" ON "trade_match_logs"("service_request_id");
CREATE INDEX "idx_trade_match_logs_created" ON "trade_match_logs"("created_at" DESC);


-- 8. PRO RESPONSE TEMPLATES (quick replies)
CREATE TABLE IF NOT EXISTS "trade_response_templates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trade_profile_id" TEXT NOT NULL,
  "template_name" TEXT NOT NULL,
  "template_body" TEXT NOT NULL,
  "use_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_response_templates_profile" 
    FOREIGN KEY ("trade_profile_id") 
    REFERENCES "trade_profiles"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_trade_response_templates_profile" ON "trade_response_templates"("trade_profile_id");


-- 9. CLIENT PREFERENCES (saved search criteria)
CREATE TABLE IF NOT EXISTS "client_search_preferences" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "client_id" TEXT NOT NULL,
  "name" TEXT NOT NULL, -- "Preferred Roofers", "Emergency Plumbers"
  "service_type" TEXT,
  "max_distance_miles" INTEGER DEFAULT 25,
  "min_rating" DECIMAL(3,2) DEFAULT 4.0,
  "budget_max_cents" INTEGER,
  "badges_required" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "notification_enabled" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_client_search_preferences_client" 
    FOREIGN KEY ("client_id") 
    REFERENCES "Client"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_client_search_preferences_client" ON "client_search_preferences"("client_id");


-- 10. NOTIFICATIONS FOR TRADES NETWORK
CREATE TABLE IF NOT EXISTS "trade_notifications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "recipient_org_id" TEXT,
  "recipient_client_id" TEXT,
  "type" TEXT NOT NULL, -- new_lead, connection_request, review_received, etc
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "action_url" TEXT,
  "read" BOOLEAN DEFAULT false,
  "read_at" TIMESTAMPTZ,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_trade_notifications_org" 
    FOREIGN KEY ("recipient_org_id") 
    REFERENCES "Org"("id") 
    ON DELETE CASCADE,
    
  CONSTRAINT "fk_trade_notifications_client" 
    FOREIGN KEY ("recipient_client_id") 
    REFERENCES "Client"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_trade_notifications_org" ON "trade_notifications"("recipient_org_id");
CREATE INDEX "idx_trade_notifications_client" ON "trade_notifications"("recipient_client_id");
CREATE INDEX "idx_trade_notifications_read" ON "trade_notifications"("read");
CREATE INDEX "idx_trade_notifications_created" ON "trade_notifications"("created_at" DESC);


-- ============================================================================
-- TRIGGER: Auto-update average rating when review added
-- ============================================================================
CREATE OR REPLACE FUNCTION update_trade_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trade_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
      FROM trade_reviews
      WHERE trade_profile_id = NEW.trade_profile_id
        AND status = 'published'
    ),
    total_reviews_count = (
      SELECT COUNT(*)
      FROM trade_reviews
      WHERE trade_profile_id = NEW.trade_profile_id
        AND status = 'published'
    ),
    updated_at = NOW()
  WHERE id = NEW.trade_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trade_profile_rating ON trade_reviews;
CREATE TRIGGER trigger_update_trade_profile_rating
  AFTER INSERT OR UPDATE ON trade_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_trade_profile_rating();


-- ============================================================================
-- TRIGGER: Auto-calculate response time when pro accepts
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACCEPTED' AND OLD.status != 'ACCEPTED' THEN
    NEW.accepted_at = NOW();
    NEW.response_time_minutes = EXTRACT(EPOCH FROM (NOW() - NEW."createdAt")) / 60;
  END IF;
  
  IF NEW.status = 'DECLINED' AND OLD.status != 'DECLINED' THEN
    NEW.rejected_at = NOW();
    NEW.response_time_minutes = EXTRACT(EPOCH FROM (NOW() - NEW."createdAt")) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_response_time ON client_pro_connections;
CREATE TRIGGER trigger_calculate_response_time
  BEFORE UPDATE ON client_pro_connections
  FOR EACH ROW
  EXECUTE FUNCTION calculate_response_time();


-- ============================================================================
-- SEED DATA: Common trade types
-- ============================================================================
-- This will be inserted via separate seed script


-- ============================================================================
-- VIEWS: Helpful analytics views
-- ============================================================================

-- Top rated contractors view
CREATE OR REPLACE VIEW v_top_rated_contractors AS
SELECT 
  tp.id,
  tp.trade_type,
  cp.business_name,
  tp.average_rating,
  tp.total_reviews_count,
  tp.completed_jobs_count,
  tp.accepting_new_clients,
  tp.service_radius_miles,
  cp.service_areas,
  tp.badges
FROM trade_profiles tp
JOIN contractor_profiles cp ON cp.id = tp.contractor_profile_id
WHERE tp.accepting_new_clients = true
  AND tp.total_reviews_count >= 3
ORDER BY tp.average_rating DESC, tp.total_reviews_count DESC;


-- Active service requests needing matching
CREATE OR REPLACE VIEW v_pending_service_requests AS
SELECT 
  sr.id,
  sr."orgId",
  sr."clientId",
  sr.service_category,
  sr.property_zip,
  sr.urgency_level,
  sr.status,
  sr.match_count,
  sr."createdAt",
  c.name as client_name,
  c.email as client_email
FROM "ServiceRequest" sr
JOIN "Client" c ON c.id = sr."clientId"
WHERE sr.status = 'pending'
  AND (sr.match_count = 0 OR sr.match_count IS NULL)
ORDER BY 
  CASE sr.urgency_level
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    ELSE 4
  END,
  sr."createdAt" ASC;


-- ============================================================================
-- GRANT PERMISSIONS (adjust based on your DB user)
-- ============================================================================
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

COMMENT ON TABLE trade_profiles IS 'Enhanced contractor profiles with trade-specific data for marketplace matching';
COMMENT ON TABLE trade_reviews IS 'Client reviews and ratings for trade professionals';
COMMENT ON TABLE trade_availability IS 'Calendar availability for contractors to manage bookings';
COMMENT ON TABLE trade_specialties IS 'Granular service offerings for each trade professional';
COMMENT ON TABLE trade_match_logs IS 'Logs of automated matching algorithm runs for optimization';
COMMENT ON TABLE trade_notifications IS 'In-app notifications for trades network activity';
