-- Add payment and eSign tracking columns to reports table
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS acceptance JSONB,
  ADD COLUMN IF NOT EXISTS payments JSONB,
  ADD COLUMN IF NOT EXISTS esign JSONB;

-- Add comment for status values
COMMENT ON COLUMN public.reports.status IS 'draft | sent | accepted | paid | signed | complete';

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);