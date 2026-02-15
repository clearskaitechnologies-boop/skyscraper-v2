-- Migration: Add template sections support and extend report_templates
-- Date: 2024-12-16

-- Add new columns to existing report_templates table
ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'COMPANY',
ADD COLUMN IF NOT EXISTS layout_version TEXT DEFAULT 'v1';

-- Create index on template_type for faster filtering
CREATE INDEX IF NOT EXISTS report_templates_template_type_idx ON report_templates(template_type);

-- Create report_template_sections table
CREATE TABLE IF NOT EXISTS report_template_sections (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  layout_variant TEXT NOT NULL,
  placeholders JSONB NOT NULL,
  ai_instructions TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE CASCADE
);

-- Create indexes on report_template_sections
CREATE INDEX IF NOT EXISTS report_template_sections_template_id_idx ON report_template_sections(template_id);
CREATE INDEX IF NOT EXISTS report_template_sections_section_key_idx ON report_template_sections(section_key);

-- Add comment
COMMENT ON TABLE report_template_sections IS 'Detailed section configuration for report templates - used by AI Claims Wizard and Proposal Engine';
