import cron from 'node-cron';
import { Queue } from 'bullmq';
import pino from 'pino';
// Reuse singleton ioredis client to prevent excess connections
import { getRedis } from '@/lib/redis';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Only run scheduler if explicitly enabled
const ENABLE_SCHEDULER = process.env.ENABLE_SCHEDULER === 'true';

if (!ENABLE_SCHEDULER) {
  logger.info('⏸️ Scheduler disabled (set ENABLE_SCHEDULER=true to enable)');
} else {
  // BullMQ requires a full Redis connection (not the Upstash REST client)
  // getRedis() throws if required host/port/password are missing.
  let connection;
  try {
    connection = getRedis();
  } catch (e) {
    logger.error({ error: (e as Error).message }, '❌ Redis configuration incomplete for scheduler');
    process.exit(1);
  }

  // Create queues for scheduling
  const retryQueue = new Queue('retries', { connection });
  const weatherQueue = new Queue('weather', { connection });

  logger.info('⏰ Scheduler enabled');

  // Every 5 minutes: Retry failed jobs
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('🔄 Running retry job...');
      
      // Get failed jobs from all queues
      const queues = ['reports', 'mockups', 'weather', 'emails'];
      
      for (const queueName of queues) {
        const queue = new Queue(queueName, { connection });
        const failed = await queue.getFailed(0, 10); // Get first 10 failed jobs
        
        logger.info({ queue: queueName, count: failed.length }, '🔍 Found failed jobs');
        
        for (const job of failed) {
          // Only retry if it hasn't been retried too many times
          const attemptsMade = job.attemptsMade || 0;
          if (attemptsMade < 3) {
            await job.retry();
            logger.info({ jobId: job.id, queue: queueName }, '🔄 Retried job');
          } else {
            logger.warn({ jobId: job.id, queue: queueName }, '⚠️ Job exceeded retry limit');
          }
        }
      }
      
      logger.info('✅ Retry job complete');
    } catch (error) {
      logger.error({ error }, '❌ Retry job failed');
    }
  });

  // Hourly: Weather backfill (if needed)
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('🌤️ Running weather backfill...');
      
      // TODO: Query database for claims missing weather data
      // TODO: Enqueue weather jobs for those claims
      
      logger.info('✅ Weather backfill complete');
    } catch (error) {
      logger.error({ error }, '❌ Weather backfill failed');
    }
  });

  // Daily at 2 AM: Clean up old completed jobs
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('🧹 Running cleanup job...');
      
      const queues = ['reports', 'mockups', 'weather', 'emails'];
      const olderThan = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      for (const queueName of queues) {
        const queue = new Queue(queueName, { connection });
        
        // Clean completed jobs older than 7 days
        await queue.clean(olderThan, 100, 'completed');
        logger.info({ queue: queueName }, '🧹 Cleaned completed jobs');
        
        // Clean failed jobs older than 7 days
        await queue.clean(olderThan, 100, 'failed');
        logger.info({ queue: queueName }, '🧹 Cleaned failed jobs');
      }
      
      logger.info('✅ Cleanup complete');
    } catch (error) {
      logger.error({ error }, '❌ Cleanup failed');
    }
  });

  logger.info('✅ Scheduler tasks configured');
}

export default ENABLE_SCHEDULER;
