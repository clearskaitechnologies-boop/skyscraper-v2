-- Create storage buckets for photos and reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos','photos', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports','reports', false) 
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "photos_read_public" ON storage.objects;
DROP POLICY IF EXISTS "photos_write_auth" ON storage.objects;
DROP POLICY IF EXISTS "reports_read_owner" ON storage.objects;
DROP POLICY IF EXISTS "reports_write_auth" ON storage.objects;

-- Photos bucket: public read
CREATE POLICY "photos_read_public" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'photos');

-- Photos bucket: authenticated write
CREATE POLICY "photos_write_auth" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Reports bucket: only owner/admin or creator can read
CREATE POLICY "reports_read_owner" 
ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'reports'
  AND (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('owner','admin'))
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Reports bucket: authenticated can write to their own folder
CREATE POLICY "reports_write_auth" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Helper function to generate signed URLs for reports
CREATE OR REPLACE FUNCTION public.sign_report_url(path text, expires_in int DEFAULT 3600)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE 
  v_url text;
BEGIN
  SELECT url INTO v_url 
  FROM storage.objects 
  WHERE bucket_id = 'reports' AND name = path;
  
  IF v_url IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN v_url;
END;
$$;