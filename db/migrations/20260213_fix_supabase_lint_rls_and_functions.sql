-- ============================================================
-- Migration: Fix Supabase Lint Warnings (38 issues)
-- Date: 2026-02-13
--
-- WHAT THIS FIXES:
-- 1. RLS Performance: Wrap auth.uid() in (SELECT ...) so it
--    evaluates once per query instead of once per row (19 policies)
-- 2. Duplicate SELECT policies on profiles: merge into one (5 warnings)
-- 3. Function search_path: pinned via ALTER FUNCTION (13 functions)
--
-- NOTE: HaveIBeenPwned password check must be toggled ON in the
--       Supabase Dashboard → Authentication → Settings → Security
-- ============================================================

BEGIN;

-- ============================================================
-- PART 1: RLS POLICY FIXES — pboss.organizations (3 policies)
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON pboss.organizations;
CREATE POLICY "Authenticated users can create organizations"
    ON pboss.organizations FOR INSERT
    WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Owners can update organization" ON pboss.organizations;
CREATE POLICY "Owners can update organization"
    ON pboss.organizations FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = organizations.id
          AND m.user_id = (select auth.uid())
          AND m.role IN ('owner', 'admin')
    ));

DROP POLICY IF EXISTS "Users can view their organizations" ON pboss.organizations;
CREATE POLICY "Users can view their organizations"
    ON pboss.organizations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = organizations.id
          AND m.user_id = (select auth.uid())
    ));

-- ============================================================
-- PART 2: RLS POLICY FIXES — pboss.profiles (4 policies → 3)
-- Merges the two duplicate SELECT policies into one.
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON pboss.profiles;
DROP POLICY IF EXISTS "Users can view org profiles" ON pboss.profiles;
CREATE POLICY "Users can view own or org profiles"
    ON pboss.profiles FOR SELECT
    USING (
        uid = (select auth.uid())
        OR org_id IN (
            SELECT m.org_id FROM pboss.org_members m
            WHERE m.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own profile" ON pboss.profiles;
CREATE POLICY "Users can update own profile"
    ON pboss.profiles FOR UPDATE
    USING (uid = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own profile" ON pboss.profiles;
CREATE POLICY "Users can create own profile"
    ON pboss.profiles FOR INSERT
    WITH CHECK (uid = (select auth.uid()));

-- ============================================================
-- PART 3: RLS POLICY FIXES — pboss.org_members (4 policies)
-- ============================================================

DROP POLICY IF EXISTS "Users can view org members" ON pboss.org_members;
CREATE POLICY "Users can view org members"
    ON pboss.org_members FOR SELECT
    USING (org_id IN (
        SELECT m.org_id FROM pboss.org_members m
        WHERE m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Admins can add org members" ON pboss.org_members;
CREATE POLICY "Admins can add org members"
    ON pboss.org_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = org_members.org_id
          AND m.user_id = (select auth.uid())
          AND m.role IN ('owner', 'admin')
    ));

DROP POLICY IF EXISTS "Admins can update org members" ON pboss.org_members;
CREATE POLICY "Admins can update org members"
    ON pboss.org_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = org_members.org_id
          AND m.user_id = (select auth.uid())
          AND m.role IN ('owner', 'admin')
    ));

DROP POLICY IF EXISTS "Admins can remove org members" ON pboss.org_members;
CREATE POLICY "Admins can remove org members"
    ON pboss.org_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = org_members.org_id
          AND m.user_id = (select auth.uid())
          AND m.role IN ('owner', 'admin')
    ));

-- ============================================================
-- PART 4: RLS POLICY FIXES — pboss.leads (4 policies)
-- ============================================================

DROP POLICY IF EXISTS "Users can view org leads" ON pboss.leads;
CREATE POLICY "Users can view org leads"
    ON pboss.leads FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = leads.org_id
          AND m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Users can create org leads" ON pboss.leads;
CREATE POLICY "Users can create org leads"
    ON pboss.leads FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = leads.org_id
          AND m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Users can update org leads" ON pboss.leads;
