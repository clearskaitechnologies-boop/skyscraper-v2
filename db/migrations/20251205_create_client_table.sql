-- =====================================================
-- 🚀 CRITICAL: Create Client Table
-- =====================================================
-- This table is REQUIRED for Client Portal functionality
-- Without it, Client Portal login will fail with:
-- "The table `public.Client` does not exist"
--
-- Date: December 5, 2025
-- =====================================================

-- Create Client table with all fields from Prisma schema
CREATE TABLE IF NOT EXISTS public."Client" (
  id TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  "userId" TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Client_orgId_idx" ON public."Client"("orgId");
CREATE INDEX IF NOT EXISTS "Client_email_idx" ON public."Client"(email);
CREATE INDEX IF NOT EXISTS "Client_slug_idx" ON public."Client"(slug);
CREATE INDEX IF NOT EXISTS "Client_userId_idx" ON public."Client"("userId");

-- Add foreign key constraint to Org table
ALTER TABLE public."Client" 
  ADD CONSTRAINT "Client_orgId_fkey" 
  FOREIGN KEY ("orgId") 
  REFERENCES public."Org"(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Client table created successfully!';
  RAISE NOTICE '✅ Indexes created: orgId, email, slug, userId';
  RAISE NOTICE '✅ Foreign key to Org table established';
  RAISE NOTICE '🎉 Client Portal is now ready to use!';
END $$;
