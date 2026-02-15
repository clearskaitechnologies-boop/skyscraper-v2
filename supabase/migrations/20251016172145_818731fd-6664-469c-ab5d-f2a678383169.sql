-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('reports', 'reports', false, 52428800, ARRAY['application/pdf']::text[]),
  ('brochures', 'brochures', true, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]),
  ('folders', 'folders', false, 52428800, NULL),
  ('photos', 'photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for reports bucket (private - users access their own reports)
CREATE POLICY "Users can upload their own reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own reports"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'reports'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for brochures bucket (public read, authenticated write)
CREATE POLICY "Anyone can view brochures"
ON storage.objects FOR SELECT
USING (bucket_id = 'brochures');

CREATE POLICY "Authenticated users can upload brochures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brochures'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update brochures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brochures'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete brochures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brochures'
  AND auth.uid() IS NOT NULL
);

-- RLS Policies for folders bucket (private)
CREATE POLICY "Users can upload to their folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'folders'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their folders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'folders'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their folders"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'folders'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their folders"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'folders'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for photos bucket (private)
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view photos from their leads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);