CREATE POLICY "Users can update org leads"
    ON pboss.leads FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = leads.org_id
          AND m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Admins can delete leads" ON pboss.leads;
CREATE POLICY "Admins can delete leads"
    ON pboss.leads FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = leads.org_id
          AND m.user_id = (select auth.uid())
          AND m.role IN ('owner', 'admin')
    ));

-- ============================================================
-- PART 5: RLS POLICY FIXES — pboss.jobs (4 policies)
-- ============================================================

DROP POLICY IF EXISTS "Users can view org jobs" ON pboss.jobs;
CREATE POLICY "Users can view org jobs"
    ON pboss.jobs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = jobs.org_id
          AND m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Users can create org jobs" ON pboss.jobs;
CREATE POLICY "Users can create org jobs"
    ON pboss.jobs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = jobs.org_id
          AND m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Users can update org jobs" ON pboss.jobs;
CREATE POLICY "Users can update org jobs"
    ON pboss.jobs FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = jobs.org_id
          AND m.user_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Admins can delete jobs" ON pboss.jobs;
CREATE POLICY "Admins can delete jobs"
    ON pboss.jobs FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM pboss.org_members m
        WHERE m.org_id = jobs.org_id
          AND m.user_id = (select auth.uid())
          AND m.role IN ('owner', 'admin')
    ));

-- ============================================================
-- PART 6: FIX MUTABLE search_path ON FUNCTIONS
-- Uses ALTER FUNCTION to pin search_path without touching the
-- function body — safe regardless of which version is live.
-- ============================================================

-- Simple trigger functions (no params, TRIGGER return)
ALTER FUNCTION pboss.update_updated_at_column() SET search_path = '';
ALTER FUNCTION app.update_proposal_drafts_updated_at() SET search_path = '';
ALTER FUNCTION app.update_usage_tokens_updated_at() SET search_path = '';
ALTER FUNCTION app.update_quick_dols_updated_at() SET search_path = '';
ALTER FUNCTION public.update_template_timestamp() SET search_path = '';
ALTER FUNCTION app.update_user_registry_timestamp() SET search_path = '';
ALTER FUNCTION public.update_clients_updated_at() SET search_path = '';
ALTER FUNCTION public.update_engagement_score() SET search_path = '';
ALTER FUNCTION public.update_contractor_rating_stats() SET search_path = '';
ALTER FUNCTION app.update_vendor_prices_timestamp() SET search_path = '';

-- Functions with params — multiple overloads may exist.
-- Try each signature; silently skip the ones that don't exist.
DO $$
BEGIN
    -- calculate_engagement_score: 5-param version (newer)
    BEGIN
        EXECUTE 'ALTER FUNCTION public.calculate_engagement_score(INT,INT,INT,INT,INT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
    -- calculate_engagement_score: 6-param version (older)
    BEGIN
        EXECUTE 'ALTER FUNCTION public.calculate_engagement_score(INT,INT,INT,INT,INT,INT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;

    -- app.upsert_org_branding overloads
    BEGIN
        EXECUTE 'ALTER FUNCTION app.upsert_org_branding(UUID,TEXT,TEXT,TEXT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
    BEGIN
        EXECUTE 'ALTER FUNCTION app.upsert_org_branding(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;

    -- public.upsert_org_branding overloads
    BEGIN
        EXECUTE 'ALTER FUNCTION public.upsert_org_branding(UUID,TEXT,TEXT,TEXT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
    BEGIN
        EXECUTE 'ALTER FUNCTION public.upsert_org_branding(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
    BEGIN
        EXECUTE 'ALTER FUNCTION public.upsert_org_branding(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
    BEGIN
        EXECUTE 'ALTER FUNCTION public.upsert_org_branding(JSONB) SET search_path = ''''';
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
END $$;

COMMIT;

-- ============================================================
-- MANUAL STEP (Supabase Dashboard — cannot be done via SQL):
--   → Authentication → Settings → Security
--   → Enable "Compromised Password Protection" (HaveIBeenPwned)
-- ============================================================
