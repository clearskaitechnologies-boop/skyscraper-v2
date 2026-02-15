-- Rollback: usage table + policies + helpers
-- Safe to run multiple times; skips objects that don't exist.

-- 1) Drop triggers that we created
DO $rb$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['reports','routes','quick_reports','org_usage_monthly','org_subscriptions'])
  LOOP
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_'||t) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I;', 'set_updated_at_'||t, t);
    END IF;
  END LOOP;
END
$rb$;

-- 2) Drop the trigger function
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- 3) Drop RLS policies we added (tables may not exist; guard each)
DO $rb$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_usage_monthly') THEN
    EXECUTE 'DROP POLICY IF EXISTS usage_read ON public.org_usage_monthly';
    EXECUTE 'DROP POLICY IF EXISTS usage_write ON public.org_usage_monthly';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='orgs') THEN
    EXECUTE 'DROP POLICY IF EXISTS orgs_read ON public.orgs';
    EXECUTE 'DROP POLICY IF EXISTS orgs_update ON public.orgs';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_members') THEN
    EXECUTE 'DROP POLICY IF EXISTS org_members_read ON public.org_members';
    EXECUTE 'DROP POLICY IF EXISTS org_members_write ON public.org_members';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_subscriptions') THEN
    EXECUTE 'DROP POLICY IF EXISTS org_subs_read ON public.org_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS org_subs_write ON public.org_subscriptions';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reports') THEN
    EXECUTE 'DROP POLICY IF EXISTS reports_read ON public.reports';
    EXECUTE 'DROP POLICY IF EXISTS reports_write ON public.reports';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='routes') THEN
    EXECUTE 'DROP POLICY IF EXISTS routes_read ON public.routes';
    EXECUTE 'DROP POLICY IF EXISTS routes_write ON public.routes';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='files') THEN
    EXECUTE 'DROP POLICY IF EXISTS files_read ON public.files';
    EXECUTE 'DROP POLICY IF EXISTS files_write ON public.files';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quick_reports') THEN
    EXECUTE 'DROP POLICY IF EXISTS qreports_read ON public.quick_reports';
    EXECUTE 'DROP POLICY IF EXISTS qreports_write ON public.quick_reports';
  END IF;
END
$rb$;

-- 4) Optionally disable RLS (keeps data accessible during rollback)
DO $rb$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['orgs','org_members','org_subscriptions','org_usage_monthly','reports','routes','files','quick_reports'])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t);
    END IF;
  END LOOP;
END
$rb$;

-- 5) Drop helper functions
DROP FUNCTION IF EXISTS public.same_org(uuid);
DROP FUNCTION IF EXISTS public.member_org_ids();
DROP FUNCTION IF EXISTS public.current_user_id();
DROP FUNCTION IF EXISTS public.month_bucket(timestamptz);

-- 6) Drop created tables (keep MV if it was there originally)
DROP TABLE IF EXISTS public.org_subscriptions;
DROP TABLE IF EXISTS public.org_usage_monthly;

-- 7) If the MV backup exists, rename it back
DO $rb$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='org_usage_monthly_mv' AND c.relkind='m'
  ) THEN
    -- Only rename if no table named org_usage_monthly remains
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='org_usage_monthly'
    ) THEN
      EXECUTE 'ALTER MATERIALIZED VIEW public.org_usage_monthly_mv RENAME TO org_usage_monthly';
    END IF;
  END IF;
END
$rb$;

-- End of rollback
