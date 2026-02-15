-- ============================================================================
-- MASTER MIGRATION: Fix "Failed to create lead" (Supabase + RLS)
-- ============================================================================
-- This script creates a production-ready schema with proper RLS policies
-- that allows authenticated users to create leads in their organizations.
--
-- Author: Senior DBA for SkaiScraper
-- Date: 2025-11-09
-- Schema: pboss (separate from app schema)
-- ============================================================================

-- ============================================================================
-- 🧭 BEFORE YOU RUN: EDIT YOUR EMAIL (LINE 491)
-- ============================================================================
-- 
-- ⚠️ CRITICAL: You MUST update your email address before running this script!
--
-- HOW TO FIND YOUR CLERK EMAIL:
--   1. Go to: https://dashboard.clerk.com
--   2. Look at top right corner (your profile/avatar)
--   3. Click it - you'll see your login email
--   4. Use THAT email below on line 491
--
-- WHERE TO EDIT:
--   • Jump to line 491 in this file
--   • Look for: v_email text := 'admin@skaiscrape.com';
--   • Replace 'admin@skaiscrape.com' with your actual Clerk email
--
-- EXAMPLE:
--   v_email text := 'damien@yourdomain.com';
--   OR
--   v_email text := 'yourname@gmail.com';
--
-- HOW TO RUN THIS SCRIPT:
--   1. Update the email on line 491
--   2. Go to: https://supabase.com/dashboard/project/nkjgcbkytuftkumdtjat/sql
--   3. Copy this ENTIRE file (Ctrl+A → Ctrl+C)
--   4. Paste into Supabase SQL Editor
--   5. Click "RUN" button
--   6. Wait 5-10 seconds for completion
--   7. Look for success messages in output
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: PREREQUISITES
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- Create pboss schema
CREATE SCHEMA IF NOT EXISTS pboss;

