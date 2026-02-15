import prisma from "@/lib/prisma";
import { analyzeClaimDamage } from '@/lib/vision/claimDamageAnalyzer';

interface AssembleParams { claimId: string; sections: string[]; format: 'pdf'|'html'; }

export async function assembleClaimReport(params: AssembleParams) {
  const claim = await prisma.claims.findUnique({
    where: { id: params.claimId },
    include: {
      badFaithAnalysis: true,
      analysis: true,
      ClaimMaterial: { take: 25 },
      fileAssets: { select: { publicUrl: true, aiDamage: true, aiTags: true }, take: 40 }
    }
  }).catch(() => null);

  const sectionsData: Record<string, any> = {};

  if (params.sections.includes('summary')) {
    sectionsData.summary = {
      title: claim?.title,
      claimNumber: claim?.claimNumber,
      carrier: claim?.carrier,
      damageType: claim?.damageType,
      status: claim?.status,
      dateOfLoss: claim?.dateOfLoss,
    };
  }

  if (params.sections.includes('photos')) {
    const damage = await analyzeClaimDamage(params.claimId).catch(() => null);
    sectionsData.photos = {
      photoCount: damage?.photoCount || claim?.fileAssets.length || 0,
      representative: damage?.representativePhotos || claim?.fileAssets.slice(0,5).map(f=>f.publicUrl),
      primarySeverity: damage?.primarySeverity,
      tagHistogram: damage?.tagHistogram
    };
  }

  if (params.sections.includes('estimate')) {
    sectionsData.estimate = {
      estimatedValue: claim?.estimatedValue,
      approvedValue: claim?.approvedValue,
      deductible: claim?.deductible,
      exposureCents: claim?.exposureCents,
      materialsCount: claim?.ClaimMaterial.length || 0
    };
  }

  if (params.sections.includes('legal')) {
    sectionsData.legal = {
      badFaithFlags: claim?.badFaithAnalysis?.indicators || [],
      badFaithSummary: claim?.badFaithAnalysis?.summary,
      litigationProbability: claim?.analysis?.litigationProbability
    };
  }

  if (params.sections.includes('supplements')) {
    // Placeholder: gather supplements when model present
    sectionsData.supplements = {
      total: (claim as any)?.supplements?.length || 0,
      recent: ((claim as any)?.supplements || []).slice(0,3)
    };
  }

  // Estimated render metrics heuristics
  const pageEstimate = Math.max(3, Math.ceil(Object.keys(sectionsData).length * 1.4));
  const estimatedSeconds = pageEstimate * (params.format === 'pdf' ? 1.2 : 0.6);

  return { sectionsData, pageEstimate, estimatedSeconds };
}
