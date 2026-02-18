-- Delete the "Public Demo" org and ALL its data
-- Org ID: eef11954-b827-45f7-9d4d-3ec4b5037b51
-- This is tainted demo data from the beta bind block

BEGIN;

-- Deep FK chains: delete leaf tables first, then parents

-- Properties depend on contacts, so delete properties first
DELETE FROM properties WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- Now contacts
DELETE FROM contacts WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- All other org-scoped tables (alphabetical)
DELETE FROM activities WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM ai_reports WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM claims WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM documents WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM estimates WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM file_assets WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM inspections WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM jobs WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM leads WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM projects WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM tasks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- Billing/tokens
DELETE FROM "Subscription" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "TokenWallet" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM token_usage WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "Client" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- Additional tables
DELETE FROM "BuildProgress" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "CompletionPacket" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "CrewSchedule" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "JobCloseout" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "MaterialOrder" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "ProjectNotification" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "ReviewReferral" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "VendorPricing" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM api_tokens WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM appointments WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM canvassing_routes WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM code_requirements WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM commission_plans WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM commission_records WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM contractor_profiles WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM customer_contractor_links WHERE "contractorId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM customer_payments WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM damage_assessments WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM door_knocks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM feature_flags WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM job_financials WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM job_schedules WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM maintenance_records WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM maintenance_schedules WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM maintenance_tasks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM maintenance_vendors WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM material_forensic_reports WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM measurement_orders WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM mortgage_checks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM network_posts WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM ocr_records WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM permits WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_annual_reports WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_digital_twins WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_health_scores WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_impacts WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_inspections WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_materials WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM property_profiles WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM quickbooks_connections WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM sms_messages WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM storm_events WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM storm_records WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM supplements WHERE org_id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM team_performance WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- Membership
DELETE FROM user_organizations WHERE "organizationId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- Finally, the org itself
DELETE FROM "Org" WHERE id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

COMMIT;

-- Verify
SELECT id, name, "demoMode" FROM "Org";
