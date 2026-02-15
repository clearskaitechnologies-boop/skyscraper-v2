-- Migration: Create Report Templates System
-- Date: 2024-12-16
-- Purpose: Template engine for proposals, claims, and marketplace

CREATE TABLE IF NOT EXISTS report_templates (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('SYSTEM', 'COMPANY', 'MARKETPLACE')),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  price_cents INTEGER,
  publisher TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_templates_org_id ON report_templates(org_id);
CREATE INDEX idx_report_templates_template_type ON report_templates(template_type);
CREATE INDEX idx_report_templates_is_public ON report_templates(is_public);

CREATE TABLE IF NOT EXISTS template_sections (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  placeholders JSONB,
  "order" INTEGER NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  
  FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE CASCADE
);

CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);

COMMENT ON TABLE report_templates IS 'Template definitions for AI-driven document generation';
COMMENT ON COLUMN report_templates.template_type IS 'SYSTEM = built-in, COMPANY = custom, MARKETPLACE = for sale';
COMMENT ON COLUMN report_templates.price_cents IS 'Marketplace pricing - null = free';
COMMENT ON TABLE template_sections IS 'Ordered sections within a template with AI placeholders';
COMMENT ON COLUMN template_sections.section_key IS 'References REPORT_SECTION_REGISTRY in code';
