-- Fix photos bucket storage policies by removing all existing policies first
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on storage.objects for photos bucket
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname LIKE '%photo%' OR policyname LIKE '%Photos%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    END LOOP;
END $$;

-- Create secure policies that verify lead ownership through inspections
CREATE POLICY "Users can view photos from their leads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Allow if photo belongs to user's inspection
    (storage.foldername(name))[1] IN (
      SELECT i.id::text 
      FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    -- Or if user is admin/owner
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'owner'::app_role)
  )
);

CREATE POLICY "Users can upload photos to their inspections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Verify inspection belongs to user's lead
    (storage.foldername(name))[1] IN (
      SELECT i.id::text 
      FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    -- Or if user is admin/owner
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'owner'::app_role)
  )
);

CREATE POLICY "Users can delete photos from their inspections"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Verify photo belongs to user's inspection
    (storage.foldername(name))[1] IN (
      SELECT i.id::text 
      FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    -- Or if user is admin/owner
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'owner'::app_role)
  )
);

CREATE POLICY "Users can update photos from their inspections"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Verify photo belongs to user's inspection
    (storage.foldername(name))[1] IN (
      SELECT i.id::text 
      FROM inspections i
      JOIN leads l ON i.lead_id = l.id
      WHERE l.user_id = auth.uid()
    )
    -- Or if user is admin/owner
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'owner'::app_role)
  )
);