-- Create helper function for auto-updating updated_at timestamps
CREATE OR REPLACE FUNCTION pboss.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- SECTION 2: CORE TABLES (organizations, org_members, profiles)
-- ============================================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS pboss.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE,
    billing_email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT organizations_billing_email_check CHECK (billing_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON pboss.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON pboss.organizations(created_at DESC);

-- Create updated_at trigger for organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON pboss.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON pboss.organizations
    FOR EACH ROW
    EXECUTE FUNCTION pboss.update_updated_at_column();

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS pboss.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id uuid REFERENCES pboss.organizations(id) ON DELETE SET NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role text DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT profiles_uid_unique UNIQUE (uid),
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT profiles_role_check CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_uid ON pboss.profiles(uid);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON pboss.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON pboss.profiles(email);

-- Create updated_at trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON pboss.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON pboss.profiles
    FOR EACH ROW
    EXECUTE FUNCTION pboss.update_updated_at_column();

-- Organization members table (many-to-many)
CREATE TABLE IF NOT EXISTS pboss.org_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES pboss.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    invited_by uuid REFERENCES auth.users(id),
    joined_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT org_members_unique_user_org UNIQUE (org_id, user_id),
    CONSTRAINT org_members_role_check CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON pboss.org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON pboss.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON pboss.org_members(role);

-- Create updated_at trigger for org_members
DROP TRIGGER IF EXISTS update_org_members_updated_at ON pboss.org_members;
CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON pboss.org_members
    FOR EACH ROW
    EXECUTE FUNCTION pboss.update_updated_at_column();

-- ============================================================================
-- SECTION 3: DOMAIN TABLES (lead_source enum, leads, jobs)
-- ============================================================================

-- Create lead_source enum type
DO $$ BEGIN
    CREATE TYPE pboss.lead_source AS ENUM (
        'door_to_door',
        'referral',
        'website',
        'phone_call',
        'email',
        'social_media',
        'trade_show',
        'direct_mail',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Leads table
CREATE TABLE IF NOT EXISTS pboss.leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES pboss.organizations(id) ON DELETE CASCADE,
    
    -- Contact information
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    
    -- Address information
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    
    -- Lead metadata
    source pboss.lead_source NOT NULL DEFAULT 'other',
    status text NOT NULL DEFAULT 'new',
    priority text DEFAULT 'medium',
    
    -- Additional information
    initial_notes text,
    tags text[], -- PostgreSQL array for tags
    
    -- Ownership and assignment
    created_by uuid REFERENCES auth.users(id),
    assigned_to uuid REFERENCES auth.users(id),
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT leads_first_name_length CHECK (char_length(first_name) >= 1),
    CONSTRAINT leads_last_name_length CHECK (char_length(last_name) >= 1),
    CONSTRAINT leads_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT leads_state_length CHECK (char_length(state) = 2),
    CONSTRAINT leads_zip_code_format CHECK (zip_code ~ '^[0-9]{5}(-[0-9]{4})?$'),
    CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived')),
    CONSTRAINT leads_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON pboss.leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON pboss.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON pboss.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON pboss.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON pboss.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON pboss.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON pboss.leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_tags ON pboss.leads USING GIN(tags) WHERE tags IS NOT NULL;

-- Create updated_at trigger for leads
DROP TRIGGER IF EXISTS update_leads_updated_at ON pboss.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON pboss.leads
    FOR EACH ROW
    EXECUTE FUNCTION pboss.update_updated_at_column();

-- Jobs table (optional - links to leads)
CREATE TABLE IF NOT EXISTS pboss.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES pboss.organizations(id) ON DELETE CASCADE,
    lead_id uuid REFERENCES pboss.leads(id) ON DELETE SET NULL,
    
    -- Job information
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending',
    job_type text,
    
    -- Scheduling
    scheduled_date date,
    completed_date date,
    
    -- Financial
    estimated_cost numeric(10, 2),
    actual_cost numeric(10, 2),
    
    -- Assignment
    assigned_to uuid REFERENCES auth.users(id),
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT jobs_title_length CHECK (char_length(title) >= 3),
    CONSTRAINT jobs_status_check CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON pboss.jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_lead_id ON pboss.jobs(lead_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON pboss.jobs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON pboss.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON pboss.jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON pboss.jobs(created_at DESC);

-- Create updated_at trigger for jobs
DROP TRIGGER IF EXISTS update_jobs_updated_at ON pboss.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON pboss.jobs
    FOR EACH ROW
    EXECUTE FUNCTION pboss.update_updated_at_column();

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pboss.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pboss.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pboss.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pboss.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pboss.jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for: pboss.organizations
-- ============================================================================

-- Users can view organizations they are members of
DROP POLICY IF EXISTS "Users can view their organizations" ON pboss.organizations;
CREATE POLICY "Users can view their organizations"
    ON pboss.organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = organizations.id
            AND m.user_id = auth.uid()
        )
    );

-- Owners/admins can update their organization
DROP POLICY IF EXISTS "Owners can update organization" ON pboss.organizations;
CREATE POLICY "Owners can update organization"
    ON pboss.organizations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = organizations.id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

-- Authenticated users can create organizations
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON pboss.organizations;
CREATE POLICY "Authenticated users can create organizations"
    ON pboss.organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- RLS Policies for: pboss.profiles
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON pboss.profiles;
CREATE POLICY "Users can view own profile"
    ON pboss.profiles FOR SELECT
    USING (uid = auth.uid());

-- Users can view profiles in their organization
DROP POLICY IF EXISTS "Users can view org profiles" ON pboss.profiles;
CREATE POLICY "Users can view org profiles"
    ON pboss.profiles FOR SELECT
    USING (
        org_id IN (
            SELECT m.org_id FROM pboss.org_members m
            WHERE m.user_id = auth.uid()
        )
    );

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON pboss.profiles;
CREATE POLICY "Users can update own profile"
    ON pboss.profiles FOR UPDATE
    USING (uid = auth.uid());

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can create own profile" ON pboss.profiles;
CREATE POLICY "Users can create own profile"
    ON pboss.profiles FOR INSERT
    WITH CHECK (uid = auth.uid());

-- ============================================================================
-- RLS Policies for: pboss.org_members
-- ============================================================================

-- Users can view members of organizations they belong to
DROP POLICY IF EXISTS "Users can view org members" ON pboss.org_members;
CREATE POLICY "Users can view org members"
    ON pboss.org_members FOR SELECT
    USING (
        org_id IN (
            SELECT m.org_id FROM pboss.org_members m
            WHERE m.user_id = auth.uid()
        )
    );

-- Owners/admins can add members to their organization
DROP POLICY IF EXISTS "Admins can add org members" ON pboss.org_members;
CREATE POLICY "Admins can add org members"
    ON pboss.org_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = org_members.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

-- Owners/admins can update member roles
DROP POLICY IF EXISTS "Admins can update org members" ON pboss.org_members;
CREATE POLICY "Admins can update org members"
    ON pboss.org_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = org_members.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

-- Owners/admins can remove members
DROP POLICY IF EXISTS "Admins can remove org members" ON pboss.org_members;
CREATE POLICY "Admins can remove org members"
    ON pboss.org_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = org_members.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- RLS Policies for: pboss.leads
-- ============================================================================

-- Users can view leads in their organization
DROP POLICY IF EXISTS "Users can view org leads" ON pboss.leads;
CREATE POLICY "Users can view org leads"
    ON pboss.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = leads.org_id
            AND m.user_id = auth.uid()
        )
    );

