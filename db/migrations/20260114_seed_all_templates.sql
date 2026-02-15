-- Seed all 25 marketplace templates with proper categories
INSERT INTO template (id, slug, name, category, "isPublished", "isActive", "isMarketplace", tags, version) VALUES
  (gen_random_uuid(), 'carrier-rebuttal-premium', 'Carrier Rebuttal Premium', 'Insurance', true, true, true, '{insurance,rebuttal,carrier}', '1.0'),
  (gen_random_uuid(), 'commercial-property-report', 'Commercial Property Report', 'Commercial', true, true, true, '{commercial,property,inspection}', '1.0'),
  (gen_random_uuid(), 'contractor-estimate-premium', 'Contractor Estimate Premium', 'Estimates', true, true, true, '{contractor,estimate,premium}', '1.0'),
  (gen_random_uuid(), 'depreciation-analysis-premium', 'Depreciation Analysis Premium', 'Insurance', true, true, true, '{depreciation,analysis,insurance}', '1.0'),
  (gen_random_uuid(), 'detailed-contractor-proposal', 'Detailed Contractor Proposal', 'Proposals', true, true, true, '{contractor,proposal,detailed}', '1.0'),
  (gen_random_uuid(), 'fire-loss-documentation', 'Fire Loss Documentation', 'Fire', true, true, true, '{fire,loss,documentation}', '1.0'),
  (gen_random_uuid(), 'hail-damage-inspection', 'Hail Damage Inspection', 'Storm', true, true, true, '{hail,damage,inspection,storm}', '1.0'),
  (gen_random_uuid(), 'initial-claim-inspection', 'Initial Claim Inspection', 'Inspections', true, true, true, '{initial,claim,inspection}', '1.0'),
  (gen_random_uuid(), 'interior-damage-assessment', 'Interior Damage Assessment', 'Interior', true, true, true, '{interior,damage,assessment}', '1.0'),
  (gen_random_uuid(), 'professional-damage-assessment', 'Professional Damage Assessment', 'Assessments', true, true, true, '{professional,damage,assessment}', '1.0'),
  (gen_random_uuid(), 'public-adjuster-premium', 'Public Adjuster Premium', 'Insurance', true, true, true, '{public,adjuster,premium,insurance}', '1.0'),
  (gen_random_uuid(), 'quick-inspection-report', 'Quick Inspection Report', 'Inspections', true, true, true, '{quick,inspection,report}', '1.0'),
  (gen_random_uuid(), 'restoration-company-special', 'Restoration Company Special', 'Restoration', true, true, true, '{restoration,company,special}', '1.0'),
  (gen_random_uuid(), 'roofing-inspection-premium', 'Roofing Inspection Premium', 'Roofing', true, true, true, '{roofing,inspection,premium}', '1.0'),
  (gen_random_uuid(), 'roofing-specialist-report', 'Roofing Specialist Report', 'Roofing', true, true, true, '{roofing,specialist,report}', '1.0'),
  (gen_random_uuid(), 'standard-roof-damage-report', 'Standard Roof Damage Report', 'Roofing', true, true, true, '{roof,damage,standard}', '1.0'),
  (gen_random_uuid(), 'storm-damage-comprehensive', 'Storm Damage Comprehensive', 'Storm', true, true, true, '{storm,damage,comprehensive}', '1.0'),
  (gen_random_uuid(), 'supplement-line-item-premium', 'Supplement Line Item Premium', 'Supplements', true, true, true, '{supplement,line,item,premium}', '1.0'),
  (gen_random_uuid(), 'supplement-request-template', 'Supplement Request Template', 'Supplements', true, true, true, '{supplement,request,template}', '1.0'),
  (gen_random_uuid(), 'water-damage-assessment', 'Water Damage Assessment', 'Water', true, true, true, '{water,damage,assessment}', '1.0'),
  (gen_random_uuid(), 'weather-correlation-premium', 'Weather Correlation Premium', 'Weather', true, true, true, '{weather,correlation,premium}', '1.0'),
  (gen_random_uuid(), 'weather-damage-report', 'Weather Damage Report', 'Weather', true, true, true, '{weather,damage,report}', '1.0'),
  (gen_random_uuid(), 'weather-damage-specialist', 'Weather Damage Specialist', 'Weather', true, true, true, '{weather,damage,specialist}', '1.0'),
  (gen_random_uuid(), 'wind-damage-report', 'Wind Damage Report', 'Storm', true, true, true, '{wind,damage,report,storm}', '1.0')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  "isPublished" = EXCLUDED."isPublished",
  "isActive" = EXCLUDED."isActive",
  tags = EXCLUDED.tags;

-- Verify count
SELECT COUNT(*) as total_templates, 
       COUNT(DISTINCT category) as categories 
FROM template WHERE "isPublished" = true;
