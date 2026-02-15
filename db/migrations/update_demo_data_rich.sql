-- Update demo data with rich details
SET search_path TO app;

-- Update John Smith claim with comprehensive details
UPDATE claims 
SET 
    title = 'John Smith - Hail Damage Insurance Claim',
    description = 'Severe hail storm on January 15, 2026 caused significant damage to the roof, siding, and gutters. Multiple areas of impact damage documented. Homeowner filed claim with State Farm within 24 hours of storm event.',
    status = 'inspection_scheduled',
    carrier = 'State Farm',
    "policyNumber" = 'SF-2026-AZ-78542',
    "estimatedValue" = 28500,
    "claimNumber" = 'CLM-2026-001542',
    "dateOfLoss" = '2026-01-15',
    "updatedAt" = NOW()
WHERE id = 'demo-claim-john-smith-cmhe0kl1j0000acz0am77w682';

-- Update John Smith contact with full details
UPDATE contacts
SET 
    email = 'john.smith@email.com',
    phone = '(602) 555-0147',
    street = '1847 North Mountain View Drive',
    city = 'Phoenix',
    state = 'AZ',
    "zipCode" = '85016',
    "updatedAt" = NOW()
WHERE id = 'contact-john-damien';

-- Update Jane Smith lead with rich details for Job Center demo
UPDATE leads
SET 
    title = 'Jane Smith - Roof Replacement (Out of Pocket)',
    description = 'Customer requesting full roof replacement. 25-year old shingle roof showing age-related wear. No insurance claim - customer paying directly. Quoted $18,500 for architectural shingles with 30-year warranty.',
    value = 1850000, -- $18,500.00 in cents
    stage = 'proposal',
    temperature = 'hot',
    "updatedAt" = NOW()
WHERE id = 'lead-jane-damien';

-- Update Jane Smith contact
UPDATE contacts
SET 
    email = 'jane.smith@email.com',
    phone = '(480) 555-0234',
    street = '4521 East Oak Avenue',
    city = 'Scottsdale',
    state = 'AZ',
    "zipCode" = '85251',
    "updatedAt" = NOW()
WHERE id = 'contact-jane-damien';

-- Create Bob Smith contact for Leads demo
INSERT INTO contacts (id, "orgId", "firstName", "lastName", email, phone, street, city, state, "zipCode", "createdAt", "updatedAt")
VALUES (
    'contact-bob-smith-demo',
    'cmhe0kl1j0000acz0am77w682',
    'Bob',
    'Smith',
    'bob.smith@email.com',
    '(623) 555-0891',
    '7823 West Thunderbird Road',
    'Glendale',
    'AZ',
    '85306',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    "firstName" = 'Bob',
    "lastName" = 'Smith',
    email = 'bob.smith@email.com',
    phone = '(623) 555-0891',
    street = '7823 West Thunderbird Road',
    city = 'Glendale',
    state = 'AZ',
    "zipCode" = '85306',
    "updatedAt" = NOW();

-- Create Bob Smith lead (NEW lead in intake stage - demonstrates Leads flow)
INSERT INTO leads (id, "orgId", "contactId", title, description, source, "jobCategory", stage, temperature, value, "createdAt", "updatedAt")
VALUES (
    'lead-bob-smith-demo',
    'cmhe0kl1j0000acz0am77w682',
    'contact-bob-smith-demo',
    'Bob Smith - New Roof Inquiry',
    'Homeowner called about potential roof repair after noticing water stains on ceiling. Needs inspection to determine if insurance claim or out-of-pocket repair. Awaiting initial assessment.',
    'phone_call',
    'lead',  -- This is a NEW lead, not yet categorized
    'new',
    'warm',
    0,  -- Value TBD after inspection
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = 'Bob Smith - New Roof Inquiry',
    description = 'Homeowner called about potential roof repair after noticing water stains on ceiling. Needs inspection to determine if insurance claim or out-of-pocket repair. Awaiting initial assessment.',
    "jobCategory" = 'lead',
    stage = 'new',
    temperature = 'warm',
    "updatedAt" = NOW();

-- Verify the updates
SELECT 'CLAIMS:' AS type, id, title, status, carrier FROM claims WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
UNION ALL
SELECT 'LEADS:', id, title, stage, "jobCategory" FROM leads WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682';
