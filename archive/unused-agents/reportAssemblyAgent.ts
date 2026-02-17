import { z } from 'zod';

import { assembleClaimReport } from '@/lib/reports/reportAssembler';

import { BaseAgent } from './baseAgent';

export const ReportAssemblyInput = z.object({
  claimId: z.string().min(1),
  sections: z.array(z.enum(['summary','photos','estimate','legal','supplements'])).min(1),
  format: z.enum(['pdf','html'])
});

export const ReportAssemblyOutput = z.object({
  claimId: z.string(),
  includedSections: z.array(z.string()),
  format: z.enum(['pdf','html']),
  url: z.string().url().optional(),
  bytes: z.number().optional(),
  tokensUsed: z.number().optional(),
  sectionsData: z.record(z.string(), z.any()),
  renderMeta: z.object({ estimatedSeconds: z.number(), pageEstimate: z.number().optional() }).optional()
});

export class ReportAssemblyAgent extends BaseAgent<z.infer<typeof ReportAssemblyInput>, z.infer<typeof ReportAssemblyOutput>> {
  inputSchema = ReportAssemblyInput;
  outputSchema = ReportAssemblyOutput;
  constructor(){ super({ name: 'report-assembly', version: '1.0.0' }); }
  protected async run(input){
    const { sectionsData, estimatedSeconds, pageEstimate } = await assembleClaimReport({
      claimId: input.claimId,
      sections: input.sections,
      format: input.format
    });
    // Rendering pipeline (PDF/HTML) is stubbed; future: puppeteer compile.
    return {
      claimId: input.claimId,
      includedSections: input.sections,
      format: input.format,
      sectionsData,
      renderMeta: { estimatedSeconds, pageEstimate },
      url: 'https://example.com/reports/temp/'+input.claimId,
      bytes: 1024 * (pageEstimate || 3)
    };
  }
}
