-- =============================================================================
-- PROJECT BIDS TABLE MIGRATION
-- Phase 6: Pro Bidding System
-- Date: 2026-01-21
-- =============================================================================

-- Create project_bids table for storing contractor quotes on client projects
CREATE TABLE IF NOT EXISTS project_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project reference (will be FK when projects table exists)
    project_id VARCHAR(255) NOT NULL,
    
    -- Contractor submitting the bid
    pro_profile_id UUID NOT NULL REFERENCES pro_profile(id) ON DELETE CASCADE,
    
    -- Bid details
    amount DECIMAL(12, 2) NOT NULL,
    timeline VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    
    -- Optional inclusions
    includes_permits BOOLEAN DEFAULT FALSE,
    includes_materials BOOLEAN DEFAULT FALSE,
    
    -- Validity
    valid_until TIMESTAMPTZ,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',    -- Awaiting client review
        'accepted',   -- Client accepted this bid
        'declined',   -- Client declined this bid
        'expired',    -- Bid validity period passed
        'withdrawn'   -- Contractor withdrew bid
    )),
    
    -- Response from client
    client_response_at TIMESTAMPTZ,
    client_response_note TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_bids_project_id ON project_bids(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bids_pro_profile_id ON project_bids(pro_profile_id);
CREATE INDEX IF NOT EXISTS idx_project_bids_status ON project_bids(status);
CREATE INDEX IF NOT EXISTS idx_project_bids_created_at ON project_bids(created_at DESC);

-- Unique constraint: one active bid per pro per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_bid 
    ON project_bids(project_id, pro_profile_id) 
    WHERE status NOT IN ('withdrawn', 'expired');

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_project_bids_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_project_bids_timestamp ON project_bids;
CREATE TRIGGER trigger_project_bids_timestamp
    BEFORE UPDATE ON project_bids
    FOR EACH ROW
    EXECUTE FUNCTION update_project_bids_timestamp();

-- =============================================================================
-- CLIENT PROJECTS TABLE (for storing posted projects)
-- =============================================================================

CREATE TABLE IF NOT EXISTS client_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Client who posted the project
    client_profile_id UUID REFERENCES client_profile(id) ON DELETE CASCADE,
    clerk_user_id VARCHAR(255) NOT NULL,
    
    -- Project details
    title VARCHAR(255) NOT NULL,
    project_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    
    -- Urgency and budget
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN (
        'emergency', 'urgent', 'normal', 'flexible'
    )),
    budget_range VARCHAR(50),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    
    -- Dates
    preferred_start_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft',       -- Not yet published
        'open',        -- Accepting bids
        'in-progress', -- Work has started
        'completed',   -- Project finished
        'cancelled'    -- Project cancelled
    )),
    
    -- Selected contractor (when bid accepted)
    accepted_bid_id UUID REFERENCES project_bids(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_projects_clerk_user ON client_projects(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_client_projects_type ON client_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_client_projects_location ON client_projects(city, state);
CREATE INDEX IF NOT EXISTS idx_client_projects_created ON client_projects(created_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_client_projects_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_client_projects_timestamp ON client_projects;
CREATE TRIGGER trigger_client_projects_timestamp
    BEFORE UPDATE ON client_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_client_projects_timestamp();

-- =============================================================================
-- Grant permissions
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON project_bids TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_projects TO authenticated;

-- =============================================================================
-- Migration complete
-- =============================================================================

COMMENT ON TABLE project_bids IS 'Stores contractor bids/quotes on client projects';
COMMENT ON TABLE client_projects IS 'Stores projects posted by homeowner clients';
