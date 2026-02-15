import prisma from "@/lib/prisma";

type GetOrCreatePortalThreadInput = {
  orgId: string;
  claimId: string;
};

/**
 * Get or create a portal messaging thread for a specific claim.
 * Each claim has exactly ONE portal thread shared between homeowner and pro team.
 */
export async function getOrCreatePortalThread({ orgId, claimId }: GetOrCreatePortalThreadInput) {
  // Try to find existing portal thread for this claim/org
  const existing = await prisma.messageThread.findFirst({
    where: {
      orgId,
      claimId,
      isPortalThread: true,
    },
  });

  if (existing) {
    return existing;
  }

  // Create a new portal thread
  return prisma.messageThread.create({
    data: {
      id: crypto.randomUUID(),
      orgId,
      claimId,
      isPortalThread: true,
      subject: "Client Portal Messages",
      participants: [], // Will be populated as messages are sent
    },
  });
}
