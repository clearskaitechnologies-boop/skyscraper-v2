-- =============================
-- PHASE 32: Status Page Tables
-- =============================

-- Status incidents table
CREATE TABLE IF NOT EXISTS public.status_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  components TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS status_incidents_active_idx ON public.status_incidents(started_at DESC) WHERE resolved_at IS NULL;

ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view incidents" ON public.status_incidents
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage incidents" ON public.status_incidents
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Status components table
CREATE TABLE IF NOT EXISTS public.status_components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'partial_outage', 'major_outage'))
);

ALTER TABLE public.status_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view components" ON public.status_components
  FOR SELECT USING (true);

CREATE POLICY "Admins can update components" ON public.status_components
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Seed initial components
INSERT INTO public.status_components (id, name, status) VALUES
  ('api', 'API', 'operational'),
  ('storage', 'Storage', 'operational'),
  ('ai', 'AI Services', 'operational'),
  ('payments', 'Payments', 'operational'),
  ('esign', 'eSign', 'operational')
ON CONFLICT (id) DO NOTHING;

-- =============================
-- PHASE 33: Default Role Assignment
-- =============================

-- Function to assign default viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger for default role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();