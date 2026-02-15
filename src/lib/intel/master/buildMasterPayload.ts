// lib/intel/master/buildMasterPayload.ts
import prisma from "@/lib/prisma";

// Simplified stubbed payload: deep relational arrays are intentionally empty
// until underlying schema/relations are normalized. This minimizes type errors.
export interface MasterReportPayload {
  claim: any;
  property: any | null;
  estimates: any[];
  supplements: any[];
  weatherReports: any[];
  damageAssessments: any[];
  scopes: any[];
  photos: any[];
  documents: any[];
  payments: any[];
  inspectionNotes: any[];
}

export async function buildMasterReportPayload({
  claimId,
  orgId,
}: {
  claimId: string;
  orgId: string;
}): Promise<MasterReportPayload> {
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    select: {
      id: true,
      claimNumber: true,
      title: true,
      description: true,
      dateOfLoss: true,
      propertyId: true,
    },
  });

  if (!claim) throw new Error(`Claim ${claimId} not found or access denied`);

  return {
    claim,
    property: null,
    estimates: [],
    supplements: [],
    weatherReports: [],
    damageAssessments: [],
    scopes: [],
    photos: [],
    documents: [],
    payments: [],
    inspectionNotes: [],
  };
}
