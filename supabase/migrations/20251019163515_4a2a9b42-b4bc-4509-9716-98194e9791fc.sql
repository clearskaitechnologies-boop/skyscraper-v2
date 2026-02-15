-- Add missing columns to orgs table for report header
ALTER TABLE public.orgs
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address1 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal text,
  ADD COLUMN IF NOT EXISTS website text;

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE,
  title text,
  mode text,
  address text,
  status text DEFAULT 'draft',
  summary_md text,
  data jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create report_photos table
CREATE TABLE IF NOT EXISTS public.report_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  ai_labels text[],
  ai_boxes jsonb,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id
  FROM public.user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- RLS policies for reports (using DO blocks to handle existing policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'reports_select_org'
  ) THEN
    CREATE POLICY reports_select_org ON public.reports
      FOR SELECT USING (org_id = current_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'reports_insert_org'
  ) THEN
    CREATE POLICY reports_insert_org ON public.reports
      FOR INSERT WITH CHECK (org_id = current_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'reports_update_org'
  ) THEN
    CREATE POLICY reports_update_org ON public.reports
      FOR UPDATE USING (org_id = current_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'reports_delete_org'
  ) THEN
    CREATE POLICY reports_delete_org ON public.reports
      FOR DELETE USING (org_id = current_org_id());
  END IF;
END $$;

-- RLS policies for report_photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'report_photos' AND policyname = 'photos_select_org'
  ) THEN
    CREATE POLICY photos_select_org ON public.report_photos
      FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.reports r
               WHERE r.id = report_id AND r.org_id = current_org_id())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'report_photos' AND policyname = 'photos_ins_org'
  ) THEN
    CREATE POLICY photos_ins_org ON public.report_photos
      FOR INSERT WITH CHECK (
        EXISTS(SELECT 1 FROM public.reports r
               WHERE r.id = report_id AND r.org_id = current_org_id())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'report_photos' AND policyname = 'photos_upd_org'
  ) THEN
    CREATE POLICY photos_upd_org ON public.report_photos
      FOR UPDATE USING (
        EXISTS(SELECT 1 FROM public.reports r
               WHERE r.id = report_id AND r.org_id = current_org_id())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'report_photos' AND policyname = 'photos_del_org'
  ) THEN
    CREATE POLICY photos_del_org ON public.report_photos
      FOR DELETE USING (
        EXISTS(SELECT 1 FROM public.reports r
               WHERE r.id = report_id AND r.org_id = current_org_id())
      );
  END IF;
END $$;

-- Create convenience view for branding + org info
CREATE OR REPLACE VIEW public.v_branding_for_user AS
SELECT
  up.user_id,
  o.id as org_id,
  o.company_name,
  o.phone, o.email,
  o.address1, o.city, o.state, o.postal, o.website,
  ob.logo_url, ob.primary_color, ob.secondary_color, ob.accent_color, ob.theme_mode
FROM public.user_profiles up
JOIN public.orgs o ON o.id = up.org_id
LEFT JOIN public.org_branding ob ON ob.org_id = o.id;

GRANT SELECT ON public.v_branding_for_user TO authenticated;