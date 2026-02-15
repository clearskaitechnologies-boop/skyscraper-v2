-- =============================
-- PHASE 30 & 31: Analytics + Ops Tables
-- =============================

-- Events table for tracking user actions
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID,
  user_id UUID,
  report_id UUID,
  name TEXT NOT NULL,
  props JSONB,
  happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_time_idx ON public.events(happened_at DESC);
CREATE INDEX IF NOT EXISTS events_tenant_idx ON public.events(tenant_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS events_report_idx ON public.events(report_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS events_name_idx ON public.events(name, happened_at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID,
  report_id UUID,
  severity TEXT NOT NULL DEFAULT 'error',
  source TEXT NOT NULL,
  code TEXT,
  message TEXT NOT NULL,
  context JSONB,
  happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_logs_time_idx ON public.error_logs(happened_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON public.error_logs(severity, happened_at DESC);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all errors" ON public.error_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "System can insert errors" ON public.error_logs
  FOR INSERT WITH CHECK (true);

-- Webhook status tracking
CREATE TABLE IF NOT EXISTS public.webhook_status (
  id TEXT PRIMARY KEY,
  last_ok_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  last_error TEXT
);

ALTER TABLE public.webhook_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook status" ON public.webhook_status
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "System can update webhook status" ON public.webhook_status
  FOR ALL USING (true);

-- Heartbeats for monitoring
CREATE TABLE IF NOT EXISTS public.heartbeats (
  name TEXT PRIMARY KEY,
  last_beat TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.heartbeats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view heartbeats" ON public.heartbeats
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "System can update heartbeats" ON public.heartbeats
  FOR ALL USING (true);

-- Daily rollup view for analytics
CREATE OR REPLACE VIEW public.v_events_daily AS
SELECT
  DATE_TRUNC('day', happened_at) AS day,
  tenant_id,
  user_id,
  COUNT(*) FILTER (WHERE name LIKE 'ai.%') AS ai_actions,
  COUNT(*) FILTER (WHERE name = 'export.pdf') AS exports,
  COUNT(*) FILTER (WHERE name = 'share.create') AS shares,
  COUNT(*) FILTER (WHERE name = 'share.view') AS share_views,
  COUNT(*) FILTER (WHERE name = 'payment.paid') AS payments,
  COUNT(*) FILTER (WHERE name = 'esign.completed') AS esigns
FROM public.events
WHERE happened_at > NOW() - INTERVAL '180 days'
GROUP BY 1, 2, 3
ORDER BY 1 DESC;

-- Funnel view per report
CREATE OR REPLACE VIEW public.v_report_funnel AS
SELECT 
  r.id AS report_id,
  r.created_by AS user_id,
  (SELECT MIN(happened_at) FROM events e WHERE e.report_id = r.id AND e.name = 'export.pdf') IS NOT NULL AS step_export,
  (SELECT MIN(happened_at) FROM events e WHERE e.report_id = r.id AND e.name = 'share.create') IS NOT NULL AS step_share,
  (SELECT MIN(happened_at) FROM events e WHERE e.report_id = r.id AND e.name = 'share.view') IS NOT NULL AS step_view,
  (SELECT MIN(happened_at) FROM events e WHERE e.report_id = r.id AND e.name = 'payment.paid') IS NOT NULL AS step_pay,
  (SELECT MIN(happened_at) FROM events e WHERE e.report_id = r.id AND e.name = 'esign.completed') IS NOT NULL AS step_sign
FROM reports r;