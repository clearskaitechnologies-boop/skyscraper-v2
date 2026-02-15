import { safeOrgContext } from '@/lib/safeOrgContext';

import { AgentContext,BaseAgent } from './baseAgent';
import { formatAgentOutput } from './rootPrompt';

export async function runWithOrgContext<I, O>(agent: BaseAgent<I, O>, rawInput: unknown, ctx: AgentContext = {}) {
  const started = Date.now();
  const orgCtx = await safeOrgContext();
  if (orgCtx.status !== 'ok') {
    return formatAgentOutput({
      agentName: agent.meta.name,
      version: agent.meta.version,
      classification: 'org_context_error',
      response: null,
      assumptions: [
        `Org state not ok: ${orgCtx.status}`,
        orgCtx.reason ? `reason:${orgCtx.reason}` : 'no-reason',
      ],
      memoryHints: ['org_context_error', `status:${orgCtx.status}`],
      startedAt: started,
    });
  }
  return agent.execute(rawInput, { ...ctx, orgId: orgCtx.orgId, userId: orgCtx.userId });
}
