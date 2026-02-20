import prisma from "@/lib/prisma";

export async function gatherAppealClaimContext(orgId: string, claimId: string) {
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      properties: true,
      claim_supplements: { orderBy: { createdAt: "desc" }, take: 10 },
      claim_estimates: { orderBy: { createdAt: "desc" }, take: 5 },
      claim_activities: { orderBy: { createdAt: "desc" }, take: 25 },
    },
  });
  if (!claim) return null;

  // Basic aggregation for AI prompt
  const latestEstimate = claim.claim_estimates?.[0];
  const supplementCount = claim.claim_supplements?.length || 0;
  const activitySummary = claim.claim_activities
    ?.map(a => `${a.activityType}: ${a.description?.slice(0,80)}`)
    .join(" | ") || "";

  return {
    claimNumber: claim.claimNumber,
    damageType: claim.damageType,
    lossDate: claim.lossDate,
    property: {
      street: claim.properties?.street,
      city: claim.properties?.city,
      state: claim.properties?.state,
      carrier: claim.properties?.carrier,
      policyNumber: claim.properties?.policyNumber,
    },
    financials: {
      latestEstimateTotal: latestEstimate?.grandTotal || null,
      supplementCount,
    },
    activitySummary,
  };
}