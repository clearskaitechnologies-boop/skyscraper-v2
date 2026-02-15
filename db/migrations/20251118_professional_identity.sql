-- Migration: Professional Identity and Gamification Framework
-- Master Prompt #56: Add fields for employee profiles, badges, and external credibility
-- Date: 2025-11-18

-- Add professional identity fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS headshot_url TEXT,
ADD COLUMN IF NOT EXISTS public_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS job_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS client_testimonials JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS earned_badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_earned_badges ON users USING gin (earned_badges);
CREATE INDEX IF NOT EXISTS idx_users_public_skills ON users USING gin (public_skills);

-- Add comments for documentation
COMMENT ON COLUMN users.headshot_url IS 'Profile picture URL for internal Teams and external Trades Network display';
COMMENT ON COLUMN users.public_skills IS 'Array of skills/trades: [{skill: "Roofing", level: "Expert"}]';
COMMENT ON COLUMN users.job_history IS 'Array of work history: [{company: "XYZ Roofing", role: "Lead Estimator", startDate: "2020-01", endDate: "2023-12", description: "..."}]';
COMMENT ON COLUMN users.client_testimonials IS 'Array of client reviews: [{clientName: "John Doe", clientCompany: "ABC Insurance", quote: "Excellent work!", date: "2024-01-15", rating: 5}]';
COMMENT ON COLUMN users.earned_badges IS 'Array of gamification badges: [{badgeId: "TOP_SALE", awardedAt: "2024-11-01", metadata: {value: 50000}}]';
COMMENT ON COLUMN users.bio IS 'Professional bio for public profile display';
COMMENT ON COLUMN users.years_experience IS 'Total years of industry experience';
COMMENT ON COLUMN users.certifications IS 'Array of certifications: [{name: "HAAG Certified Inspector", issuer: "HAAG", dateEarned: "2023-06", expiresAt: "2025-06"}]';

-- Sample badge data structure:
-- earned_badges example:
-- [
--   {
--     "badgeId": "TOP_SALE",
--     "badgeName": "Top Sale",
--     "awardedAt": "2024-11-01T00:00:00Z",
--     "metadata": {
--       "value": 50000,
--       "claimId": "claim_123"
--     }
--   },
--   {
--     "badgeId": "TOP_FOLLOWUP",
--     "badgeName": "Top Follow-up",
--     "awardedAt": "2024-10-15T00:00:00Z",
--     "metadata": {
--       "responseTime": "2 hours",
--       "leadId": "lead_456"
--     }
--   }
-- ]
