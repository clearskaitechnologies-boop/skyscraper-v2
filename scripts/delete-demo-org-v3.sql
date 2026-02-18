-- Delete the "Public Demo" org and ALL its data
-- Org ID: eef11954-b827-45f7-9d4d-3ec4b5037b51
-- NO TRANSACTION: each statement runs independently so missing tables don't block

-- Delete child records first (deepest FK chains)
-- jobs depend on properties, claims depend on contacts, etc.
DELETE FROM jobs WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM claims WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM projects WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM inspections WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM estimates WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM properties WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM contacts WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM activities WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM ai_reports WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM documents WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM file_assets WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM leads WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM tasks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM token_usage WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM team_performance WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM sms_messages WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM storm_events WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM storm_records WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM ocr_records WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM permits WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM network_posts WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM mortgage_checks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM door_knocks WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "BillingSettings" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "BuildProgress" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "Client" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "CompletionPacket" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "CrewSchedule" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "JobCloseout" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "MaterialOrder" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "ProjectNotification" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "ReviewReferral" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "Subscription" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "TokenWallet" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM "VendorPricing" WHERE "orgId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';
DELETE FROM user_organizations WHERE "organizationId" = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- THE ORG ITSELF
DELETE FROM "Org" WHERE id = 'eef11954-b827-45f7-9d4d-3ec4b5037b51';

-- Verify
SELECT id, name, "demoMode" FROM "Org";
