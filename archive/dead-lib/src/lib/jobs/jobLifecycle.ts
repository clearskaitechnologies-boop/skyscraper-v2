/**
 * Job Lifecycle Engine
 *
 * Unified state machine for Lead → Retail → Claim → Financed conversions
 * Central orchestration of all job stages with automation
 */

import { trackFeatureUsage } from "@/lib/analytics/usageTracking";
import prisma from "@/lib/prisma";
import { logAudit } from "@/middleware/auditLog";

export type JobType = "LEAD" | "RETAIL" | "CLAIM" | "FINANCED";

export type JobStatus =
  // Lead statuses
  | "NEW_LEAD"
  | "CONTACTED"
  | "QUALIFIED"
  | "SITE_VISIT_SCHEDULED"
  | "ESTIMATE_PROVIDED"
  // Retail statuses
  | "RETAIL_CONTRACT_SIGNED"
  | "RETAIL_WORK_SCHEDULED"
  | "RETAIL_IN_PROGRESS"
  | "RETAIL_COMPLETED"
  // Claim statuses
  | "CLAIM_FILED"
  | "INSPECTION_SCHEDULED"
  | "CLAIM_APPROVED"
  | "CLAIM_DENIED"
  | "SUPPLEMENT_FILED"
  | "WORK_AUTHORIZED"
  | "WORK_IN_PROGRESS"
  | "WORK_COMPLETED"
  | "FINAL_INSPECTION"
  | "CLAIM_CLOSED"
  // Financed statuses
  | "FINANCING_APPLIED"
  | "FINANCING_APPROVED"
  | "FINANCING_DENIED"
  | "FINANCED_WORK_SCHEDULED"
  | "FINANCED_IN_PROGRESS"
  | "FINANCED_COMPLETED"
  // Common
  | "CANCELLED"
  | "ON_HOLD";

export interface JobLifecycle {
  id: string;
  orgId: string;
  type: JobType;
  status: JobStatus;
  leadId?: string;
  claimId?: string;
  clientId: string;
  propertyAddress: string;

