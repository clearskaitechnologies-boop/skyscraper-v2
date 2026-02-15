-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PHOTO', 'PDF', 'REPORT', 'AGREEMENT', 'INVOICE', 'WEATHER_VERIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('LEAD', 'QUALIFIED', 'INSPECTION_SCHEDULED', 'INSPECTED', 'ESTIMATE_SENT', 'INSURANCE_CLAIM', 'APPROVED', 'PRODUCTION', 'FINAL_QA', 'INVOICED', 'PAID', 'WARRANTY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'PM', 'INSPECTOR', 'BILLING', 'VENDOR', 'USER');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "BillingSettings" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "autoRefill" BOOLEAN NOT NULL DEFAULT false,
    "refillThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "trialStartAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trialStatus" TEXT,
    "planKey" TEXT,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "monthlyPriceId" TEXT NOT NULL,
    "monthlyTokens" INTEGER NOT NULL DEFAULT 0,
    "aiIncluded" INTEGER NOT NULL DEFAULT 0,
    "dolCheckIncluded" INTEGER NOT NULL DEFAULT 0,
    "dolFullIncluded" INTEGER NOT NULL DEFAULT 0,
    "aiOverageCents" INTEGER NOT NULL DEFAULT 0,
    "dolCheckOverageCents" INTEGER NOT NULL DEFAULT 0,
    "dolFullOverageCents" INTEGER NOT NULL DEFAULT 0,
    "limits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubId" TEXT,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenWallet" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "aiRemaining" INTEGER NOT NULL DEFAULT 0,
    "dolCheckRemain" INTEGER NOT NULL DEFAULT 0,
    "dolFullRemain" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "contactId" TEXT,
    "leadId" TEXT,
    "projectId" TEXT,
    "claimId" TEXT,
    "inspectionId" TEXT,
    "jobId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "model" TEXT,
    "claimId" TEXT,
    "inspectionId" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "projectId" TEXT,
    "claimNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "damageType" TEXT NOT NULL,
    "dateOfLoss" TIMESTAMP(3) NOT NULL,
    "carrier" TEXT,
    "adjusterName" TEXT,
    "adjusterPhone" TEXT,
    "adjusterEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedValue" INTEGER,
    "approvedValue" INTEGER,
    "deductible" INTEGER,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "title" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdBy" TEXT,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tool" TEXT,
    "subtotal" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "attachments" JSONB,
    "scopeItems" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "leadId" VARCHAR(191),
    "claimId" VARCHAR(191),
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "checksum" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "projectId" TEXT,
    "claimId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "inspectorId" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "weatherData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "claimId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "jobType" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "foreman" TEXT,
    "crewSize" INTEGER,
    "estimatedCost" INTEGER,
    "actualCost" INTEGER,
    "materials" JSONB,
    "equipment" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "value" INTEGER,
    "probability" INTEGER,
    "stage" TEXT NOT NULL DEFAULT 'new',
    "temperature" TEXT NOT NULL DEFAULT 'warm',
    "assignedTo" TEXT,
    "createdBy" TEXT,
    "followUpDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "claimId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_branding" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "ownerId" TEXT NOT NULL,
    "companyName" TEXT,
    "license" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "colorPrimary" TEXT DEFAULT '#117CFF',
    "colorAccent" TEXT DEFAULT '#FFC838',
    "logoUrl" TEXT,
    "teamPhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "leadId" TEXT,
    "propertyId" TEXT,
    "contactId" TEXT,
    "title" TEXT NOT NULL,
    "jobNumber" TEXT,
    "status" "PipelineStage" NOT NULL DEFAULT 'LEAD',
    "stage" TEXT NOT NULL DEFAULT 'Lead',
    "startDate" TIMESTAMP(3),
    "targetEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "valueEstimate" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "yearBuilt" INTEGER,
    "squareFootage" INTEGER,
    "roofType" TEXT,
    "roofAge" INTEGER,
    "carrier" TEXT,
    "policyNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_drafts" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "packet_type" TEXT NOT NULL,
    "context_json" JSONB NOT NULL,
    "ai_summary" TEXT,
    "ai_scope" TEXT,
    "ai_terms" TEXT,
    "ai_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "template" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_files" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pages" INTEGER,
    "file_size" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_dols" (
    "propertyId" TEXT NOT NULL,
    "recommendedDate" TEXT,
    "confidence" DOUBLE PRECISION,
    "reason" TEXT,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "topHailInches" DOUBLE PRECISION,
    "topDistanceMiles" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quick_dols_pkey" PRIMARY KEY ("propertyId")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "contactId" TEXT,
    "leadId" TEXT,
    "claimId" TEXT,
    "inspectionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_packs" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_price_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_usage" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "description" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_ledger" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "ref_id" TEXT,
    "balance_after" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_tokens" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'beta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_daily_snapshots" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoredJson" JSONB NOT NULL,
    "dolJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_daily_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_documents" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "summaryText" TEXT,
    "aiModelUsed" TEXT,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "dolDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_events" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timeUtc" TIMESTAMP(3) NOT NULL,
    "magnitude" DOUBLE PRECISION,
    "distanceMiles" DOUBLE PRECISION,
    "geometryJson" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingSettings_orgId_key" ON "BillingSettings"("orgId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Org_clerkOrgId_key" ON "Org"("clerkOrgId" ASC);

-- CreateIndex
CREATE INDEX "Org_stripeCustomerId_idx" ON "Org"("stripeCustomerId" ASC);

-- CreateIndex
CREATE INDEX "Org_subscriptionStatus_idx" ON "Org"("subscriptionStatus" ASC);

-- CreateIndex
CREATE INDEX "Org_trialEndsAt_idx" ON "Org"("trialEndsAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_monthlyPriceId_key" ON "Plan"("monthlyPriceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "Plan"("stripeProductId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_orgId_key" ON "Subscription"("orgId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubId_key" ON "Subscription"("stripeSubId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TokenWallet_orgId_key" ON "TokenWallet"("orgId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_stripeEventId_key" ON "WebhookEvent"("stripeEventId" ASC);

-- CreateIndex
CREATE INDEX "activities_orgId_type_createdAt_idx" ON "activities"("orgId" ASC, "type" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "activities_orgId_userId_createdAt_idx" ON "activities"("orgId" ASC, "userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ai_reports_orgId_type_createdAt_idx" ON "ai_reports"("orgId" ASC, "type" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ai_reports_orgId_userId_idx" ON "ai_reports"("orgId" ASC, "userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber" ASC);

-- CreateIndex
CREATE INDEX "claims_orgId_assignedTo_idx" ON "claims"("orgId" ASC, "assignedTo" ASC);

-- CreateIndex
CREATE INDEX "claims_orgId_status_idx" ON "claims"("orgId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "contacts_orgId_email_idx" ON "contacts"("orgId" ASC, "email" ASC);

-- CreateIndex
CREATE INDEX "contacts_orgId_phone_idx" ON "contacts"("orgId" ASC, "phone" ASC);

-- CreateIndex
CREATE INDEX "documents_orgId_projectId_idx" ON "documents"("orgId" ASC, "projectId" ASC);

-- CreateIndex
CREATE INDEX "documents_orgId_type_idx" ON "documents"("orgId" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "estimates_orgId_projectId_idx" ON "estimates"("orgId" ASC, "projectId" ASC);

-- CreateIndex
CREATE INDEX "estimates_orgId_status_idx" ON "estimates"("orgId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "file_assets_orgId_category_createdAt_idx" ON "file_assets"("orgId" ASC, "category" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "file_assets_orgId_claimId_idx" ON "file_assets"("orgId" ASC, "claimId" ASC);

-- CreateIndex
CREATE INDEX "file_assets_orgId_leadId_idx" ON "file_assets"("orgId" ASC, "leadId" ASC);

-- CreateIndex
CREATE INDEX "inspections_orgId_inspectorId_idx" ON "inspections"("orgId" ASC, "inspectorId" ASC);

-- CreateIndex
CREATE INDEX "inspections_orgId_scheduledAt_idx" ON "inspections"("orgId" ASC, "scheduledAt" ASC);

-- CreateIndex
CREATE INDEX "jobs_orgId_foreman_idx" ON "jobs"("orgId" ASC, "foreman" ASC);

-- CreateIndex
CREATE INDEX "jobs_orgId_status_idx" ON "jobs"("orgId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "leads_claimId_key" ON "leads"("claimId" ASC);

-- CreateIndex
CREATE INDEX "leads_orgId_assignedTo_idx" ON "leads"("orgId" ASC, "assignedTo" ASC);

-- CreateIndex
CREATE INDEX "leads_orgId_stage_idx" ON "leads"("orgId" ASC, "stage" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "org_branding_orgId_ownerId_key" ON "org_branding"("orgId" ASC, "ownerId" ASC);

-- CreateIndex
CREATE INDEX "org_branding_ownerId_idx" ON "org_branding"("ownerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "projects_jobNumber_key" ON "projects"("jobNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "projects_leadId_key" ON "projects"("leadId" ASC);

-- CreateIndex
CREATE INDEX "projects_orgId_assignedTo_idx" ON "projects"("orgId" ASC, "assignedTo" ASC);

-- CreateIndex
CREATE INDEX "projects_orgId_status_idx" ON "projects"("orgId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "properties_orgId_zipCode_idx" ON "properties"("orgId" ASC, "zipCode" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_drafts_job_id" ON "proposal_drafts"("job_id" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_drafts_lead_id" ON "proposal_drafts"("lead_id" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_drafts_org_id" ON "proposal_drafts"("org_id" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_drafts_packet_type" ON "proposal_drafts"("packet_type" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_drafts_status" ON "proposal_drafts"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_drafts_user_id" ON "proposal_drafts"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_files_kind" ON "proposal_files"("kind" ASC);

-- CreateIndex
CREATE INDEX "idx_proposal_files_proposal_id" ON "proposal_files"("proposal_id" ASC);

-- CreateIndex
CREATE INDEX "quick_dols_lastupdated_idx" ON "quick_dols"("lastUpdated" ASC);

-- CreateIndex
CREATE INDEX "tasks_orgId_assigneeId_idx" ON "tasks"("orgId" ASC, "assigneeId" ASC);

-- CreateIndex
CREATE INDEX "tasks_orgId_dueAt_idx" ON "tasks"("orgId" ASC, "dueAt" ASC);

-- CreateIndex
CREATE INDEX "tasks_orgId_status_idx" ON "tasks"("orgId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "token_packs_slug_key" ON "token_packs"("slug" ASC);

-- CreateIndex
CREATE INDEX "token_usage_orgId_action_idx" ON "token_usage"("orgId" ASC, "action" ASC);

-- CreateIndex
CREATE INDEX "token_usage_orgId_createdAt_idx" ON "token_usage"("orgId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "token_usage_orgId_userId_idx" ON "token_usage"("orgId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "tokens_ledger_org_id_created_at_idx" ON "tokens_ledger"("org_id" ASC, "created_at" ASC);

-- CreateIndex
CREATE INDEX "tool_usage_orgId_toolKey_usedAt_idx" ON "tool_usage"("orgId" ASC, "toolKey" ASC, "usedAt" ASC);

-- CreateIndex
CREATE INDEX "tool_usage_userId_toolKey_usedAt_idx" ON "tool_usage"("userId" ASC, "toolKey" ASC, "usedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "usage_tokens_orgId_key" ON "usage_tokens"("orgId" ASC);

-- CreateIndex
CREATE INDEX "usage_tokens_orgid_idx" ON "usage_tokens"("orgId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "usage_tokens_orgid_key" ON "usage_tokens"("orgId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email" ASC);

-- CreateIndex
CREATE INDEX "users_orgId_role_idx" ON "users"("orgId" ASC, "role" ASC);

-- CreateIndex
CREATE INDEX "weather_daily_snapshots_propertyid_snapshotdate_idx" ON "weather_daily_snapshots"("propertyId" ASC, "snapshotDate" ASC);

-- CreateIndex
CREATE INDEX "weather_documents_kind_idx" ON "weather_documents"("kind" ASC);

-- CreateIndex
CREATE INDEX "weather_documents_orgid_idx" ON "weather_documents"("orgId" ASC);

-- CreateIndex
CREATE INDEX "weather_documents_propertyid_idx" ON "weather_documents"("propertyId" ASC);

-- CreateIndex
CREATE INDEX "weather_events_propertyid_timeutc_idx" ON "weather_events"("propertyId" ASC, "timeUtc" ASC);

-- CreateIndex
CREATE INDEX "weather_events_source_type_idx" ON "weather_events"("source" ASC, "type" ASC);

-- AddForeignKey
ALTER TABLE "BillingSettings" ADD CONSTRAINT "BillingSettings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenWallet" ADD CONSTRAINT "TokenWallet_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_files" ADD CONSTRAINT "proposal_files_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal_drafts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

