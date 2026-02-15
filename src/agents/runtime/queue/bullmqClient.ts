import { Queue, Worker } from "bullmq";

const connectionOpts = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD,
};

export function makeQueue(name: string) {
  return new Queue(name, { connection: connectionOpts });
}

export function makeWorker(name: string, handler: (job: any) => Promise<any>) {
  return new Worker(name, handler, { connection: connectionOpts });
}
