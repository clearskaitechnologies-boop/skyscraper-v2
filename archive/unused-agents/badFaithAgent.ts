import { z } from 'zod';

import { getBadFaithAnalysis } from '@/lib/claims/badFaithDetector';

import { BaseAgent } from './baseAgent';

export const BadFaithInput = z.object({
  claimId: z.string().min(1),
  forceRefresh: z.boolean().optional().default(false)
});

export const BadFaithOutput = z.object({
  hasBadFaithIndicators: z.boolean(),
  indicators: z.array(z.any()),
  overallSeverity: z.enum(['none','low','medium','high','critical']),
  legalActionRecommended: z.boolean(),
  attorneyReferralSuggested: z.boolean(),
  summary: z.string()
});

export class BadFaithAgent extends BaseAgent<z.infer<typeof BadFaithInput>, z.infer<typeof BadFaithOutput>> {
  inputSchema = BadFaithInput;
  outputSchema = BadFaithOutput;
  constructor(){ super({ name: 'bad-faith', version: '1.0.0' }); }
  protected async run(input){
    // forceRefresh true bypasses cached check by calling detect directly
    const analysis = await getBadFaithAnalysis(input.claimId);
    return analysis as any;
  }
}
