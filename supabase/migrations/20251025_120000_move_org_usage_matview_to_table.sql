-- Migration: Move materialized view org_usage_monthly -> table and setup RLS/policies
-- Created: 2025-10-25 12:00:00
-- Description: Renames any existing materialized view, creates the counter table,
-- backfills from the renamed MV (if present), creates helper functions, enables
-- RLS on known tables, and creates safe policies (no-op when tables are missing).

/* ---------- 1) Rename MV -> *_mv if it exists ---------- */
ALTER MATERIALIZED VIEW IF EXISTS public.org_usage_monthly
RENAME TO org_usage_monthly_mv;

/* ---------- 2) Create COUNTER TABLE (idempotent) ---------- */
CREATE TABLE IF NOT EXISTS public.org_usage_monthly (
  org_id uuid NOT NULL,
  "month" date NOT NULL,
  ai_pages int NOT NULL DEFAULT 0,
  routes int NOT NULL DEFAULT 0,
  storage_bytes bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, "month")
);

ALTER TABLE public.org_usage_monthly ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS org_usage_monthly_month_idx
  ON public.org_usage_monthly ("month");

/* ---------- 3) Backfill from the old MV with auto-detection ---------- */
DO $mig$
DECLARE
  has_mv boolean := false;
  month_col text := null;
  sql_text text;
BEGIN
  /* Is there a materialized view we just renamed? */
  SELECT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='org_usage_monthly_mv' AND c.relkind='m'
  ) INTO has_mv;

  IF NOT has_mv THEN
    RAISE NOTICE 'No org_usage_monthly_mv present; skipping backfill.';
    RETURN;
  END IF;

  /* Detect a month-like column on the MV */
  SELECT column_name
  INTO month_col
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='org_usage_monthly_mv'
    AND column_name IN (
      'month','month_bucket','month_start','period_month','period_start','monthdate','month_col','ts_month'
    )
  LIMIT 1;

  IF month_col IS NOT NULL THEN
    /* Use the detected month column; always qualify with mv. */
    sql_text := format($f$
      INSERT INTO public.org_usage_monthly (org_id, "month", ai_pages, routes, storage_bytes, updated_at)
      SELECT mv.org_id,
             (mv.%I)::date AS "month",
             COALESCE(mv.ai_pages,0),
             COALESCE(mv.routes,0),
             COALESCE(mv.storage_bytes,0),
             COALESCE(mv.updated_at, now())
      FROM public.org_usage_monthly_mv mv
      ON CONFLICT (org_id, "month") DO NOTHING;
    $f$, month_col);
    EXECUTE sql_text;

  ELSE
    /* Derive month from created_at or updated_at if available */
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='org_usage_monthly_mv' AND column_name='created_at'
    ) THEN
      EXECUTE $f$
        INSERT INTO public.org_usage_monthly (org_id, "month", ai_pages, routes, storage_bytes, updated_at)
        SELECT mv.org_id,
               date_trunc('month', mv.created_at)::date AS "month",
               COALESCE(mv.ai_pages,0),
               COALESCE(mv.routes,0),
               COALESCE(mv.storage_bytes,0),
               COALESCE(mv.updated_at, now())
        FROM public.org_usage_monthly_mv mv
        ON CONFLICT (org_id, "month") DO NOTHING;
      $f$;

    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='org_usage_monthly_mv' AND column_name='updated_at'
    ) THEN
      EXECUTE $f$
        INSERT INTO public.org_usage_monthly (org_id, "month", ai_pages, routes, storage_bytes, updated_at)
        SELECT mv.org_id,
               date_trunc('month', mv.updated_at)::date AS "month",
               COALESCE(mv.ai_pages,0),
               COALESCE(mv.routes,0),
               COALESCE(mv.storage_bytes,0),
               COALESCE(mv.updated_at, now())
        FROM public.org_usage_monthly_mv mv
        ON CONFLICT (org_id, "month") DO NOTHING;
      $f$;

    ELSE
      RAISE EXCEPTION 'Cannot determine month column for backfill. Add a month-like column or created_at/updated_at to org_usage_monthly_mv.';
    END IF;
  END IF;

END
$mig$;

/* ---------- 4) Create helper functions (invoker + fixed search_path) ---------- */
CREATE OR REPLACE FUNCTION public.month_bucket(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$ SELECT date_trunc('month', ts)::date; $$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$ SELECT auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.member_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT org_id
  FROM public.org_members
  WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.same_org(check_org uuid)
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.user_id = auth.uid()
      AND m.org_id = check_org
  )
$$;

/* ---------- 5) Enable RLS on known tables that exist ---------- */
DO $rls$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['orgs','org_members','org_subscriptions','org_usage_monthly','reports','routes','files','quick_reports']
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name=t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END IF;
  END LOOP;
