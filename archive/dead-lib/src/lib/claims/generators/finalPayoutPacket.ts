/**
 * Final Payout Packet Generator
 *
 * Creates comprehensive final payout documentation package
 */

import prisma from "@/lib/prisma";

export interface FinalPayoutPacketOptions {
  includePhotos?: boolean;
  includeSupplements?: boolean;
  includeWeather?: boolean;
  format?: "pdf" | "docx" | "html";
}

export interface FinalPayoutPacket {
  id: string;
  claimId: string;
  generatedAt: Date;
  totalPayout: number;
  breakdown: {
    baseAmount: number;
    supplements: number;
    deductible: number;
    depreciation: number;
    netPayout: number;
  };
  documents: Array<{
    type: string;
    name: string;
    url?: string;
  }>;
}

/**
 * Generate a final payout packet for a claim
 */
export async function generateFinalPayoutPacket(
  claimId: string,
  options: FinalPayoutPacketOptions = {}
): Promise<FinalPayoutPacket> {
  const { includePhotos = true, includeSupplements = true } = options;

  // Fetch claim data
  const claim = await prisma.claims.findUnique({
    where: { id: claimId },
    include: {
      scopes: true,
      ai_reports: {
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!claim) {
    throw new Error(`Claim not found: ${claimId}`);
  }

  // Calculate payout breakdown
  const baseAmount = claim.rcvTotal || 0;
  const supplements = claim.supplementTotal || 0;
  const deductible = claim.deductible || 0;
  const depreciation = claim.depreciationTotal || 0;
  const netPayout = baseAmount + supplements - deductible - depreciation;

  // Build document list
  const documents: FinalPayoutPacket["documents"] = [];

  // Add main report
  if (claim.ai_reports[0]) {
    documents.push({
      type: "report",
      name: "Final Claim Report",
      url: `/api/reports/${claim.ai_reports[0].id}/download`,
    });
  }

  // Add supplement documentation
  if (includeSupplements && supplements > 0) {
    documents.push({
      type: "supplement",
      name: "Supplement Documentation",
    });
  }

  // Add photo evidence
  if (includePhotos) {
    documents.push({
      type: "photos",
      name: "Photo Evidence Package",
    });
  }

  return {
    id: `packet_${claimId}_${Date.now()}`,
    claimId,
    generatedAt: new Date(),
    totalPayout: netPayout,
    breakdown: {
      baseAmount,
      supplements,
      deductible,
      depreciation,
      netPayout,
    },
    documents,
  };
}
