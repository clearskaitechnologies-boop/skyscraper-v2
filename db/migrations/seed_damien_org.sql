-- PERMANENT FIX: Seed demo data for BuildingWithDamien org
SET search_path TO app;

-- Create contacts for the user's org
INSERT INTO contacts (id, "orgId", "firstName", "lastName", email, phone, street, city, state, "zipCode", "createdAt", "updatedAt")
VALUES 
    ('contact-john-damien', 'cmhe0kl1j0000acz0am77w682', 'John', 'Smith', 'john.smith@example.com', '555-0101', '123 Main Street', 'Phoenix', 'AZ', '85001', NOW(), NOW()),
    ('contact-jane-damien', 'cmhe0kl1j0000acz0am77w682', 'Jane', 'Smith', 'jane.smith@example.com', '555-0102', '456 Oak Avenue', 'Scottsdale', 'AZ', '85251', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create leads for the user's org (THIS IS THE MISSING DATA!)
-- Required columns: id, orgId, contactId, title, source, stage, temperature, createdAt, updatedAt
INSERT INTO leads (id, "orgId", "contactId", title, description, source, "jobCategory", stage, temperature, value, "createdAt", "updatedAt")
VALUES 
    ('lead-john-damien', 'cmhe0kl1j0000acz0am77w682', 'contact-john-damien', 'Hail Damage - Main Street Residence', 'Insurance claim for hail damage to roof', 'referral', 'claim', 'new', 'hot', 15000, NOW(), NOW()),
    ('lead-jane-damien', 'cmhe0kl1j0000acz0am77w682', 'contact-jane-damien', 'Roof Inspection - Oak Avenue Property', 'Out of pocket roof inspection and repair', 'website', 'out_of_pocket', 'qualified', 'warm', 8500, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Link ALL marketplace templates to this org
INSERT INTO "OrgTemplate" (id, "orgId", "templateId", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'cmhe0kl1j0000acz0am77w682',
    t.id,
    true,
    NOW(),
    NOW()
FROM "Template" t
WHERE t."isPublished" = true
ON CONFLICT ("orgId", "templateId") DO NOTHING;

-- Verify what we created
SELECT 'CONTACTS:' AS type, COUNT(*) AS count FROM contacts WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
UNION ALL
SELECT 'LEADS:', COUNT(*) FROM leads WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
UNION ALL
SELECT 'JOBS:', COUNT(*) FROM jobs WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
UNION ALL
SELECT 'TEMPLATES:', COUNT(*) FROM "OrgTemplate" WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682';
