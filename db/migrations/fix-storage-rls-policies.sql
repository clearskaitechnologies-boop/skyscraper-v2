-- Run this in Supabase SQL Editor to enable uploads to profile-photos bucket
-- This fixes the "new row violates row-level security policy" error

-- Allow anyone to upload to profile-photos bucket
CREATE POLICY "Allow public uploads to profile-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

-- Allow anyone to update/overwrite files in profile-photos bucket  
CREATE POLICY "Allow public updates to profile-photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos');

-- Allow anyone to delete files in profile-photos bucket
CREATE POLICY "Allow public deletes to profile-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos');

-- Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
