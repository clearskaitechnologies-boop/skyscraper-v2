-- Migration: Add claim_activities table for real-time activity timeline
-- Created: 2024-12-02

-- Create claim_activities table
CREATE TABLE IF NOT EXISTS claim_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('status_change', 'upload', 'assignment', 'comment', 'supplement')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claim_activities_claim_id ON claim_activities(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_activities_org_id ON claim_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_claim_activities_created_at ON claim_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_activities_type ON claim_activities(activity_type);

-- Enable Row Level Security
ALTER TABLE claim_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activities for claims in their organization
CREATE POLICY claim_activities_select_policy ON claim_activities
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Policy: Users can insert activities for claims in their organization
CREATE POLICY claim_activities_insert_policy ON claim_activities
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Function to automatically log claim status changes
CREATE OR REPLACE FUNCTION log_claim_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO claim_activities (
      claim_id,
      organization_id,
      user_id,
      user_name,
      activity_type,
      description,
      metadata
    ) VALUES (
      NEW.id,
      NEW.organization_id,
      COALESCE(NEW.updated_by, NEW.created_by, 'system'),
      'System', -- Replace with actual user name lookup
      'status_change',
      'Claim status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic status change logging
DROP TRIGGER IF EXISTS claim_status_change_trigger ON claims;
CREATE TRIGGER claim_status_change_trigger
  AFTER UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION log_claim_status_change();

-- Function to log upload completions
CREATE OR REPLACE FUNCTION log_upload_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO claim_activities (
      claim_id,
      organization_id,
      user_id,
      user_name,
      activity_type,
      description,
      metadata
    ) VALUES (
      NEW.claim_id,
      NEW.organization_id,
      COALESCE(NEW.user_id, 'system'),
      'System',
      'upload',
      'Upload completed: ' || NEW.original_filename,
      jsonb_build_object(
        'upload_id', NEW.id,
        'file_type', NEW.file_type,
        'pages_processed', NEW.pages_processed
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for upload completion logging
DROP TRIGGER IF EXISTS upload_completion_trigger ON uploads;
CREATE TRIGGER upload_completion_trigger
  AFTER UPDATE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION log_upload_completion();

-- Function to cleanup old activities (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_claim_activities()
RETURNS void AS $$
BEGIN
  DELETE FROM claim_activities
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comment for documentation
COMMENT ON TABLE claim_activities IS 'Stores all claim activity events for real-time timeline display';
COMMENT ON COLUMN claim_activities.activity_type IS 'Type of activity: status_change, upload, assignment, comment, supplement';
COMMENT ON COLUMN claim_activities.metadata IS 'Additional context stored as JSON (e.g., old/new values, file details)';
