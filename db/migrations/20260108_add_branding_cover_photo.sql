-- Add coverPhotoUrl column to org_branding table
-- Run with: psql $DATABASE_URL -f db/migrations/20260108_add_branding_cover_photo.sql

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'org_branding' 
        AND column_name = 'coverPhotoUrl'
    ) THEN
        ALTER TABLE public.org_branding ADD COLUMN "coverPhotoUrl" TEXT;
        RAISE NOTICE 'Added coverPhotoUrl column to org_branding';
    ELSE
        RAISE NOTICE 'coverPhotoUrl column already exists in org_branding';
    END IF;
END $$;
