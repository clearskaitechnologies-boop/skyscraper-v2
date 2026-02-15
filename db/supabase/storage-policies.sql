-- ============================================================================
-- Supabase Storage Security Policies (RLS)
-- ============================================================================
-- 
-- These policies control access to Supabase Storage buckets.
-- Run these in Supabase SQL Editor or via Prisma migrations.
-- 
-- Buckets:
--   1. photos      - Private, claim photos (JPEG, PNG, WEBP, HEIC)
--   2. documents   - Private, claim documents (PDF, Word, Excel, etc.)
--   3. brochures   - Public read, vendor marketing materials
-- 
-- Security Model:
--   - Users can only upload to their own organization's folders
--   - Users can only download files from their organization
--   - Clients (portal users) can only upload to claims they have access to
--   - Public brochures bucket allows anyone to read, but only admins can write
-- 
-- ============================================================================

-- ============================================================================
-- 1. PHOTOS BUCKET (Private)
-- ============================================================================

-- Enable RLS on photos bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload photos to their own org's folders
CREATE POLICY "Users can upload photos to their org"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view photos from their org
CREATE POLICY "Users can view photos from their org"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos'
  AND (
    -- User owns the folder (uploaded by them)
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- User belongs to the same org (check via claims table)
    EXISTS (
      SELECT 1 FROM public.claims
      WHERE public.claims.id = (storage.foldername(name))[2]
      AND public.claims.org_id = (
        SELECT org_id FROM public.users WHERE id = auth.uid()
      )
    )
  )
);

-- Policy: Users can delete their own uploaded photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own photos (replace)
CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- 2. DOCUMENTS BUCKET (Private)
-- ============================================================================

-- Policy: Users can upload documents to their own org's folders
CREATE POLICY "Users can upload documents to their org"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view documents from their org
CREATE POLICY "Users can view documents from their org"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    -- User owns the folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- User belongs to same org
    EXISTS (
      SELECT 1 FROM public.claims
      WHERE public.claims.id = (storage.foldername(name))[2]
      AND public.claims.org_id = (
        SELECT org_id FROM public.users WHERE id = auth.uid()
      )
    )
  )
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- 3. BROCHURES BUCKET (Public Read, Admin Write)
-- ============================================================================

-- Policy: Anyone can read brochures (public marketing materials)
CREATE POLICY "Anyone can view brochures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brochures');

-- Policy: Only admins can upload brochures
CREATE POLICY "Only admins can upload brochures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brochures'
  AND (
    SELECT role FROM public.users WHERE id = auth.uid()
  ) IN ('admin', 'super_admin')
);

-- Policy: Only admins can delete brochures
CREATE POLICY "Only admins can delete brochures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'brochures'
  AND (
    SELECT role FROM public.users WHERE id = auth.uid()
  ) IN ('admin', 'super_admin')
);

-- Policy: Only admins can update brochures
CREATE POLICY "Only admins can update brochures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brochures'
  AND (
    SELECT role FROM public.users WHERE id = auth.uid()
  ) IN ('admin', 'super_admin')
);

-- ============================================================================
-- 4. CLIENT PORTAL ACCESS (Special Case)
-- ============================================================================
-- 
-- Portal clients don't have auth.uid() in the traditional sense.
-- They use portal tokens validated via Edge Functions.
-- 
-- For portal uploads, we bypass RLS by using service role key on server-side.
-- The API route validates the portal token and enforces org/claim boundaries.
-- 
-- See: /api/portal/client/upload/route.ts
-- 
-- This is secure because:
-- 1. Portal token is validated server-side via validatePortalToken()
-- 2. Token encodes orgId + claimId + clientId
-- 3. Token has expiration (default: 7 days)
-- 4. Service role key is never exposed to client
-- 5. Upload path includes orgId for audit trail
-- 
-- ============================================================================

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if RLS is enabled on storage.objects
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- List all policies on storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Test query: Can user access a photo?
-- Replace 'user-id' and 'claim-id' with actual values
SELECT 
  EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = 'photos'
    AND name LIKE '%claim-id%'
    AND (
      (storage.foldername(name))[1] = 'user-id'
      OR EXISTS (
        SELECT 1 FROM public.claims
        WHERE public.claims.id = 'claim-id'
        AND public.claims.org_id = (
          SELECT org_id FROM public.users WHERE id = 'user-id'
        )
      )
    )
  ) AS can_access_photo;

-- ============================================================================
-- ROLLBACK (If needed)
-- ============================================================================

-- DROP ALL POLICIES (DANGER: This disables all security)
/*
DROP POLICY IF EXISTS "Users can upload photos to their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos from their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload documents to their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents from their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view brochures" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload brochures" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete brochures" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update brochures" ON storage.objects;

ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. These policies assume Supabase Auth is configured with Clerk integration
-- 2. auth.uid() returns the Clerk user ID
-- 3. Users table has org_id column linking to organizations
-- 4. Claims table has org_id column for org-scoping
-- 5. Signed URLs bypass RLS - use short expiration times (1 hour max)
-- 6. Service role key bypasses ALL policies - protect it like production DB password
-- 7. Test policies in dev environment before applying to production
-- 8. Monitor storage.objects audit logs for unauthorized access attempts
-- 
-- ============================================================================
