/**
 * Organization Transfer Ownership
 *
 * Allows transferring org ownership to another user
 * Includes safety checks and audit trail
 */

import prisma from "@/lib/prisma";
import { logAudit } from "@/middleware/auditLog";

export interface TransferRequest {
  id: string;
  orgId: string;
  fromUserId: string;
  toUserId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

/**
 * Initiate ownership transfer
 */
export async function initiateOwnershipTransfer(
  orgId: string,
  fromUserId: string,
  toUserId: string
): Promise<TransferRequest> {
  // Validate users
  const [fromUser, toUser] = await Promise.all([
    prisma.user_organizations.findFirst({
      where: { orgId, userId: fromUserId, role: "admin" },
    }),
    prisma.user_organizations.findFirst({
      where: { orgId, userId: toUserId },
    }),
  ]);

  if (!fromUser) {
    throw new Error("Current user must be org admin");
  }

  if (!toUser) {
    throw new Error("Target user must be member of organization");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to accept

  const transfer = await prisma.ownershipTransfer
    .create({
      data: {
        orgId,
        fromUserId,
        toUserId,
        status: "PENDING",
        expiresAt,
      },
    })
    .catch(() => {
      throw new Error("Failed to create transfer request");
    });

  // Log audit event
  await logAudit({
    userId: fromUserId,
    orgId,
    action: "OWNERSHIP_TRANSFER_INITIATED",
    resource: "organization",
    resourceId: orgId,
    metadata: {
      toUserId,
      transferId: transfer.id,
    },
  });

  return transfer as TransferRequest;
}

/**
 * Accept ownership transfer
 */
export async function acceptOwnershipTransfer(transferId: string, userId: string): Promise<void> {
  const transfer = await prisma.ownershipTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error("Transfer request not found");
  }

  if (transfer.toUserId !== userId) {
    throw new Error("Only target user can accept transfer");
  }

  if (transfer.status !== "PENDING") {
    throw new Error("Transfer already processed");
  }

  if (new Date() > transfer.expiresAt) {
    throw new Error("Transfer request expired");
  }

  // Execute transfer in transaction
  await prisma.$transaction([
    // Update new owner to admin
    prisma.user_organizations.update({
      where: {
        userId_orgId: {
          userId: transfer.toUserId,
          orgId: transfer.orgId,
        },
      },
      data: {
        role: "admin",
      },
    }),

    // Downgrade old owner to manager (or remove if desired)
    prisma.user_organizations.update({
      where: {
        userId_orgId: {
          userId: transfer.fromUserId,
          orgId: transfer.orgId,
        },
      },
      data: {
        role: "manager",
      },
    }),

    // Update transfer status
    prisma.ownershipTransfer.update({
      where: { id: transferId },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    }),
  ]);

  // Log audit event
  await logAudit({
    userId,
    orgId: transfer.orgId,
    action: "OWNERSHIP_TRANSFER_ACCEPTED",
    resource: "organization",
    resourceId: transfer.orgId,
    metadata: {
      fromUserId: transfer.fromUserId,
      transferId,
    },
  });
}

/**
 * Reject ownership transfer
 */
export async function rejectOwnershipTransfer(transferId: string, userId: string): Promise<void> {
  const transfer = await prisma.ownershipTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error("Transfer request not found");
  }

  if (transfer.toUserId !== userId) {
    throw new Error("Only target user can reject transfer");
  }

  await prisma.ownershipTransfer.update({
    where: { id: transferId },
    data: {
      status: "REJECTED",
    },
  });

  // Log audit event
  await logAudit({
    userId,
    orgId: transfer.orgId,
    action: "OWNERSHIP_TRANSFER_REJECTED",
    resource: "organization",
    resourceId: transfer.orgId,
    metadata: {
      fromUserId: transfer.fromUserId,
      transferId,
    },
  });
}

/**
 * Cancel ownership transfer
 */
export async function cancelOwnershipTransfer(transferId: string, userId: string): Promise<void> {
  const transfer = await prisma.ownershipTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error("Transfer request not found");
  }

  if (transfer.fromUserId !== userId) {
    throw new Error("Only initiator can cancel transfer");
  }

  await prisma.ownershipTransfer.update({
    where: { id: transferId },
    data: {
      status: "EXPIRED",
    },
  });
}

/**
 * Get pending transfers for user
 */
export async function getPendingTransfers(userId: string): Promise<TransferRequest[]> {
  try {
    return (await prisma.ownershipTransfer
      .findMany({
        where: {
          toUserId: userId,
          status: "PENDING",
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      .catch(() => [])) as TransferRequest[];
  } catch {
    return [];
  }
}
