-- Create je_assets table for JE Shaw data
CREATE TABLE IF NOT EXISTS public.je_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_id text UNIQUE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  layer text NOT NULL,
  feature_type text,
  severity text,
  geometry jsonb NOT NULL,
  attributes jsonb DEFAULT '{}'::jsonb,
  captured_at timestamptz,
  source_version text,
  inserted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_je_assets_lead_id ON public.je_assets(lead_id);
CREATE INDEX IF NOT EXISTS idx_je_assets_layer ON public.je_assets(layer);
CREATE INDEX IF NOT EXISTS idx_je_assets_ext_id ON public.je_assets(ext_id);

-- Enable RLS
ALTER TABLE public.je_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view je_assets for their own leads
CREATE POLICY "Users can view je_assets for their leads"
  ON public.je_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = je_assets.lead_id
      AND leads.user_id = auth.uid()
    )
  );

-- Policy: Admins/owners can manage all je_assets
CREATE POLICY "Admins can manage je_assets"
  ON public.je_assets FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'owner'::app_role)
  );

-- Add je_snapshot column to reports table
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS je_snapshot jsonb;