END
$rls$;

/* ---------- 6) Example policies (safe to run; they no-op if table missing) ---------- */
DO $pol$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_usage_monthly') THEN
    EXECUTE 'DROP POLICY IF EXISTS usage_read ON public.org_usage_monthly';
    EXECUTE 'CREATE POLICY usage_read ON public.org_usage_monthly FOR SELECT USING (org_id IN (SELECT * FROM public.member_org_ids()))';

    EXECUTE 'DROP POLICY IF EXISTS usage_write ON public.org_usage_monthly';
    EXECUTE 'CREATE POLICY usage_write ON public.org_usage_monthly FOR ALL USING (org_id IN (SELECT * FROM public.member_org_ids())) WITH CHECK (org_id IN (SELECT * FROM public.member_org_ids()))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='orgs') THEN
    EXECUTE 'DROP POLICY IF EXISTS orgs_read ON public.orgs';
    EXECUTE 'CREATE POLICY orgs_read ON public.orgs FOR SELECT USING (id IN (SELECT * FROM public.member_org_ids()))';

    EXECUTE 'DROP POLICY IF EXISTS orgs_update ON public.orgs';
    EXECUTE 'CREATE POLICY orgs_update ON public.orgs FOR UPDATE USING (id IN (SELECT * FROM public.member_org_ids())) WITH CHECK (id IN (SELECT * FROM public.member_org_ids()))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_members') THEN
    EXECUTE 'DROP POLICY IF EXISTS org_members_read ON public.org_members';
    EXECUTE 'CREATE POLICY org_members_read ON public.org_members FOR SELECT USING (org_id IN (SELECT * FROM public.member_org_ids()))';

    EXECUTE 'DROP POLICY IF EXISTS org_members_write ON public.org_members';
    EXECUTE 'CREATE POLICY org_members_write ON public.org_members FOR ALL USING (org_id IN (SELECT * FROM public.member_org_ids())) WITH CHECK (org_id IN (SELECT * FROM public.member_org_ids()))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_subscriptions') THEN
    EXECUTE 'DROP POLICY IF EXISTS org_subs_read ON public.org_subscriptions';
    EXECUTE 'CREATE POLICY org_subs_read ON public.org_subscriptions FOR SELECT USING (org_id IN (SELECT * FROM public.member_org_ids()))';

    EXECUTE 'DROP POLICY IF EXISTS org_subs_write ON public.org_subscriptions';
    EXECUTE 'CREATE POLICY org_subs_write ON public.org_subscriptions FOR ALL USING (org_id IN (SELECT * FROM public.member_org_ids())) WITH CHECK (org_id IN (SELECT * FROM public.member_org_ids()))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reports') THEN
    EXECUTE 'DROP POLICY IF EXISTS reports_read ON public.reports';
    EXECUTE 'CREATE POLICY reports_read ON public.reports FOR SELECT USING (public.same_org(org_id))';

    EXECUTE 'DROP POLICY IF EXISTS reports_write ON public.reports';
    EXECUTE 'CREATE POLICY reports_write ON public.reports FOR ALL USING (public.same_org(org_id)) WITH CHECK (public.same_org(org_id))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='routes') THEN
    EXECUTE 'DROP POLICY IF EXISTS routes_read ON public.routes';
    EXECUTE 'CREATE POLICY routes_read ON public.routes FOR SELECT USING (public.same_org(org_id))';

    EXECUTE 'DROP POLICY IF EXISTS routes_write ON public.routes';
    EXECUTE 'CREATE POLICY routes_write ON public.routes FOR ALL USING (public.same_org(org_id)) WITH CHECK (public.same_org(org_id))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='files') THEN
    EXECUTE 'DROP POLICY IF EXISTS files_read ON public.files';
    EXECUTE 'CREATE POLICY files_read ON public.files FOR SELECT USING (public.same_org(org_id))';

    EXECUTE 'DROP POLICY IF EXISTS files_write ON public.files';
    EXECUTE 'CREATE POLICY files_write ON public.files FOR ALL USING (public.same_org(org_id)) WITH CHECK (public.same_org(org_id))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quick_reports') THEN
    EXECUTE 'DROP POLICY IF EXISTS qreports_read ON public.quick_reports';
    EXECUTE 'CREATE POLICY qreports_read ON public.quick_reports FOR SELECT USING (public.same_org(org_id))';

    EXECUTE 'DROP POLICY IF EXISTS qreports_write ON public.quick_reports';
    EXECUTE 'CREATE POLICY qreports_write ON public.quick_reports FOR ALL USING (public.same_org(org_id)) WITH CHECK (public.same_org(org_id))';
  END IF;
END
$pol$;
