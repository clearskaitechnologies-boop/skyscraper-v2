-- Seed Default Estimate Template for All Organizations
-- This gives every organization a starter template to see the flow

-- First, ensure we have a good estimate template in the marketplace
-- (The contractor-estimate-premium should already exist from earlier migrations)

-- Now insert into orgTemplate for ALL existing organizations
-- This links the estimate template to each org so it shows on their Templates page
INSERT INTO "orgTemplate" (
  id, "orgId", "templateId", "customName", "isActive", "createdAt", "updatedAt"
)
SELECT 
  'default-est-' || substring(o.id from 1 for 20),
  o.id,
  t.id,
  'Contractor Estimate',
  true,
  NOW(),
  NOW()
FROM "Org" o
CROSS JOIN (
  SELECT id FROM template 
  WHERE slug = 'contractor-estimate-premium' 
     OR slug = 'general-contractor-estimate'
  LIMIT 1
) t
WHERE NOT EXISTS (
  SELECT 1 FROM "orgTemplate" ot 
  WHERE ot."orgId" = o.id 
  AND ot."templateId" = t.id
);

-- Verify
SELECT 
  'OrgTemplates created:' as status,
  COUNT(*) as count 
FROM "orgTemplate";
