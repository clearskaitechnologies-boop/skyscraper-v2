-- Fix photos bucket storage policies to enforce lead ownership
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Create secure policies that verify lead ownership
CREATE POLICY "Users can view photos from their inspections"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Check if photo belongs to user's inspection
    (storage.foldername(name))[1]::uuid IN (
      SELECT i.id FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    OR
    -- Admins and owners can view all photos
    (SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
  )
);

CREATE POLICY "Users can upload photos to their inspections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Check if inspection belongs to user's lead
    (storage.foldername(name))[1]::uuid IN (
      SELECT i.id FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    OR
    -- Admins and owners can upload anywhere
    (SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
  )
);

CREATE POLICY "Users can update their inspection photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    (storage.foldername(name))[1]::uuid IN (
      SELECT i.id FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    OR
    (SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
  )
);

CREATE POLICY "Users can delete their inspection photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    (storage.foldername(name))[1]::uuid IN (
      SELECT i.id FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    OR
    (SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
  )
);