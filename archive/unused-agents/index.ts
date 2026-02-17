export * from './badFaithAgent';
export * from './baseAgent';
export * from './claimsAnalysisAgent';
export * from './rebuttalAgent';
export * from './reportAssemblyAgent';
export * from './securityAuditAgent';
export * from './tokenLedgerAgent';

// Registry helper
import { BadFaithAgent } from './badFaithAgent';
import { ClaimsAnalysisAgent } from './claimsAnalysisAgent';
import { RebuttalAgent } from './rebuttalAgent';
import { ReportAssemblyAgent } from './reportAssemblyAgent';
import { SecurityAuditAgent } from './securityAuditAgent';
import { TokenLedgerAgent } from './tokenLedgerAgent';

export const agentRegistry = {
  'bad-faith': () => new BadFaithAgent(),
  'rebuttal': () => new RebuttalAgent(),
  'report-assembly': () => new ReportAssemblyAgent(),
  'claims-analysis': () => new ClaimsAnalysisAgent(),
  'token-ledger': () => new TokenLedgerAgent(),
  'security-audit': () => new SecurityAuditAgent(),
};
