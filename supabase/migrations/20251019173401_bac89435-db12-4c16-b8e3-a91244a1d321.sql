-- Add caption provenance and confidence tracking to report_photos
ALTER TABLE public.report_photos
  ADD COLUMN IF NOT EXISTS caption_source text,         -- 'ai' | 'user'
  ADD COLUMN IF NOT EXISTS caption_confidence numeric;  -- 0..1