-- Users can create leads in their organization
DROP POLICY IF EXISTS "Users can create org leads" ON pboss.leads;
CREATE POLICY "Users can create org leads"
    ON pboss.leads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = leads.org_id
            AND m.user_id = auth.uid()
        )
    );

-- Users can update leads in their organization
DROP POLICY IF EXISTS "Users can update org leads" ON pboss.leads;
CREATE POLICY "Users can update org leads"
    ON pboss.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = leads.org_id
            AND m.user_id = auth.uid()
        )
    );

-- Admins/owners can delete leads
DROP POLICY IF EXISTS "Admins can delete leads" ON pboss.leads;
CREATE POLICY "Admins can delete leads"
    ON pboss.leads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = leads.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- RLS Policies for: pboss.jobs
-- ============================================================================

-- Users can view jobs in their organization
DROP POLICY IF EXISTS "Users can view org jobs" ON pboss.jobs;
CREATE POLICY "Users can view org jobs"
    ON pboss.jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
        )
    );

-- Users can create jobs in their organization
DROP POLICY IF EXISTS "Users can create org jobs" ON pboss.jobs;
CREATE POLICY "Users can create org jobs"
    ON pboss.jobs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
        )
    );

-- Users can update jobs in their organization
DROP POLICY IF EXISTS "Users can update org jobs" ON pboss.jobs;
CREATE POLICY "Users can update org jobs"
    ON pboss.jobs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
        )
    );

-- Admins/owners can delete jobs
DROP POLICY IF EXISTS "Admins can delete jobs" ON pboss.jobs;
CREATE POLICY "Admins can delete jobs"
    ON pboss.jobs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM pboss.org_members m
            WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- SECTION 5: HELPER FUNCTIONS - Seed Organization & Attach User
-- ============================================================================

-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ⚠️  EDIT THIS LINE BEFORE RUNNING! ⚠️                                 ║
-- ║                                                                        ║
-- ║  Replace 'admin@skaiscrape.com' with YOUR actual Clerk login email    ║
-- ║                                                                        ║
-- ║  To find your Clerk email:                                            ║
-- ║  1. Go to https://dashboard.clerk.com                                 ║
-- ║  2. Look at top-right corner (your avatar)                            ║
-- ║  3. Click it to see your email                                        ║
-- ║  4. Use THAT email below                                              ║
-- ║                                                                        ║
-- ║  Examples:                                                            ║
-- ║    v_email text := 'damien@skaiscrape.com';                           ║
-- ║    v_email text := 'yourname@gmail.com';                              ║
-- ║    v_email text := 'buildingwithdamien@gmail.com';                    ║
-- ╚════════════════════════════════════════════════════════════════════════╝

DO $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
    v_email text := 'dazsavvysway@gmail.com'; -- ✅ Your Clerk login email
BEGIN
    -- Find user by email from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found. Skipping seed.', v_email;
        RETURN;
    END IF;

    -- Check if user already has an organization
    SELECT org_id INTO v_org_id
    FROM pboss.org_members
    WHERE user_id = v_user_id
    LIMIT 1;

    IF v_org_id IS NOT NULL THEN
        RAISE NOTICE 'User % already belongs to organization %.', v_email, v_org_id;
        RETURN;
    END IF;

    -- Create default organization
    INSERT INTO pboss.organizations (name, slug, billing_email)
    VALUES ('Default Organization', 'default-org', v_email)
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created organization: %', v_org_id;

    -- Add user as owner of the organization
    INSERT INTO pboss.org_members (org_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'owner');

    RAISE NOTICE 'Added user % as owner of organization %', v_email, v_org_id;

    -- Create/update user profile
    INSERT INTO pboss.profiles (uid, org_id, email, role)
    VALUES (v_user_id, v_org_id, v_email, 'owner')
    ON CONFLICT (uid) DO UPDATE
    SET org_id = EXCLUDED.org_id,
        role = EXCLUDED.role,
        updated_at = now();

    RAISE NOTICE 'Created/updated profile for user %', v_email;

END $$;

-- ============================================================================
-- SECTION 6: OPTIONAL - Public View for Leads
-- ============================================================================

CREATE OR REPLACE VIEW pboss.leads_public AS
SELECT
    id,
    org_id,
    first_name,
    last_name,
    email,
    phone,
    city,
    state,
    zip_code,
    source,
    status,
    priority,
    created_at,
    updated_at
