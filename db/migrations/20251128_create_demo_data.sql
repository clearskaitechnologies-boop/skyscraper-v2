-- Migration: Create Test Data for Client Portal Demo
-- Created: 2025-11-28
-- Description: Insert test organization, clients, claims, and portal access for investor demo

SET search_path TO app;

-- Create test organization
INSERT INTO "Org" (
    "id",
    "clerkOrgId",
    "name",
    "createdAt",
    "updatedAt",
    "planKey",
    "subscriptionStatus"
) VALUES (
    'org_demo_investor_2025',
    'clerk_org_demo',
    'Demo Roofing Company',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'professional',
    'active'
) ON CONFLICT ("clerkOrgId") DO NOTHING;

-- Create test clients
INSERT INTO "Client" ("id", "orgId", "name", "email", "phone", "createdAt", "updatedAt")
VALUES 
    ('client_1_demo', 'org_demo_investor_2025', 'John Smith', 'john.smith@example.com', '555-0101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('client_2_demo', 'org_demo_investor_2025', 'Jane Doe', 'jane.doe@example.com', '555-0102', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('client_3_demo', 'org_demo_investor_2025', 'Bob Johnson', 'bob.johnson@example.com', '555-0103', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Create test contacts for properties
INSERT INTO "contacts" ("id", "orgId", "firstName", "lastName", "email", "phone", "type", "createdAt", "updatedAt")
VALUES 
    ('contact_demo_1', 'org_demo_investor_2025', 'John', 'Smith', 'john.smith@example.com', '555-0101', 'homeowner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('contact_demo_2', 'org_demo_investor_2025', 'Jane', 'Doe', 'jane.doe@example.com', '555-0102', 'homeowner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('contact_demo_3', 'org_demo_investor_2025', 'Bob', 'Johnson', 'bob.johnson@example.com', '555-0103', 'homeowner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Create test properties for the clients
INSERT INTO "properties" ("id", "orgId", "contactId", "street", "city", "state", "zipCode", "createdAt", "updatedAt")
VALUES 
    ('prop_demo_1', 'org_demo_investor_2025', 'contact_demo_1', '123 Main St', 'Austin', 'TX', '78701', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('prop_demo_2', 'org_demo_investor_2025', 'contact_demo_2', '456 Oak Ave', 'Austin', 'TX', '78702', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('prop_demo_3', 'org_demo_investor_2025', 'contact_demo_3', '789 Pine Rd', 'Austin', 'TX', '78703', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Create some test claims for the clients
INSERT INTO "claims" (
    "id",
    "claimNumber",
    "title",
    "status",
    "orgId",
    "propertyId",
    "damageType",
    "dateOfLoss",
    "createdAt",
    "updatedAt"
) VALUES 
    ('claim_demo_1', 'CLM-2025-001', 'Roof Storm Damage - Main St', 'in_progress', 'org_demo_investor_2025', 'prop_demo_1', 'Storm', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('claim_demo_2', 'CLM-2025-002', 'Hail Damage Assessment', 'pending', 'org_demo_investor_2025', 'prop_demo_2', 'Hail', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('claim_demo_3', 'CLM-2025-003', 'Wind Damage Repair', 'approved', 'org_demo_investor_2025', 'prop_demo_3', 'Wind', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Create portal access tokens for clients (valid for 30 days)
INSERT INTO "client_portal_access" (
    "id",
    "clientId",
    "claimId",
    "token",
    "expiresAt",
    "createdAt"
) VALUES 
    ('access_1', 'client_1_demo', 'claim_demo_1', 'demo_token_client1_' || md5(random()::text), CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP),
    ('access_2', 'client_2_demo', 'claim_demo_2', 'demo_token_client2_' || md5(random()::text), CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP),
    ('access_3', 'client_3_demo', 'claim_demo_3', 'demo_token_client3_' || md5(random()::text), CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Note: Timeline events and trade partners tables don't exist yet in production
-- They will be created when needed. For now, clients and claims are sufficient for demo.

-- Create notifications for clients
INSERT INTO "ClientNotification" (
    "id",
    "clientId",
    "type",
    "title",
    "message",
    "read",
    "createdAt"
) VALUES 
    ('notif_1', 'client_1_demo', 'claim_update', 'Claim Update', 'Your claim CLM-2025-001 has a new update.', false, CURRENT_TIMESTAMP),
    ('notif_2', 'client_2_demo', 'document', 'New Document', 'A new document has been added to your claim.', false, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('notif_3', 'client_3_demo', 'approval', 'Claim Approved!', 'Congratulations! Your claim has been approved.', true, CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT ("id") DO NOTHING;

-- Output confirmation
DO $$ 
DECLARE
    org_count INTEGER;
    client_count INTEGER;
    claim_count INTEGER;
BEGIN 
    SELECT COUNT(*) INTO org_count FROM "Org";
    SELECT COUNT(*) INTO client_count FROM "Client";
    SELECT COUNT(*) INTO claim_count FROM "claims";
    
    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Organizations: %', org_count;
    RAISE NOTICE 'Clients: %', client_count;
    RAISE NOTICE 'Claims: %', claim_count;
END $$;
