-- Seed: Water Damage Restoration Template (Complete)
-- Created: 2024-12-18
-- Purpose: Production-ready template for water damage claims

INSERT INTO "Template" (
  id,
  title,
  description,
  category,
  tags,
  version,
  "templateJson",
  placeholders,
  "thumbnailUrl",
  "previewPdfUrl",
  "isPublished",
  "createdAt",
  "updatedAt"
) VALUES (
  'tmpl_water_damage_v1',
  'Water Damage Restoration',
  'Comprehensive template for water damage claims including source identification, affected areas, drying documentation, and mold prevention protocols. Optimized for emergency mitigation and insurance carrier submissions.',
  'Water Damage',
  ARRAY['water', 'restoration', 'mitigation', 'drying', 'mold'],
  '1.0.0',
  '{"sections":[{"key":"coverPage","title":"Cover Page","enabled":true,"order":1,"description":"Professional header with claim details and property information"},{"key":"executiveSummary","title":"Executive Summary","enabled":true,"order":2,"aiInstructions":"Provide a concise overview of the water damage incident, primary findings, estimated scope, and professional recommendation. Focus on causation, extent of damage, and urgency level."},{"key":"waterSourceIdentification","title":"Water Source Identification","enabled":true,"order":3,"aiInstructions":"Identify and classify the water source (Category 1/2/3), entry point, duration of exposure, and contributing factors. Include photos of source if available."},{"key":"affectedAreas","title":"Affected Areas Documentation","enabled":true,"order":4,"aiInstructions":"Systematically document all affected rooms, materials, and structural components. Include moisture readings, affected square footage, and material categories (hardwood, drywall, insulation, etc)."},{"key":"moistureMapping","title":"Moisture Mapping & Readings","enabled":true,"order":5,"aiInstructions":"Present moisture meter readings, thermal imaging findings, and drying progress documentation. Include baseline readings and daily monitoring data if available."},{"key":"dryingProtocol","title":"Drying Protocol & Equipment","enabled":true,"order":6,"aiInstructions":"Specify equipment deployed (dehumidifiers, air movers, etc), placement strategy, and expected drying timeline. Include psychrometric calculations if available."},{"key":"moldRisk","title":"Mold Risk Assessment","enabled":true,"order":7,"aiInstructions":"Assess mold growth risk based on water category, exposure duration, and environmental conditions. Recommend preventive measures or remediation if growth detected."},{"key":"scopeOfWork","title":"Scope of Work","enabled":true,"order":8,"aiInstructions":"Provide detailed line-item breakdown of all required mitigation and restoration work. Include material quantities, labor categories, and specialized services needed."},{"key":"photoDocumentation","title":"Photo Documentation","enabled":true,"order":9,"description":"Annotated photos showing water source, affected areas, moisture readings, and damage severity"},{"key":"recommendations","title":"Professional Recommendations","enabled":true,"order":10,"aiInstructions":"Provide expert recommendations for claim resolution, additional testing needs, or scope adjustments. Address carrier-specific concerns if applicable."}],"metadata":{"industry":"Restoration","complexity":"high","estimatedPages":15,"requiredPhotos":20,"turnaroundTime":"24-48 hours"}}',
  ARRAY[
    'CLAIM_NUMBER',
    'INSURED_NAME',
    'PROPERTY_ADDRESS',
    'DATE_OF_LOSS',
    'LOSS_DATE',
    'CARRIER',
    'ADJUSTER_NAME',
    'ADJUSTER_EMAIL',
    'ADJUSTER_PHONE',
    'POLICY_NUMBER',
    'WATER_SOURCE',
    'WATER_CATEGORY',
    'AFFECTED_SQFT',
    'MOISTURE_READINGS',
    'EQUIPMENT_LIST',
    'DRYING_DAYS',
    'MOLD_PRESENT',
    'TOTAL_ESTIMATE',
    'COMPANY_NAME',
    'COMPANY_LICENSE',
    'INSPECTOR_NAME',
    'INSPECTOR_CERT'
  ],
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "updatedAt" = NOW(),
  "isPublished" = true;
