import { upstash } from '@/lib/upstash';

/**
 * Simple interrupt-safe Redis queue for AI vision jobs.
 * Each job: { id, type, claimId, payload, status }
 * Status lifecycle: pending -> running -> complete | failed
 */
const redis = upstash;

const PENDING_LIST = 'aiq:pending';
const RUNNING_HASH = 'aiq:running';
const RESULTS_HASH = 'aiq:results';

export type VisionJob = {
  id: string;
  type: string; // e.g. roof-geometry, materials, damage
  claimId: string;
  payload: any;
};

export async function enqueue(job: VisionJob) {
  await redis.lpush(PENDING_LIST, JSON.stringify(job));
}

export async function dequeue(): Promise<VisionJob | null> {
  const raw = await redis.rpop(PENDING_LIST);
  if (!raw) return null;
  const job = JSON.parse(raw) as VisionJob;
  await redis.hset(RUNNING_HASH, { [job.id]: JSON.stringify(job) });
  return job;
}

export async function markComplete(jobId: string, result: any) {
  await redis.hdel(RUNNING_HASH, jobId);
  await redis.hset(RESULTS_HASH, { [jobId]: JSON.stringify({ status: 'complete', result }) });
}

export async function markFailed(jobId: string, error: any) {
  await redis.hdel(RUNNING_HASH, jobId);
  await redis.hset(RESULTS_HASH, { [jobId]: JSON.stringify({ status: 'failed', error: String(error) }) });
}

export async function getResult(jobId: string) {
  const data = await redis.hget(RESULTS_HASH, jobId);
  return typeof data === 'string' ? JSON.parse(data) : null;
}

export async function getQueueDepth() {
  const depth = await redis.llen(PENDING_LIST);
  return depth;
}
