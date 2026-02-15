-- ============================================================================
-- REPORT BUILDER DATABASE SCHEMA
-- ============================================================================
-- Phase 2: Project management system for CompanyCam-style workflow
-- ============================================================================

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Property Info
  property_address TEXT NOT NULL,
  insured_name TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Project Meta
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  labels TEXT[] DEFAULT '{}', -- PostgreSQL array

  -- Stats (denormalized for performance)
  photo_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  estimate_count INTEGER DEFAULT 0,

  -- Indexes
  CONSTRAINT projects_status_check CHECK (status IN ('active', 'archived', 'completed'))
);

CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_projects_created_by ON projects(created_by_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Photos Table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by_id TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Storage
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- AI Metadata
  ai_caption TEXT,
  ai_damage_type TEXT[], -- ["hail", "wind", "soft-metal-dents"]
  ai_confidence DECIMAL(5, 2), -- 0.00 to 1.00
  ai_labels TEXT[],

  -- Manual Metadata
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  roof_area TEXT CHECK (roof_area IN ('front', 'back', 'left', 'right', 'skylight', 'vent', 'flashing', 'interior')),
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by_id);
CREATE INDEX idx_photos_sort_order ON photos(project_id, sort_order);
CREATE INDEX idx_photos_is_deleted ON photos(is_deleted) WHERE is_deleted = FALSE;

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Report Type
  type TEXT NOT NULL CHECK (type IN ('insurance-claim', 'retail-proposal', 'inspection', 'supplement', 'code-compliance')),
  version TEXT NOT NULL CHECK (version IN ('insurance', 'retail')),

  -- Content
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'sent')),

  -- Data (from ClaimPacketData — stored as JSONB for flexibility)
  data JSONB DEFAULT '{}',

  -- Export History
  last_exported_at TIMESTAMP WITH TIME ZONE,
  last_export_format TEXT CHECK (last_export_format IN ('pdf', 'docx'))
);

CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_data_gin ON reports USING GIN (data); -- For JSONB queries

-- Report Sections Table
CREATE TABLE IF NOT EXISTS report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

  -- Section Type
  type TEXT NOT NULL CHECK (type IN (
    'cover-page', 'weather', 'damage-summary', 'photos', 'scope', 
    'code-references', 'contractor-letter', 'supplement', 'timeline', 
    'material-options', 'warranty', 'signature'
  )),

  -- Content
  title TEXT NOT NULL,
  content TEXT, -- Markdown or JSON
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  -- Auto-Generated Flag
  is_auto_generated BOOLEAN DEFAULT FALSE,
  last_ai_generated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_report_sections_report_id ON report_sections(report_id);
CREATE INDEX idx_report_sections_sort_order ON report_sections(report_id, sort_order);
CREATE INDEX idx_report_sections_is_visible ON report_sections(is_visible);

-- Estimates Table
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Estimate Type
  type TEXT NOT NULL CHECK (type IN ('xactimate', 'manual', 'ai-generated')),

  -- Content
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'approved')),

  -- Total
  total_amount DECIMAL(10, 2) DEFAULT 0.00,

  -- Export
  xactimate_xml TEXT,
  last_exported_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_estimates_project_id ON estimates(project_id);
CREATE INDEX idx_estimates_status ON estimates(status);

-- Estimate Line Items Table
CREATE TABLE IF NOT EXISTS estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  -- Item Details
  code TEXT, -- Xactimate code
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,

  -- Category
  category TEXT NOT NULL CHECK (category IN ('roofing', 'siding', 'interior', 'other')),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_estimate_line_items_estimate_id ON estimate_line_items(estimate_id);
CREATE INDEX idx_estimate_line_items_sort_order ON estimate_line_items(estimate_id, sort_order);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by_id TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Storage
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- Metadata
  type TEXT NOT NULL CHECK (type IN ('contract', 'permit', 'invoice', 'correspondence', 'other')),
  tags TEXT[] DEFAULT '{}',

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_is_deleted ON documents(is_deleted) WHERE is_deleted = FALSE;

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Contact Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,

  -- Role
  role TEXT NOT NULL CHECK (role IN ('homeowner', 'adjuster', 'contractor', 'agent', 'other')),

  -- Metadata
  notes TEXT
);

CREATE INDEX idx_contacts_project_id ON contacts(project_id);
CREATE INDEX idx_contacts_role ON contacts(role);

-- AI Actions Table (audit log)
CREATE TABLE IF NOT EXISTS ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  triggered_by_id TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Action Type
  type TEXT NOT NULL CHECK (type IN (
    'auto-caption-photos', 'detect-damage-types', 'generate-full-report', 
    'build-scope-from-photos', 'fetch-weather-data', 'extract-code-references'
  )),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Results
  result JSONB,
  error TEXT,

  -- Timing
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_actions_project_id ON ai_actions(project_id);
CREATE INDEX idx_ai_actions_status ON ai_actions(status);
CREATE INDEX idx_ai_actions_type ON ai_actions(type);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING STATS
-- ============================================================================

-- Trigger: Update project photo count
CREATE OR REPLACE FUNCTION update_project_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET photo_count = photo_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET photo_count = photo_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_photo_count
AFTER INSERT OR DELETE ON photos
FOR EACH ROW EXECUTE FUNCTION update_project_photo_count();

-- Trigger: Update project report count
CREATE OR REPLACE FUNCTION update_project_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET report_count = report_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET report_count = report_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_report_count
AFTER INSERT OR DELETE ON reports
FOR EACH ROW EXECUTE FUNCTION update_project_report_count();

-- Trigger: Update project estimate count
CREATE OR REPLACE FUNCTION update_project_estimate_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET estimate_count = estimate_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET estimate_count = estimate_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_estimate_count
AFTER INSERT OR DELETE ON estimates
FOR EACH ROW EXECUTE FUNCTION update_project_estimate_count();

-- Trigger: Update project updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET updated_at = NOW() WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_timestamp_on_photo
AFTER INSERT OR UPDATE ON photos
FOR EACH ROW EXECUTE FUNCTION update_project_timestamp();

CREATE TRIGGER trigger_update_project_timestamp_on_report
AFTER INSERT OR UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_project_timestamp();

CREATE TRIGGER trigger_update_project_timestamp_on_estimate
AFTER INSERT OR UPDATE ON estimates
FOR EACH ROW EXECUTE FUNCTION update_project_timestamp();
