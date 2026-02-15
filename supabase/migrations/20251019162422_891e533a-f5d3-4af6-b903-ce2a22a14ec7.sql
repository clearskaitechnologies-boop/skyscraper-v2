-- Add missing columns to org_branding table to match the code expectations
ALTER TABLE public.org_branding
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS theme_mode text DEFAULT 'light';

-- Add index for faster org_id lookups if not exists
CREATE INDEX IF NOT EXISTS idx_org_branding_org_id ON public.org_branding(org_id);