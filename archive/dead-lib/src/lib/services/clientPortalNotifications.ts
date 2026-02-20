/**
 * Client Portal Notification Service
 * Automatically notify clients when contractors update their claims
 */

import prisma from "@/lib/prisma";

interface NotifyClientParams {
  claimId: string;
  orgId: string;
  type: "FILE_ADDED" | "MESSAGE" | "TIMELINE";
  title: string;
  body: string;
  actionUrl?: string;
}

/**
 * Notify all clients who have portal access to a claim
 * Used when contractors add files, messages, or timeline events
 */
export async function notifyClientOfClaimUpdate(params: NotifyClientParams) {
  const { claimId, orgId, type, title, body, actionUrl } = params;

  // Find all clients with portal access to this claim
  const portalAccessList = await prisma.client_access.findMany({
    where: {
      claimId,
    },
    include: {
      client: true,
    },
  });

  if (portalAccessList.length === 0) {
    // No clients have access yet - that's okay
    return { notified: 0 };
  }

  // Create notifications for each client
  const notifications = await Promise.all(
    portalAccessList.map((access) =>
      prisma.clientNotification.create({
        data: {
          clientId: access.clientId,
          title,
          message: body,
          type: type.toLowerCase(),
          actionUrl: actionUrl || `/portal/claims/${claimId}`,
          metadata: {
            claimId,
            orgId,
            notificationType: type,
            timestamp: new Date().toISOString(),
          },
        },
      })
    )
  );

  // Optional: Send email notifications using existing email infrastructure
  // Can be added later without breaking existing functionality

  return {
    notified: notifications.length,
    clients: portalAccessList.map((a) => a.client.email),
  };
}

/**
 * Helper function specifically for file additions
 */
export async function notifyFileAdded(params: {
  claimId: string;
  orgId: string;
  fileName: string;
  uploadedBy: string;
}) {
  return notifyClientOfClaimUpdate({
    claimId: params.claimId,
    orgId: params.orgId,
    type: "FILE_ADDED",
    title: "New Document Added",
    body: `${params.uploadedBy} added ${params.fileName} to your claim.`,
    actionUrl: `/portal/claims/${params.claimId}#files`,
  });
}

/**
 * Helper function for new messages
 */
export async function notifyNewMessage(params: {
  claimId: string;
  orgId: string;
  message: string;
  senderName: string;
}) {
  return notifyClientOfClaimUpdate({
    claimId: params.claimId,
    orgId: params.orgId,
    type: "MESSAGE",
    title: "New Message",
    body: `${params.senderName}: ${params.message.substring(0, 100)}${params.message.length > 100 ? "..." : ""}`,
    actionUrl: `/portal/claims/${params.claimId}#messages`,
  });
}

/**
 * Helper function for timeline events
 */
export async function notifyTimelineEvent(params: {
  claimId: string;
  orgId: string;
  eventTitle: string;
  eventDescription?: string;
}) {
  return notifyClientOfClaimUpdate({
    claimId: params.claimId,
    orgId: params.orgId,
    type: "TIMELINE",
    title: "Claim Update",
    body: params.eventDescription || params.eventTitle,
    actionUrl: `/portal/claims/${params.claimId}#timeline`,
  });
}
