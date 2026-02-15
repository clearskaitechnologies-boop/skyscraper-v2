-- Migration: Add tax rate to org_branding
-- Date: 2026-01-11
-- Purpose: Support org-level tax configuration for invoices and supplements
-- Note: Uses 'app' schema (Supabase). Column names use snake_case to match pg conventions.

-- Add tax_rate column to org_branding (default 0 = no tax)
ALTER TABLE app.org_branding 
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0.00;

-- Add tax_enabled flag for explicit control
ALTER TABLE app.org_branding 
ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN DEFAULT false;

-- Add state field for state-specific tax defaults
ALTER TABLE app.org_branding 
ADD COLUMN IF NOT EXISTS business_state VARCHAR(2);

-- Add comment for documentation
COMMENT ON COLUMN app.org_branding.tax_rate IS 'Sales tax rate as percentage (e.g., 8.5 = 8.5%)';
COMMENT ON COLUMN app.org_branding.tax_enabled IS 'Whether to apply tax to invoices and supplements';
COMMENT ON COLUMN app.org_branding.business_state IS 'State abbreviation for tax defaults (e.g., AZ, CA)';
