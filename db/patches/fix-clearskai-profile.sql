-- Fix ClearSkai Technologies profile and company data
-- Run against: postgresql://...?schema=app
SET search_path TO app;

-- 1. Fix Damien's member record: owner/admin + full profile
UPDATE "tradesCompanyMember" 
SET 
  role = 'owner',
  "isOwner" = true,
  "isAdmin" = true,
  "canEditCompany" = true,
  "companyName" = 'ClearSkai Technologies, LLC',
  "tradeType" = 'Smart Home & Technology',
  "jobTitle" = 'Owner / Operator',
  title = 'Founder & CEO',
  specialties = ARRAY['AI Pre-Loss Documentation','Smart Home Technology','Security Systems','Insurance Claims Technology','Roof Inspections','IoT Integration'],
  bio = 'Founder of ClearSkai Technologies — building AI-powered pre-loss documentation and claims management tools for roofing contractors, property owners, and insurance adjusters. Passionate about smart home technology and property protection.',
  "yearsExperience" = 8,
  city = 'Flagstaff',
  state = 'AZ',
  zip = '86001',
  "serviceArea" = 'Northern Arizona, Phoenix Metro',
  "companyWebsite" = 'https://clearskai.com',
  "companyLicense" = 'ROC-339211',
  "emergencyAvailable" = true,
  "freeEstimates" = true,
  languages = ARRAY['English','Spanish'],
  "paymentMethods" = ARRAY['Credit Card','ACH','Check','Financing Available'],
  "updatedAt" = NOW()
WHERE "userId" = 'user_35Lks8c1cQpyxGpsXEO2cmBZNvb';

-- 2. Enrich the company record
UPDATE "tradesCompany"
SET
  phone = '(480) 995-5820',
  email = 'info@clearskai.com',
  website = 'https://clearskai.com',
  city = 'Flagstaff',
  state = 'AZ',
  zip = '86001',
  "licenseNumber" = 'ROC-339211',
  "serviceArea" = ARRAY['Northern Arizona','Phoenix Metro','Sedona','Prescott'],
  "updatedAt" = NOW()
WHERE id = 'dc018500-e07f-4c95-a8f9-217161f732f0';

-- Verify
SELECT m.id, m."firstName", m."lastName", m."companyName", m.role, m."isOwner", m."isAdmin", m."tradeType", m."jobTitle", m.city, m.state,
       c.name as company_name, c.city as company_city, c.state as company_state
FROM "tradesCompanyMember" m
LEFT JOIN "tradesCompany" c ON m."companyId" = c.id
WHERE m."userId" = 'user_35Lks8c1cQpyxGpsXEO2cmBZNvb';
