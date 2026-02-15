-- Tables for e-signature and public signing links

-- Report signatures table
CREATE TABLE IF NOT EXISTS public.report_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  signature_path TEXT NOT NULL,
  signed_pdf_path TEXT,
  signed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on signatures
ALTER TABLE public.report_signatures ENABLE ROW LEVEL SECURITY;

-- Report owner can read signatures
CREATE POLICY "Report owner can read signatures" ON public.report_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reports r 
      WHERE r.id = report_signatures.report_id 
      AND r.created_by = auth.uid()
    )
  );

-- Report owner can insert signatures
CREATE POLICY "Report owner can insert signatures" ON public.report_signatures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports r 
      WHERE r.id = report_signatures.report_id 
      AND r.created_by = auth.uid()
    )
  );

-- Public links table for tokenized signing
CREATE TABLE IF NOT EXISTS public.report_public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on public links
ALTER TABLE public.report_public_links ENABLE ROW LEVEL SECURITY;

-- Owner can create tokens
CREATE POLICY "Owner can create tokens" ON public.report_public_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports r 
      WHERE r.id = report_public_links.report_id 
      AND r.created_by = auth.uid()
    )
  );

-- Anyone can read valid tokens
CREATE POLICY "Anyone can read valid token" ON public.report_public_links
  FOR SELECT
  USING (expires_at > now());

-- Audit events table
CREATE TABLE IF NOT EXISTS public.report_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  actor UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit events
ALTER TABLE public.report_audit_events ENABLE ROW LEVEL SECURITY;

-- Report owner can read events
CREATE POLICY "Report owner can read events" ON public.report_audit_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reports r 
      WHERE r.id = report_audit_events.report_id 
      AND r.created_by = auth.uid()
    )
  );

-- System can insert events
CREATE POLICY "System can insert events" ON public.report_audit_events
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_signatures_report_id ON public.report_signatures(report_id);
CREATE INDEX IF NOT EXISTS idx_report_public_links_token ON public.report_public_links(token);
CREATE INDEX IF NOT EXISTS idx_report_public_links_expires ON public.report_public_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_report_audit_events_report_id ON public.report_audit_events(report_id);
CREATE INDEX IF NOT EXISTS idx_report_audit_events_created_at ON public.report_audit_events(created_at DESC);