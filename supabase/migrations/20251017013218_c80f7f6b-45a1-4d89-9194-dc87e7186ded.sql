-- Phase 56-59: Public tokens, audit logging, and ops analytics

-- 1) Public tokens for shareable report links (no login required)
CREATE TABLE IF NOT EXISTS public.public_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('view', 'download')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_public_tokens_token ON public.public_tokens(token);
CREATE INDEX idx_public_tokens_report ON public.public_tokens(report_id);
CREATE INDEX idx_public_tokens_expires ON public.public_tokens(expires_at);

-- RLS: Only accessible via Edge Functions with service role
ALTER TABLE public.public_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage public tokens"
ON public.public_tokens
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- 2) Audit log for public token access
CREATE TABLE IF NOT EXISTS public.audit_public_views (
  id BIGSERIAL PRIMARY KEY,
  token TEXT,
  report_id UUID,
  event TEXT,
  user_agent TEXT,
  ip INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_public_views_report ON public.audit_public_views(report_id);
CREATE INDEX idx_audit_public_views_created ON public.audit_public_views(created_at);

-- RLS: Admin read-only
ALTER TABLE public.audit_public_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_public_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- 3) Ops analytics view for dashboard
CREATE OR REPLACE VIEW public.v_ops_events AS
  SELECT 'lead'::text as kind, id, created_at::date as day FROM public.leads
  UNION ALL
  SELECT 'demo'::text as kind, id, created_at::date as day FROM public.demo_requests
  UNION ALL
  SELECT 'report'::text as kind, id, created_at::date as day FROM public.reports
  UNION ALL
  SELECT 'approval'::text as kind, id, created_at::date as day FROM public.report_price_approvals;

-- Security invoker to respect RLS on underlying tables
ALTER VIEW public.v_ops_events SET (security_invoker = true);