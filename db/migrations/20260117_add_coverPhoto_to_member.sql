-- Migration: Add coverPhoto column to tradesCompanyMember table
-- Date: 2026-01-17
-- Purpose: Allow individual trades members to have cover photos

ALTER TABLE app."tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'app' 
  AND table_name = 'tradesCompanyMember' 
  AND column_name = 'coverPhoto';
