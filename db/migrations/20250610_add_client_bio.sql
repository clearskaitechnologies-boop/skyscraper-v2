-- Add bio field to Client table
-- This allows clients to describe their needs and issues

ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Client"."bio" IS 'Bio/summary describing the client needs and issues they want to address';
