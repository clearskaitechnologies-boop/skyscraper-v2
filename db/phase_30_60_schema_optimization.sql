-- =============================================================================
-- Phase 30-60 Schema Optimization & Production Readiness
-- =============================================================================
-- Purpose: Add performance indexes, FK constraints, and RLS policy templates
--          for Phase 30-60 features (CRM, AI Intelligence, Self-Writing Claims)
-- 
-- Safety: All operations use IF NOT EXISTS for idempotency
-- Status: Ready for staging testing
-- Date: November 17, 2025
-- =============================================================================

BEGIN;

-- =============================================================================
-- PART 1: CORE PERFORMANCE INDEXES
-- =============================================================================
-- These indexes optimize the most frequent queries across claims, leads, 
-- properties, and organization-scoped data access.

-- Claims Core Indexes
-- -------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_org_id 
ON claims(orgId);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_status 
ON claims(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_date_of_loss 
ON claims(dateOfLoss);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_property_id 
ON claims(propertyId);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_created_at 
ON claims(created_at);

-- Claim Activities & Timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_activities_claim_id 
ON claim_activities(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_activities_created_at 
ON claim_activities(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_timeline_events_claim_id 
ON claim_timeline_events(claim_id);

-- Claim Tasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_tasks_claim_id 
ON claim_tasks(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_tasks_assignee_id 
ON claim_tasks(assignee_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_tasks_status 
ON claim_tasks(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_tasks_due_date 
ON claim_tasks(due_date);

-- =============================================================================
-- PART 2: PHASE 48-50 AI FEATURE INDEXES
-- =============================================================================
-- Optimizes AI prediction, brain state, decision engine, and self-writing queries

-- ClaimPrediction (Phase 48: Predictive Intelligence)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_prediction_claim_id 
ON "ClaimPrediction"("claimId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_prediction_org_id 
ON "ClaimPrediction"("orgId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_prediction_created_at 
ON "ClaimPrediction"("created_at");

-- GIN index for JSON prediction data (enables fast JSONB queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_prediction_json_gin 
ON "ClaimPrediction" USING gin ("prediction_json");

-- ClaimEventReconstruction (Phase 49: Timeline Intelligence)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_event_reconstruction_claim_id 
ON "ClaimEventReconstruction"("claimId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_event_reconstruction_created_at 
ON "ClaimEventReconstruction"("created_at");

-- GIN index for reconstructed timeline JSON
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_event_reconstruction_json_gin 
ON "ClaimEventReconstruction" USING gin ("reconstruction_json");

-- ClaimBrainState (Phase 49: Claim Brain)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_brain_state_claim_id 
ON "ClaimBrainState"("claimId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_brain_state_updated_at 
ON "ClaimBrainState"("updated_at");

-- GIN index for brain state JSON (state transitions, timeline, logs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_brain_state_json_gin 
ON "ClaimBrainState" USING gin ("brain_state");

-- ClaimDecisionPlan (Phase 50: Decision Engine)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_decision_plan_claim_id 
ON "ClaimDecisionPlan"("claimId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_decision_plan_strategy 
ON "ClaimDecisionPlan"("strategy");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_decision_plan_created_at 
ON "ClaimDecisionPlan"("created_at");

-- GIN index for decision plan JSON (steps, risks, carrier points)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_decision_plan_json_gin 
ON "ClaimDecisionPlan" USING gin ("plan_json");

-- ClaimDisputePackage (Phase 50: Self-Writing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_dispute_package_claim_id 
ON "ClaimDisputePackage"("claimId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claim_dispute_package_created_at 
ON "ClaimDisputePackage"("created_at");

-- CommandLog (Phase 49: Command Pattern for AI Agent)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_command_log_claim_id 
ON "CommandLog"("claim_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_command_log_created_at 
ON "CommandLog"("created_at");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_command_log_status 
ON "CommandLog"("status");

-- BrainFeedback (Phase 49: Self-Improvement Loop)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brain_feedback_claim_id 
ON "BrainFeedback"("claim_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brain_feedback_created_at 
ON "BrainFeedback"("created_at");

-- =============================================================================
-- PART 3: CRM & PIPELINE INDEXES (Phase 30-35)
-- =============================================================================

-- Leads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_id 
ON leads(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_lifecycle_stage 
ON leads(lifecycle_stage);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status 
ON leads(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_score 
ON leads(score);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_at 
ON leads(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_owner_id 
ON leads(owner_id);

-- Contacts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_org_id 
ON contacts(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_email 
ON contacts(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_phone 
ON contacts(phone);

-- Properties
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_org_id 
ON properties(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_address 
ON properties(address);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_zip_code 
ON properties(zip_code);

-- Workflow Stages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_stage_org_id 
ON "WorkflowStage"("orgId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_stage_position 
ON "WorkflowStage"("position");

-- Lead Pipeline Events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lead_pipeline_event_lead_id 
ON "LeadPipelineEvent"("leadId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lead_pipeline_event_stage_id 
ON "LeadPipelineEvent"("stageId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lead_pipeline_event_created_at 
ON "LeadPipelineEvent"("createdAt");

-- Pipeline Metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pipeline_metrics_org_id 
ON "PipelineMetrics"("orgId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pipeline_metrics_date 
ON "PipelineMetrics"("date");

-- =============================================================================
-- PART 4: TOKEN LEDGER & BILLING INDEXES
-- =============================================================================

-- Tokens Ledger (Critical for usage tracking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tokens_ledger_org_id 
ON tokens_ledger(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tokens_ledger_user_id 
ON tokens_ledger(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tokens_ledger_created_at 
ON tokens_ledger(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tokens_ledger_transaction_type 
ON tokens_ledger(transaction_type);

-- Token Usage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_usage_org_id 
ON token_usage(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_usage_created_at 
ON token_usage(created_at);

-- AI Usage Tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_org_id 
ON ai_usage(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_claim_id 
ON ai_usage(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_created_at 
ON ai_usage(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_feature_type 
ON ai_usage(feature_type);

-- AI Performance Logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_performance_logs_created_at 
ON ai_performance_logs(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_performance_logs_feature 
ON ai_performance_logs(feature);

-- =============================================================================
-- PART 5: CARRIER INTEGRATION INDEXES
-- =============================================================================

-- Carriers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carriers_org_id 
ON carriers(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carriers_name 
ON carriers(name);

-- Carrier Profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_profiles_org_id 
ON carrier_profiles(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_profiles_carrier_id 
ON carrier_profiles(carrier_id);

-- Carrier Deliveries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_deliveries_claim_id 
ON carrier_deliveries(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_deliveries_carrier_id 
ON carrier_deliveries(carrier_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_deliveries_status 
ON carrier_deliveries(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_deliveries_sent_at 
ON carrier_deliveries(sent_at);

-- =============================================================================
-- PART 6: PROPERTY INTELLIGENCE INDEXES
-- =============================================================================

-- Property Profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_profiles_property_id 
ON property_profiles(property_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_profiles_org_id 
ON property_profiles(org_id);

-- Property Digital Twins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_digital_twins_property_id 
ON property_digital_twins(property_id);

-- Property Health Scores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_health_scores_property_id 
ON property_health_scores(property_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_health_scores_score_date 
ON property_health_scores(score_date);

-- Property Inspections
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_inspections_property_id 
ON property_inspections(property_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_inspections_inspection_date 
ON property_inspections(inspection_date);

-- =============================================================================
-- PART 7: WEATHER & DAMAGE INTELLIGENCE INDEXES
-- =============================================================================

-- Weather Reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weather_reports_claim_id 
ON weather_reports(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weather_reports_report_date 
ON weather_reports(report_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weather_reports_zip_code 
ON weather_reports(zip_code);

-- Storm Impacts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storm_impact_property_id 
ON "StormImpact"("propertyId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storm_impact_event_id 
ON "StormImpact"("catStormEventId");

-- Damage Assessments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_damage_assessments_claim_id 
ON damage_assessments(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_damage_assessments_created_at 
ON damage_assessments(created_at);

-- OCR Records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ocr_records_document_id 
ON ocr_records(document_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ocr_records_created_at 
ON ocr_records(created_at);

-- =============================================================================
-- PART 8: DOCUMENT & UPLOAD INDEXES
-- =============================================================================

-- Documents
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_claim_id 
ON documents(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_org_id 
ON documents(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_at 
ON documents(uploaded_at);

-- File Assets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_assets_org_id 
ON file_assets(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_assets_uploaded_at 
ON file_assets(uploaded_at);

-- Reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_claim_id 
ON reports(claim_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_report_type 
ON reports(report_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_created_at 
ON reports(created_at);

-- =============================================================================
-- PART 9: AUTOMATION & WORKFLOW INDEXES
-- =============================================================================

-- Automation Rules
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_rules_org_id 
ON automation_rules(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_rules_is_active 
ON automation_rules(is_active);

-- Automation Tasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_tasks_rule_id 
ON automation_tasks(rule_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_tasks_status 
ON automation_tasks(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_tasks_created_at 
ON automation_tasks(created_at);

-- =============================================================================
-- PART 10: USER & ORGANIZATION INDEXES
-- =============================================================================

-- User Organizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_organizations_user_id 
ON user_organizations(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_organizations_org_id 
ON user_organizations(org_id);

-- User Permissions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_user_id 
ON user_permissions(user_id);

-- Subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_org_id 
ON "Subscription"("orgId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_status 
ON "Subscription"("status");

-- =============================================================================
-- PART 11: FOREIGN KEY CONSTRAINTS (Phase 48-50)
-- =============================================================================
-- Note: FK constraints enforce referential integrity but may impact write performance.
--       Test thoroughly in staging before applying to production.

-- ClaimPrediction FKs
ALTER TABLE "ClaimPrediction"
ADD CONSTRAINT IF NOT EXISTS fk_claim_prediction_claim 
FOREIGN KEY ("claimId") REFERENCES claims(id) ON DELETE CASCADE;

ALTER TABLE "ClaimPrediction"
ADD CONSTRAINT IF NOT EXISTS fk_claim_prediction_org 
FOREIGN KEY ("orgId") REFERENCES "Org"(id) ON DELETE CASCADE;

-- ClaimEventReconstruction FKs
ALTER TABLE "ClaimEventReconstruction"
ADD CONSTRAINT IF NOT EXISTS fk_claim_event_reconstruction_claim 
FOREIGN KEY ("claimId") REFERENCES claims(id) ON DELETE CASCADE;

-- ClaimBrainState FKs
ALTER TABLE "ClaimBrainState"
ADD CONSTRAINT IF NOT EXISTS fk_claim_brain_state_claim 
FOREIGN KEY ("claimId") REFERENCES claims(id) ON DELETE CASCADE;

-- ClaimDecisionPlan FKs
ALTER TABLE "ClaimDecisionPlan"
ADD CONSTRAINT IF NOT EXISTS fk_claim_decision_plan_claim 
FOREIGN KEY ("claimId") REFERENCES claims(id) ON DELETE CASCADE;

-- ClaimDisputePackage FKs
ALTER TABLE "ClaimDisputePackage"
ADD CONSTRAINT IF NOT EXISTS fk_claim_dispute_package_claim 
FOREIGN KEY ("claimId") REFERENCES claims(id) ON DELETE CASCADE;

-- CommandLog FKs
ALTER TABLE "CommandLog"
ADD CONSTRAINT IF NOT EXISTS fk_command_log_claim 
FOREIGN KEY ("claim_id") REFERENCES claims(id) ON DELETE CASCADE;

-- BrainFeedback FKs
ALTER TABLE "BrainFeedback"
ADD CONSTRAINT IF NOT EXISTS fk_brain_feedback_claim 
FOREIGN KEY ("claim_id") REFERENCES claims(id) ON DELETE CASCADE;

-- =============================================================================
-- PART 12: RLS POLICY TEMPLATES (COMMENTED - FOR REFERENCE)
-- =============================================================================
-- These are templates for Row Level Security policies. Uncomment and customize
-- based on your authentication strategy (Clerk, Supabase Auth, etc.)

/*
-- Enable RLS on Phase 48-50 tables
ALTER TABLE "ClaimPrediction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClaimEventReconstruction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClaimBrainState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClaimDecisionPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClaimDisputePackage" ENABLE ROW LEVEL SECURITY;

-- Example: ClaimPrediction RLS policies
CREATE POLICY claim_prediction_org_isolation ON "ClaimPrediction"
FOR ALL
USING (
  "orgId" IN (
    SELECT org_id 
    FROM user_organizations 
    WHERE user_id = current_user_id()
  )
);

CREATE POLICY claim_prediction_read ON "ClaimPrediction"
FOR SELECT
USING (
  "orgId" IN (
    SELECT org_id 
    FROM user_organizations 
    WHERE user_id = current_user_id()
  )
);

CREATE POLICY claim_prediction_insert ON "ClaimPrediction"
FOR INSERT
WITH CHECK (
  "orgId" IN (
    SELECT org_id 
    FROM user_organizations 
    WHERE user_id = current_user_id()
    AND role IN ('admin', 'manager', 'adjuster')
  )
);

-- Repeat similar patterns for other Phase 48-50 tables
*/

-- =============================================================================
-- PART 13: ANALYZE & STATISTICS
-- =============================================================================
-- Update table statistics for query planner optimization

ANALYZE claims;
ANALYZE "ClaimPrediction";
ANALYZE "ClaimEventReconstruction";
ANALYZE "ClaimBrainState";
ANALYZE "ClaimDecisionPlan";
ANALYZE "ClaimDisputePackage";
ANALYZE leads;
ANALYZE contacts;
ANALYZE properties;
ANALYZE tokens_ledger;
ANALYZE ai_usage;

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these after applying the patch to verify indexes were created

/*
-- Check indexes on ClaimPrediction
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'ClaimPrediction';

-- Check indexes on ClaimBrainState
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'ClaimBrainState';

-- Check all foreign keys on Phase 48-50 tables
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN (
    'ClaimPrediction', 
    'ClaimEventReconstruction', 
    'ClaimBrainState', 
    'ClaimDecisionPlan', 
    'ClaimDisputePackage',
    'CommandLog',
    'BrainFeedback'
  );

-- Check index sizes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_indexes
WHERE tablename IN (
    'ClaimPrediction', 
    'ClaimBrainState', 
    'ClaimDecisionPlan',
    'claims',
    'leads',
    'tokens_ledger'
)
ORDER BY tablename, indexname;
*/

-- =============================================================================
-- APPLICATION NOTES
-- =============================================================================
-- 1. This patch uses CREATE INDEX CONCURRENTLY to avoid blocking table writes
-- 2. All operations are idempotent (IF NOT EXISTS)
-- 3. Apply during low-traffic hours if possible
-- 4. Monitor index creation progress with:
--    SELECT * FROM pg_stat_progress_create_index;
-- 5. Expected execution time: 5-15 minutes depending on table sizes
-- 6. Rollback strategy: DROP INDEX CONCURRENTLY <index_name> if needed
--
-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
