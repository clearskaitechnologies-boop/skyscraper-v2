import { z } from 'zod';

import prisma from "@/lib/prisma";
import { analyzeClaimDamage } from '@/lib/vision/claimDamageAnalyzer';

import { BaseAgent } from './baseAgent';

export const ClaimsAnalysisInput = z.object({
  claimId: z.string().min(1),
  modes: z.array(z.enum(['damage','coverage','risk'])).default(['damage','coverage'])
});

export const ClaimsAnalysisOutput = z.object({
  claimId: z.string(),
  findings: z.record(z.string(), z.any()),
  riskScore: z.number().min(0).max(100),
  damageAnalysis: z.object({
    photoCount: z.number(),
    severeCount: z.number(),
    moderateCount: z.number(),
    minorCount: z.number(),
    damageScore: z.number(),
    primarySeverity: z.enum(['low','moderate','high']),
    representativePhotos: z.array(z.string()),
    tagHistogram: z.record(z.string(), z.number())
  }).optional(),
  riskComponents: z.record(z.string(), z.number()).optional(),
  tokensUsed: z.number().optional()
});

export class ClaimsAnalysisAgent extends BaseAgent<z.infer<typeof ClaimsAnalysisInput>, z.infer<typeof ClaimsAnalysisOutput>> {
  inputSchema = ClaimsAnalysisInput;
  outputSchema = ClaimsAnalysisOutput;
  constructor(){ super({ name: 'claims-analysis', version: '1.0.0' }); }
  protected async run(input){
    const findings: Record<string, any> = {};
    let damageAnalysis: ReturnType<typeof analyzeClaimDamage> | undefined;

    if (input.modes.includes('damage')) {
      damageAnalysis = await analyzeClaimDamage(input.claimId).catch(() => undefined);
      if (damageAnalysis) {
        findings.damage = {
          severity: damageAnalysis.primarySeverity,
          estimatedRepairDays: Math.round(5 + (damageAnalysis.damageScore / 100) * 25),
          photoCount: damageAnalysis.photoCount
        };
      } else {
        findings.damage = { severity: 'unknown', estimatedRepairDays: null };
      }
    }

    const claim = await prisma.claims.findUnique({
      where: { id: input.claimId },
      select: { deductible: true, exposureCents: true, status: true, priority: true }
    }).catch(() => null);

    if (input.modes.includes('coverage')) {
      const deductible = claim?.deductible || 0;
      const exposure = claim?.exposureCents || 0;
      const ratio = exposure > 0 ? deductible / exposure : 0;
      findings.coverage = {
        deductible,
        exposureCents: exposure,
        deductibleExposureRatio: Number(ratio.toFixed(3)),
        exclusionsFlagged: ratio > 0.15 ? 2 : ratio > 0.05 ? 1 : 0,
        policyRisk: ratio > 0.2 ? 'high' : ratio > 0.08 ? 'medium' : 'low'
      };
    }

    // Risk mode derives components from damage & coverage
    let riskComponents: Record<string, number> | undefined;
    if (input.modes.includes('risk')) {
      const damageScore = damageAnalysis?.damageScore ?? 0;
      // Coverage risk derived from deductible/exposure ratio
      const coverageRatio = findings.coverage?.deductibleExposureRatio ?? 0;
      const coverageRisk = Math.min(100, coverageRatio * 300); // scaled heuristic
      // Litigation probability heuristic using status + severity
      const status = claim?.status || 'new';
      const priority = claim?.priority || 'medium';
      let litigationBase = 5;
      if (['denied','stalled','appeal'].includes(status)) litigationBase += 25;
      if (priority === 'high') litigationBase += 10;
      if ((damageAnalysis?.primarySeverity) === 'high') litigationBase += 10;
      const litigationProbability = Math.min(95, litigationBase + damageScore * 0.2);
      riskComponents = {
        damage: Number(damageScore.toFixed(2)),
        coverage: Number(coverageRisk.toFixed(2)),
        litigationProbability: Number(litigationProbability.toFixed(2))
      };
      findings.risk = { litigationProbability: riskComponents.litigationProbability / 100 };
    }

    // Weighted composite risk score
    const damageComponent = (riskComponents?.damage ?? damageAnalysis?.damageScore ?? 0) * 0.5;
    const coverageComponent = (riskComponents?.coverage ?? 0) * 0.3;
    const litigationComponent = (riskComponents?.litigationProbability ?? 0) * 0.2;
    const composite = Math.round(damageComponent + coverageComponent + litigationComponent);

    return {
      claimId: input.claimId,
      findings,
      damageAnalysis,
      riskComponents,
      riskScore: composite
    };
  }
}
