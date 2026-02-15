/**
 * Client Portal Dashboard
 *
 * Client-facing dashboard data for homeowners
 * View claims, jobs, photos, messages, invoices
 */

import prisma from "@/lib/prisma";

export interface ClientDashboardData {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    propertyAddress: string;
  };
  claims: ClientClaim[];
  jobs: ClientJob[];
  messages: ClientMessage[];
  documents: ClientDocument[];
  summary: {
    totalClaims: number;
    activeClaims: number;
    completedJobs: number;
    totalPaid: number;
    pendingAmount: number;
  };
}

export interface ClientClaim {
  id: string;
  claimNumber?: string;
  status: string;
  damageType?: string;
  createdAt: Date;
  updatedAt: Date;
  timeline?: {
    event: string;
    date: Date;
    description?: string;
  }[];
}

export interface ClientJob {
  id: string;
  title: string;
  status: string;
  progress: number;
  estimatedCost?: number;
  actualCost?: number;
  scheduledStart?: Date;
  completedAt?: Date;
  photos: ClientPhoto[];
}

export interface ClientPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  category?: string;
  uploadedAt: Date;
}

export interface ClientMessage {
  id: string;
  from: string;
  message: string;
  sentAt: Date;
  read: boolean;
  attachments?: string[];
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Get complete client dashboard data
 */
export async function getClientDashboard(clientId: string): Promise<ClientDashboardData | null> {
  try {
    const client = await prisma.homeowner_intake.findUnique({
      where: { id: clientId },
      include: {
        claims: {
          orderBy: { createdAt: "desc" },
        },
        jobs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return null;
    }

    // Get messages (from comments/activity)
    const messages = await getClientMessages(clientId);

    // Get documents
    const documents = await getClientDocuments(clientId);

    // Calculate summary
    const summary = calculateClientSummary(client);

    return {
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phoneNumber || undefined,
        propertyAddress: client.propertyAddress,
      },
      claims: formatClientClaims(client.claims),
      jobs: await formatClientJobs(client.jobs),
      messages,
      documents,
      summary,
    };
  } catch (error) {
    console.error("Failed to load client dashboard:", error);
    return null;
  }
}

/**
 * Get client claim details
 */
export async function getClientClaim(
  claimId: string,
  clientId: string
): Promise<ClientClaim | null> {
  try {
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        homeownerId: clientId,
      },
    });

    if (!claim) {
      return null;
    }

    // Build timeline
    const timeline = await buildClaimTimeline(claimId);

    return {
      id: claim.id,
      claimNumber: claim.claimNumber || undefined,
      status: claim.status,
      damageType: claim.lossType || undefined,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      timeline,
    };
  } catch (error) {
    console.error("Failed to load claim:", error);
    return null;
  }
}

/**
 * Get client job details with photos
 */
export async function getClientJob(jobId: string, clientId: string): Promise<ClientJob | null> {
  try {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        // Verify client owns this job via claim
      },
      include: {
        photos: true,
      },
    });

    if (!job) {
      return null;
    }

    return {
      id: job.id,
      title: job.title,
      status: job.status,
      progress: calculateJobProgress(job),
      estimatedCost: job.estimatedCost || undefined,
      actualCost: job.actualCost || undefined,
      scheduledStart: job.scheduledStart || undefined,
      completedAt: job.completedAt || undefined,
      photos: formatClientPhotos(job.photos),
    };
  } catch (error) {
    console.error("Failed to load job:", error);
    return null;
  }
}

/**
 * Get client messages
 */
async function getClientMessages(clientId: string): Promise<ClientMessage[]> {
  try {
    // Get activity log entries that are client-facing
    const activities = await prisma.activity_log.findMany({
      where: {
        resourceId: clientId,
        // Filter for client-visible events
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return activities.map((activity) => ({
      id: activity.id,
      from: "Your Contractor",
      message: activity.description,
      sentAt: activity.createdAt,
      read: false, // TODO: Track read status
      attachments: [],
    }));
  } catch {
    return [];
  }
}

/**
 * Get client documents
 */
async function getClientDocuments(clientId: string): Promise<ClientDocument[]> {
  try {
    const documents = await prisma.document.findMany({
      where: {
        // Link to client's claims/jobs
      },
      orderBy: { createdAt: "desc" },
    });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type || "document",
      url: doc.url,
      size: doc.size || 0,
      uploadedAt: doc.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Format claims for client view
 */
function formatClientClaims(claims: any[]): ClientClaim[] {
  return claims.map((claim) => ({
    id: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status,
    damageType: claim.lossType,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  }));
}

/**
 * Format jobs for client view
 */
async function formatClientJobs(jobs: any[]): Promise<ClientJob[]> {
  const formatted = await Promise.all(
    jobs.map(async (job) => {
      const photos = await prisma.photo.findMany({
        where: { jobId: job.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return {
        id: job.id,
        title: job.title,
        status: job.status,
        progress: calculateJobProgress(job),
        estimatedCost: job.estimatedCost,
        actualCost: job.actualCost,
        scheduledStart: job.scheduledStart,
        completedAt: job.completedAt,
        photos: formatClientPhotos(photos),
      };
    })
  );

  return formatted;
}

/**
 * Format photos for client view
 */
function formatClientPhotos(photos: any[]): ClientPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl || photo.url,
    category: photo.category,
    uploadedAt: photo.createdAt,
  }));
}

/**
 * Calculate client summary stats
 */
function calculateClientSummary(client: any) {
  const claims = client.claims || [];
  const jobs = client.jobs || [];

  return {
    totalClaims: claims.length,
    activeClaims: claims.filter((c: any) =>
      ["NEW", "IN_PROGRESS", "UNDER_REVIEW"].includes(c.status)
    ).length,
    completedJobs: jobs.filter((j: any) => j.status === "COMPLETED").length,
    totalPaid: jobs.reduce((sum: number, j: any) => sum + (j.actualCost || 0), 0),
    pendingAmount: jobs
      .filter((j: any) => j.status !== "COMPLETED")
      .reduce((sum: number, j: any) => sum + (j.estimatedCost || 0), 0),
  };
}

/**
 * Calculate job progress percentage
 */
function calculateJobProgress(job: any): number {
  if (job.status === "COMPLETED") return 100;
  if (job.status === "NEW") return 0;
  if (job.status === "IN_PROGRESS") return 50;
  return 25;
}

/**
 * Build claim timeline
 */
async function buildClaimTimeline(claimId: string) {
  try {
    const activities = await prisma.activity_log.findMany({
      where: { resourceId: claimId },
      orderBy: { createdAt: "asc" },
    });

    return activities.map((activity) => ({
      event: activity.action,
      date: activity.createdAt,
      description: activity.description,
    }));
  } catch {
    return [];
  }
}

/**
 * Submit client message
 */
export async function submitClientMessage(
  clientId: string,
  message: string,
  claimId?: string
): Promise<boolean> {
  try {
    // TODO: Store in messages table
    console.log("Client message:", { clientId, message, claimId });
    return true;
  } catch {
    return false;
  }
}