FROM pboss.leads;

-- ============================================================================
-- SECTION 7: VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify everything works:

-- 1. Check if tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'pboss';

-- 2. Check if your user has an organization
-- SELECT * FROM pboss.org_members WHERE user_id = auth.uid();

-- 3. Try inserting a test lead (replace with actual org_id from query above)
/*
INSERT INTO pboss.leads (
    org_id,
    first_name,
    last_name,
    email,
    phone,
    address_line1,
    city,
    state,
    zip_code,
    source,
    initial_notes
) VALUES (
    'YOUR_ORG_ID_HERE', -- Replace with actual UUID
    'John',
    'Doe',
    'john.doe@example.com',
    '555-1234',
    '123 Main St',
    'Phoenix',
    'AZ',
    '85001',
    'door_to_door',
    'Test lead from migration'
);
*/

-- 4. Verify the lead was created
-- SELECT * FROM pboss.leads ORDER BY created_at DESC LIMIT 5;

-- 5. Check RLS is working (should only see leads from your org)
-- SELECT count(*) FROM pboss.leads;

-- ============================================================================
-- SECTION 8: ROLLBACK (if needed)
-- ============================================================================

-- ⚠️ WARNING: This will delete ALL data in pboss schema!
-- Only run if you need to start fresh

/*
DROP VIEW IF EXISTS pboss.leads_public;
DROP TABLE IF EXISTS pboss.jobs CASCADE;
DROP TABLE IF EXISTS pboss.leads CASCADE;
DROP TABLE IF EXISTS pboss.org_members CASCADE;
DROP TABLE IF EXISTS pboss.profiles CASCADE;
DROP TABLE IF EXISTS pboss.organizations CASCADE;
DROP TYPE IF EXISTS pboss.lead_source CASCADE;
DROP FUNCTION IF EXISTS pboss.update_updated_at_column() CASCADE;
DROP SCHEMA IF EXISTS pboss CASCADE;
*/

-- ============================================================================
-- ✅ MIGRATION COMPLETE - VERIFICATION CHECKLIST
-- ============================================================================
--
-- After running this script, you should see output like:
--   NOTICE: Created organization: <uuid>
--   NOTICE: Added user admin@skaiscrape.com as owner of organization <uuid>
--   NOTICE: Created/updated profile for user admin@skaiscrape.com
--
-- ✅ STEP 1: Verify Tables Created
--   Run in Supabase SQL Editor:
--
--   SELECT table_name FROM information_schema.tables 
--   WHERE table_schema = 'pboss' 
--   ORDER BY table_name;
--
--   Expected output (5 tables):
--     - jobs
--     - leads
--     - org_members
--     - organizations
--     - profiles
--
-- ✅ STEP 2: Verify Your Organization
--   Run:
--
--   SELECT id, name, slug, billing_email 
--   FROM pboss.organizations;
--
--   You should see: "Default Organization" with your email
--
-- ✅ STEP 3: Verify Your Profile
--   Run:
--
--   SELECT uid, email, role, org_id 
--   FROM pboss.profiles;
--
--   You should see your email with role = 'owner'
--
-- ✅ STEP 4: Test Lead Creation
--   Try creating a test lead:
--
--   INSERT INTO pboss.leads (
--     org_id, 
--     email, 
--     first_name, 
--     last_name,
--     address,
--     city,
--     state,
--     zip_code
--   )
--   SELECT 
--     org_id,
--     'test@example.com',
--     'Test',
--     'User',
--     '123 Main St',
--     'Phoenix',
--     'AZ',
--     '85001'
--   FROM pboss.profiles
--   WHERE email = 'dazsavvysway@gmail.com'  -- ✅ Your Clerk email
--   LIMIT 1;
--
--   Then verify:
--   SELECT * FROM pboss.leads;
--
-- ✅ STEP 5: Update Your Next.js App
--   Now your app can create leads using:
--   - Table: pboss.leads
--   - RLS policies will automatically filter by organization
--   - Users can only see/edit leads in their own org
--
-- 🎯 NEXT STEPS:
--   1. Deploy your updated app to Vercel
--   2. Update Clerk environment variables (production keys)
--   3. Test lead creation from your app UI
--   4. Run smoke tests: pnpm smoke:prod
--
-- 📚 DOCUMENTATION:
--   - PG_POOL_FIX.md - Database connection pooling
--   - DEPLOYMENT_GUIDE.md - Full deployment instructions
--   - CLERK_PRODUCTION_DEPLOYMENT.md - Clerk setup
--
-- ============================================================================
