-- Fix SECURITY DEFINER views by recreating with SECURITY INVOKER
-- This ensures views respect the caller's RLS policies

-- Drop existing views
DROP VIEW IF EXISTS public.v_events_daily;
DROP VIEW IF EXISTS public.v_report_funnel;

-- Recreate v_events_daily with SECURITY INVOKER
CREATE VIEW public.v_events_daily
WITH (security_invoker = true)
AS
SELECT
  date_trunc('day', happened_at) AS day,
  user_id,
  tenant_id,
  COUNT(*) FILTER (WHERE name = 'export.pdf') AS exports,
  COUNT(*) FILTER (WHERE name = 'share.create') AS shares,
  COUNT(*) FILTER (WHERE name = 'share.view') AS share_views,
  COUNT(*) FILTER (WHERE name LIKE 'ai.%') AS ai_actions,
  COUNT(*) FILTER (WHERE name = 'payment.paid') AS payments,
  COUNT(*) FILTER (WHERE name = 'esign.completed') AS esigns
FROM public.events
GROUP BY day, user_id, tenant_id;

-- Recreate v_report_funnel with SECURITY INVOKER
CREATE VIEW public.v_report_funnel
WITH (security_invoker = true)
AS
SELECT
  e.report_id,
  e.user_id,
  bool_or(e.name = 'export.pdf') AS step_export,
  bool_or(e.name = 'share.create') AS step_share,
  bool_or(e.name = 'share.view') AS step_view,
  bool_or(e.name = 'payment.paid') AS step_pay,
  bool_or(e.name = 'esign.completed') AS step_sign
FROM public.events e
WHERE e.report_id IS NOT NULL
GROUP BY e.report_id, e.user_id;