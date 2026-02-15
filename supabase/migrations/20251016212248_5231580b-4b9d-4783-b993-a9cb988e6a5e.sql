-- Add storage RLS policies for defense-in-depth protection
-- These policies ensure that even if service role keys are compromised,
-- users can only access files they own

-- Reports: users can only access their own report PDFs
CREATE POLICY "Users can read their own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id::text FROM public.reports r
    JOIN public.leads l ON l.id = r.lead_id
    WHERE l.user_id = auth.uid()
  )
);

-- Photos: users can access photos from their inspections
CREATE POLICY "Users can read their inspection photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] IN (
    SELECT i.id::text FROM public.inspections i
    JOIN public.leads l ON l.id = i.lead_id
    WHERE l.user_id = auth.uid()
  )
);

-- Users can upload photos to their inspections
CREATE POLICY "Users can upload their inspection photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] IN (
    SELECT i.id::text FROM public.inspections i
    JOIN public.leads l ON l.id = i.lead_id
    WHERE l.user_id = auth.uid()
  )
);

-- Folders: users can only access their own folders
CREATE POLICY "Users can access their own folders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'folders' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload to their own folders
CREATE POLICY "Users can upload to their own folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'folders' AND
  (storage.foldername(name))[1] = auth.uid()::text
);