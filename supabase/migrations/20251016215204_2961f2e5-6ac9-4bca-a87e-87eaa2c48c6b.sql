-- AI Governance & Monitoring Tables

-- Event logs for monitoring
CREATE TABLE IF NOT EXISTS public.app_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID,
  report_id UUID,
  risk NUMERIC DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS app_logs_time_idx ON public.app_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS app_logs_event_idx ON public.app_logs(event_type);

ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert app logs"
ON public.app_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all app logs"
ON public.app_logs FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- AI audit insights
CREATE TABLE IF NOT EXISTS public.ai_audit_insights (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID,
  incident_id TEXT,
  category TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_audit_insights_time_idx ON public.ai_audit_insights(created_at DESC);

ALTER TABLE public.ai_audit_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ai insights"
ON public.ai_audit_insights FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

CREATE POLICY "System can insert ai insights"
ON public.ai_audit_insights FOR INSERT
TO authenticated
WITH CHECK (true);

-- Correlated incidents registry
CREATE TABLE IF NOT EXISTS public.ai_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  signature TEXT NOT NULL,
  scope JSONB,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  events_count INTEGER NOT NULL DEFAULT 0,
  confidence NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  message TEXT
);

CREATE INDEX IF NOT EXISTS ai_incidents_time_idx ON public.ai_incidents(last_seen DESC);
CREATE INDEX IF NOT EXISTS ai_incidents_status_idx ON public.ai_incidents(status);

ALTER TABLE public.ai_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view incidents"
ON public.ai_incidents FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

CREATE POLICY "System can manage incidents"
ON public.ai_incidents FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- Suppression rules
CREATE TABLE IF NOT EXISTS public.policy_suppression_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  event_type TEXT,
  signature TEXT,
  scope JSONB,
  threshold INTEGER DEFAULT 100,
  window_sec INTEGER DEFAULT 3600,
  mute_until TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.policy_suppression_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suppression rules"
ON public.policy_suppression_rules FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- Escalation policies
CREATE TABLE IF NOT EXISTS public.policy_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tenant_id UUID,
  when_confidence NUMERIC DEFAULT 0.8,
  when_events INTEGER DEFAULT 50,
  channels TEXT[] DEFAULT '{slack}',
  auto_lock BOOLEAN DEFAULT false,
  notify_roles TEXT[] DEFAULT '{owner,admin}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.policy_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage escalation policies"
ON public.policy_escalations FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- Incident actions audit
CREATE TABLE IF NOT EXISTS public.policy_incident_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.ai_incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.policy_incident_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view incident actions"
ON public.policy_incident_actions FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

CREATE POLICY "Admins can insert incident actions"
ON public.policy_incident_actions FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);