  // Financial tracking
  estimatedValue: number;
  actualCost?: number;
  revenue?: number;
  profit?: number;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Assignment
  assignedTo?: string;
  assignedTeam?: string;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Create new job
 */
export async function createJob(
  orgId: string,
  type: JobType,
  data: {
    clientId: string;
    propertyAddress: string;
    estimatedValue: number;
    leadId?: string;
    claimId?: string;
    assignedTo?: string;
    metadata?: Record<string, any>;
  },
  userId: string
): Promise<JobLifecycle> {
  const initialStatus = getInitialStatus(type);

  const job = await prisma.jobs
    .create({
      data: {
        orgId,
        type,
        status: initialStatus,
        clientId: data.clientId,
        propertyAddress: data.propertyAddress,
        estimatedValue: data.estimatedValue,
        leadId: data.leadId,
        claimId: data.claimId,
        assignedTo: data.assignedTo,
        metadata: data.metadata || {},
        createdBy: userId,
      },
    })
    .catch(() => {
      throw new Error("Failed to create job");
    });

  // Track usage
  await trackFeatureUsage(orgId, "claim");

  // Log audit
  await logAudit({
    userId,
    orgId,
    action: "JOB_CREATED",
    resource: "job",
    resourceId: job.id,
    metadata: {
      type,
      status: initialStatus,
    },
  });

  return job as JobLifecycle;
}

/**
 * Convert lead to retail job
 */
export async function convertLeadToRetail(
  leadId: string,
  orgId: string,
  data: {
    contractValue: number;
    startDate?: Date;
    assignedTo?: string;
  },
  userId: string
): Promise<JobLifecycle> {
  const lead = await prisma.leads.findUnique({
    where: { id: leadId },
    include: {
      contacts: {
        select: {
          id: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
    },
  });

  if (!lead || lead.orgId !== orgId) {
    throw new Error("Lead not found");
  }

  // Build property address from contact
  const contact = lead.contacts;
  const propertyAddress = contact
    ? [contact.street, contact.city, contact.state, contact.zipCode].filter(Boolean).join(", ")
    : lead.title;

  const job = await createJob(
    orgId,
    "RETAIL",
    {
      clientId: lead.contactId,
      propertyAddress,
      estimatedValue: data.contractValue,
      leadId,
      metadata: {
        convertedFrom: "LEAD",
        startDate: data.startDate,
      },
    },
    userId
  );

  // Update lead status
  await prisma.leads.update({
    where: { id: leadId },
    data: {
      stage: "converted",
      jobCategory: "retail",
      updatedAt: new Date(),
    },
  });

  return job;
}

/**
 * Convert lead to claim
 *
 * Note: For direct lead-to-claim conversion with proper UI workflow,
 * use the /api/leads/[id]/convert API endpoint instead.
 * This function is for programmatic/job-lifecycle conversion.
 */
export async function convertLeadToClaim(
  leadId: string,
  orgId: string,
  data: {
    insuranceCompany: string;
    policyNumber?: string;
    lossDate: Date;
    lossType: string;
    propertyId: string;
  },
  userId: string
): Promise<JobLifecycle> {
  const lead = await prisma.leads.findUnique({
    where: { id: leadId },
    include: {
      contacts: {
        select: {
          id: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
    },
  });

  if (!lead || lead.orgId !== orgId) {
    throw new Error("Lead not found");
  }

  if (lead.claimId) {
    throw new Error("Lead has already been converted to a claim");
  }

  // Build property address from contact
  const contact = lead.contacts;
  const propertyAddress = contact
    ? [contact.street, contact.city, contact.state, contact.zipCode].filter(Boolean).join(", ")
    : lead.title;

  // Create claim record
  const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const claim = await prisma.claims.create({
    data: {
      id: crypto.randomUUID(),
      orgId,
      propertyId: data.propertyId,
      claimNumber,
      title: `${data.lossType} - ${propertyAddress}`,
      description: lead.description || "",
      damageType: data.lossType,
      dateOfLoss: data.lossDate,
      carrier: data.insuranceCompany,
      policyNumber: data.policyNumber || null,
      status: "new",
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const job = await createJob(
    orgId,
    "CLAIM",
    {
      clientId: lead.contactId,
      propertyAddress,
      estimatedValue: lead.value || 0,
      leadId,
      claimId: claim.id,
      metadata: {
        convertedFrom: "LEAD",
        insuranceCompany: data.insuranceCompany,
      },
    },
    userId
  );

  // Update lead status and link to claim
  await prisma.leads.update({
    where: { id: leadId },
    data: {
      stage: "converted",
      claimId: claim.id,
      jobCategory: "claim",
      updatedAt: new Date(),
    },
  });

  return job;
}

/**
 * Convert job to financed
 */
export async function convertToFinanced(
  jobId: string,
  orgId: string,
  data: {
    financingProvider: string;
    loanAmount: number;
    interestRate?: number;
    term?: number;
  },
  userId: string
): Promise<JobLifecycle> {
  const job = await prisma.jobs.findUnique({
    where: { id: jobId },
  });

  if (!job || job.orgId !== orgId) {
    throw new Error("Job not found");
  }

  // Create financed job
  const financedJob = await prisma.jobs.create({
    data: {
      orgId,
      type: "FINANCED",
      status: "FINANCING_APPLIED",
      clientId: job.clientId,
      propertyAddress: job.propertyAddress,
      estimatedValue: data.loanAmount,
      leadId: job.leadId,
      claimId: job.claimId,
      assignedTo: job.assignedTo,
      metadata: {
        convertedFrom: job.type,
        originalJobId: jobId,
        financingProvider: data.financingProvider,
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        term: data.term,
      },
      createdBy: userId,
    },
  });

  // Update original job
  await prisma.jobs.update({
    where: { id: jobId },
    data: {
      metadata: {
        ...((job.metadata as object) || {}),
        convertedToFinanced: financedJob.id,
      },
    },
  });

  // Log audit
  await logAudit({
    userId,
    orgId,
    action: "JOB_CONVERTED_TO_FINANCED",
    resource: "job",
    resourceId: jobId,
    metadata: {
      newJobId: financedJob.id,
      loanAmount: data.loanAmount,
    },
  });

  return financedJob as JobLifecycle;
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  orgId: string,
  newStatus: JobStatus,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  const job = await prisma.jobs.findUnique({
    where: { id: jobId },
  });

  if (!job || job.orgId !== orgId) {
    throw new Error("Job not found");
  }

  // Validate status transition
  if (!isValidStatusTransition(job.status as JobStatus, newStatus)) {
    throw new Error(`Invalid status transition: ${job.status} -> ${newStatus}`);
  }

  // Update job
  await prisma.jobs.update({
    where: { id: jobId },
    data: {
      status: newStatus,
      metadata: {
        ...((job.metadata as object) || {}),
        ...metadata,
      },
      updatedAt: new Date(),
    },
  });

  // Log status change
  await logAudit({
    userId,
    orgId,
    action: "JOB_STATUS_CHANGED",
    resource: "job",
    resourceId: jobId,
    metadata: {
      oldStatus: job.status,
      newStatus,
    },
  });
}

/**
 * Get job with full details
 */
export async function getJobDetails(jobId: string, orgId: string): Promise<JobLifecycle | null> {
  try {
    const job = await prisma.jobs.findFirst({
      where: { id: jobId, orgId },
      include: {
        client: true,
        lead: true,
        claim: true,
        assignedUser: true,
      },
    });

    return job as any;
  } catch {
    return null;
  }
}

/**
 * List jobs with filters
 */
export async function listJobs(
  orgId: string,
  filters?: {
    type?: JobType;
    status?: JobStatus;
    assignedTo?: string;
    clientId?: string;
  }
): Promise<JobLifecycle[]> {
  try {
    return (await prisma.jobs.findMany({
      where: {
        orgId,
        ...filters,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as JobLifecycle[];
  } catch {
    return [];
  }
}

/**
 * Get initial status for job type
 */
function getInitialStatus(type: JobType): JobStatus {
  switch (type) {
    case "LEAD":
      return "NEW_LEAD";
    case "RETAIL":
      return "RETAIL_CONTRACT_SIGNED";
    case "CLAIM":
      return "CLAIM_FILED";
    case "FINANCED":
      return "FINANCING_APPLIED";
  }
}

/**
 * Validate status transition
 */
function isValidStatusTransition(from: JobStatus, to: JobStatus): boolean {
  // Allow any forward progression or ON_HOLD/CANCELLED from any state
  if (to === "ON_HOLD" || to === "CANCELLED") {
    return true;
  }

  // TODO: Implement full state machine validation
  return true;
}
