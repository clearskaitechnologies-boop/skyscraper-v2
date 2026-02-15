-- Add baseLayoutJson to report_templates for real template system
ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS base_layout_json JSONB DEFAULT '{"sections": [], "header": {}, "footer": {}}'::jsonb;

-- Add preview_image_url for template thumbnails
ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- Add category field if not exists
ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Update existing marketplace templates with proper structure
UPDATE report_templates
SET base_layout_json = jsonb_build_object(
  'header', jsonb_build_object(
    'showLogo', true,
    'showCompanyName', true,
    'title', name
  ),
  'sections', jsonb_build_array(
    jsonb_build_object('type', 'claim_overview', 'enabled', true, 'order', 1),
    jsonb_build_object('type', 'property_info', 'enabled', true, 'order', 2),
    jsonb_build_object('type', 'damage_summary', 'enabled', true, 'order', 3),
    jsonb_build_object('type', 'photo_grid', 'enabled', true, 'order', 4),
    jsonb_build_object('type', 'recommendations', 'enabled', true, 'order', 5)
  ),
  'footer', jsonb_build_object(
    'showFooterText', true,
    'showContactInfo', true
  ),
  'styles', jsonb_build_object(
    'primaryColor', '{{primaryColor}}',
    'accentColor', '{{accentColor}}',
    'logoUrl', '{{logoUrl}}'
  )
)
WHERE template_type = 'MARKETPLACE' AND base_layout_json IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_base_layout ON report_templates USING gin(base_layout_json);
