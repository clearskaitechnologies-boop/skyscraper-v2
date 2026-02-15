// scripts/agentWorker.ts
import 'dotenv/config';

import { AgentRegistry } from '@/agents/agent.registry';
import { agentQueue,createAgentWorker } from '@/modules/automation/queue';

// Basic health log
console.log('🤖 SkaiAgent Worker starting…');
if (!process.env.REDIS_URL) {
  console.error('Missing REDIS_URL. Set it in .env.local or env.');
  process.exit(1);
}

// Processor
const worker = createAgentWorker(async (job) => {
  const { agentId, ...ctx } = job.data as any;
  const agent = AgentRegistry.find((a) => a.id === agentId);
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  // Preconditions check (optional)
  if (agent.preconditions) {
    const ok = await agent.preconditions(ctx);
    if (!ok) {
      return { ok: false, message: 'Preconditions failed' };
    }
  }

  // Execute
  const result = await agent.run(ctx);
  return result;
}, 5);

worker.on('ready', () => console.log('Worker ready on queue skai:agents'));
worker.on('active', (job) => console.log(`Running ${job.id} - ${job.name}`));
worker.on('completed', (job, res) => console.log(`Completed ${job.id}`, res));
worker.on('failed', (job, err) => console.error(`Failed ${job?.id}`, err));

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down worker…');
  await worker.close();
  await agentQueue.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
