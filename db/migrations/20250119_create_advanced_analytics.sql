-- Custom Reports table: User-defined report configurations
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- claims, properties, financial, custom
  config JSONB NOT NULL DEFAULT '{}', -- Report configuration (fields, filters, charts)
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_custom_reports_org_id ON custom_reports(org_id);
CREATE INDEX idx_custom_reports_report_type ON custom_reports(report_type);
CREATE INDEX idx_custom_reports_created_by ON custom_reports(created_by);

-- Scheduled Exports table: Automated report exports
CREATE TABLE IF NOT EXISTS scheduled_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  schedule TEXT NOT NULL, -- daily, weekly, monthly
  format TEXT NOT NULL, -- csv, excel, pdf
  recipients TEXT[] NOT NULL DEFAULT '{}', -- Email addresses
  next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, failed
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_exports_org_id ON scheduled_exports(org_id);
CREATE INDEX idx_scheduled_exports_report_id ON scheduled_exports(report_id);
CREATE INDEX idx_scheduled_exports_next_run_at ON scheduled_exports(next_run_at);
CREATE INDEX idx_scheduled_exports_status ON scheduled_exports(status);

-- Dashboard Widgets table: Custom dashboard configurations
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  user_id TEXT, -- null = org-wide widget
  widget_type TEXT NOT NULL, -- chart, metric, list, map
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- Widget configuration
  position INTEGER NOT NULL DEFAULT 0, -- Display order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_org_id ON dashboard_widgets(org_id);
CREATE INDEX idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX idx_dashboard_widgets_position ON dashboard_widgets(position);

-- Update triggers
CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER update_scheduled_exports_updated_at
  BEFORE UPDATE ON scheduled_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_team_updated_at();

-- Comments
COMMENT ON TABLE custom_reports IS 'User-defined custom reports with configurable fields and filters';
COMMENT ON TABLE scheduled_exports IS 'Automated scheduled report exports via email';
COMMENT ON TABLE dashboard_widgets IS 'Custom dashboard widget configurations per user or org';

COMMENT ON COLUMN custom_reports.config IS 'JSON config: { fields: [], filters: [], groupBy: "", chartType: "" }';
COMMENT ON COLUMN scheduled_exports.schedule IS 'Cron-like schedule: daily, weekly, monthly';
COMMENT ON COLUMN dashboard_widgets.config IS 'JSON config specific to widget type';
