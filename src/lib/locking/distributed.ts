/**
 * Task 193: Distributed Locking System
 *
 * Implements distributed locks for coordinating access to shared resources across services.
 * Provides lock acquisition, release, automatic expiry, and deadlock prevention.
 */

import prisma from "@/lib/prisma";

export type LockType = "exclusive" | "shared";
export type LockStatus = "active" | "expired" | "released";

export interface DistributedLock {
  id: string;
  resourceId: string;
  resourceType: string;
  type: LockType;
  holder: string; // Service/instance ID
  acquiredAt: Date;
  expiresAt: Date;
  status: LockStatus;
  metadata: Record<string, any>;
}

export interface LockOptions {
  type?: LockType;
  ttl?: number; // Time to live in seconds
  timeout?: number; // Acquisition timeout in milliseconds
  retry?: {
    attempts?: number;
    delay?: number; // milliseconds
  };
  metadata?: Record<string, any>;
}

const DEFAULT_TTL = 30; // 30 seconds
const DEFAULT_TIMEOUT = 5000; // 5 seconds
const DEFAULT_RETRY_ATTEMPTS = 10;
const DEFAULT_RETRY_DELAY = 500; // 500ms

/**
 * Acquire a distributed lock
 */
export async function acquireLock(
  resourceId: string,
  resourceType: string,
  holder: string,
  options: LockOptions = {}
): Promise<DistributedLock> {
  const lockType = options.type || "exclusive";
  const ttl = options.ttl || DEFAULT_TTL;
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const retryAttempts = options.retry?.attempts || DEFAULT_RETRY_ATTEMPTS;
  const retryDelay = options.retry?.delay || DEFAULT_RETRY_DELAY;

  const startTime = Date.now();
  let attempts = 0;

  while (attempts < retryAttempts) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      throw new Error("Lock acquisition timeout");
    }

    // Try to acquire lock
    const lock = await tryAcquireLock(
      resourceId,
      resourceType,
      holder,
      lockType,
      ttl,
      options.metadata
    );

    if (lock) {
      return lock;
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    attempts++;
  }

  throw new Error("Failed to acquire lock after maximum retry attempts");
}

/**
 * Try to acquire lock (single attempt)
 */
async function tryAcquireLock(
  resourceId: string,
  resourceType: string,
  holder: string,
  type: LockType,
  ttl: number,
  metadata?: Record<string, any>
): Promise<DistributedLock | null> {
  // Clean up expired locks first
  await cleanupExpiredLocks();

  // Check for existing locks
  const existingLocks = await prisma.distributedLock.findMany({
    where: {
      resourceId,
      resourceType,
      status: "active",
      expiresAt: { gt: new Date() },
    },
  });

  // For exclusive lock, no other locks can exist
  if (type === "exclusive") {
    if (existingLocks.length > 0) {
      return null; // Can't acquire
    }
  } else {
    // For shared lock, only other shared locks are allowed
    const exclusiveLocks = existingLocks.filter((l) => l.type === "exclusive");
    if (exclusiveLocks.length > 0) {
      return null; // Can't acquire
    }
  }

  // Create lock
  try {
    const lock = await prisma.distributedLock.create({
      data: {
        resourceId,
        resourceType,
        type,
        holder,
        acquiredAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
        status: "active",
        metadata: metadata || {},
      },
    });

    return lock as DistributedLock;
  } catch (error) {
    // Race condition - another process acquired the lock first
    return null;
  }
}

/**
 * Release a lock
 */
export async function releaseLock(lockId: string, holder: string): Promise<void> {
  const lock = await prisma.distributedLock.findUnique({
    where: { id: lockId },
  });

  if (!lock) {
    throw new Error("Lock not found");
  }

  if (lock.holder !== holder) {
    throw new Error("Cannot release lock held by another holder");
  }

  if (lock.status !== "active") {
    throw new Error("Lock is not active");
  }

  await prisma.distributedLock.update({
    where: { id: lockId },
    data: {
      status: "released",
      expiresAt: new Date(), // Mark as immediately expired
    },
  });
}

/**
 * Extend lock TTL
 */
export async function extendLock(
  lockId: string,
  holder: string,
  additionalTtl: number
): Promise<DistributedLock> {
  const lock = await prisma.distributedLock.findUnique({
    where: { id: lockId },
  });

  if (!lock) {
    throw new Error("Lock not found");
  }

  if (lock.holder !== holder) {
    throw new Error("Cannot extend lock held by another holder");
  }

  if (lock.status !== "active") {
    throw new Error("Lock is not active");
  }

  const newExpiresAt = new Date(lock.expiresAt.getTime() + additionalTtl * 1000);

  const updated = await prisma.distributedLock.update({
    where: { id: lockId },
    data: { expiresAt: newExpiresAt },
  });

  return updated as DistributedLock;
}

/**
 * Check if resource is locked
 */
export async function isLocked(resourceId: string, resourceType: string): Promise<boolean> {
  await cleanupExpiredLocks();

  const activeLocks = await prisma.distributedLock.findMany({
    where: {
      resourceId,
      resourceType,
      status: "active",
      expiresAt: { gt: new Date() },
    },
  });

  return activeLocks.length > 0;
}

/**
 * Get active locks for resource
 */
export async function getResourceLocks(
  resourceId: string,
  resourceType: string
): Promise<DistributedLock[]> {
  await cleanupExpiredLocks();

  const locks = await prisma.distributedLock.findMany({
    where: {
      resourceId,
      resourceType,
      status: "active",
      expiresAt: { gt: new Date() },
    },
    orderBy: { acquiredAt: "asc" },
  });

  return locks as DistributedLock[];
}

/**
 * Get all locks held by a holder
 */
export async function getHolderLocks(holder: string): Promise<DistributedLock[]> {
  await cleanupExpiredLocks();

  const locks = await prisma.distributedLock.findMany({
    where: {
      holder,
      status: "active",
      expiresAt: { gt: new Date() },
    },
    orderBy: { acquiredAt: "asc" },
  });

  return locks as DistributedLock[];
}

/**
 * Release all locks held by a holder
 */
export async function releaseAllHolderLocks(holder: string): Promise<number> {
  const result = await prisma.distributedLock.updateMany({
    where: {
      holder,
      status: "active",
    },
    data: {
      status: "released",
      expiresAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Clean up expired locks
 */
async function cleanupExpiredLocks(): Promise<number> {
  const result = await prisma.distributedLock.updateMany({
    where: {
      status: "active",
      expiresAt: { lt: new Date() },
    },
    data: { status: "expired" },
  });

  return result.count;
}

/**
 * Execute function with lock
 */
export async function withLock<T>(
  resourceId: string,
  resourceType: string,
  holder: string,
  fn: () => Promise<T>,
  options: LockOptions = {}
): Promise<T> {
  let lock: DistributedLock | null = null;

  try {
    // Acquire lock
    lock = await acquireLock(resourceId, resourceType, holder, options);

    // Execute function
    const result = await fn();

    return result;
  } finally {
    // Always release lock
    if (lock) {
      try {
        await releaseLock(lock.id, holder);
      } catch (error) {
        console.error("Failed to release lock:", error);
      }
    }
  }
}

/**
 * Detect potential deadlocks
 */
export async function detectDeadlocks(): Promise<{
  deadlocks: Array<{
    holders: string[];
    resources: Array<{ id: string; type: string }>;
  }>;
}> {
  // Simplified deadlock detection
  // In production, would use graph algorithms to detect cycles

  const activeLocks = await prisma.distributedLock.findMany({
    where: {
      status: "active",
      expiresAt: { gt: new Date() },
    },
  });

  // Group by holder
  const locksByHolder = new Map<string, DistributedLock[]>();
  activeLocks.forEach((lock) => {
    const locks = locksByHolder.get(lock.holder) || [];
    locks.push(lock as DistributedLock);
    locksByHolder.set(lock.holder, locks);
  });

  // Simple check: holders with multiple locks on same resource type
  const suspiciousPatterns: any[] = [];

  locksByHolder.forEach((locks, holder) => {
    const resourceTypes = new Set(locks.map((l) => l.resourceType));
    if (locks.length > 5 && resourceTypes.size < 3) {
      suspiciousPatterns.push({
        holders: [holder],
        resources: locks.map((l) => ({ id: l.resourceId, type: l.resourceType })),
      });
    }
  });

  return { deadlocks: suspiciousPatterns };
}

/**
 * Get lock statistics
 */
export async function getLockStats(timeRange: { start: Date; end: Date }): Promise<{
  totalLocks: number;
  activeLocks: number;
  expiredLocks: number;
  releasedLocks: number;
  averageLockDuration: number;
  locksByType: Record<LockType, number>;
  locksByResourceType: Record<string, number>;
  topHolders: Array<{ holder: string; lockCount: number }>;
}> {
  const locks = await prisma.distributedLock.findMany({
    where: {
      acquiredAt: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    },
  });

  const totalLocks = locks.length;
  const activeLocks = locks.filter((l) => l.status === "active").length;
  const expiredLocks = locks.filter((l) => l.status === "expired").length;
  const releasedLocks = locks.filter((l) => l.status === "released").length;

  const durations = locks
    .filter((l) => l.status === "released" || l.status === "expired")
    .map((l) => l.expiresAt.getTime() - l.acquiredAt.getTime());

  const averageLockDuration =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const locksByType: Record<string, number> = {};
  locks.forEach((l) => {
    locksByType[l.type] = (locksByType[l.type] || 0) + 1;
  });

  const locksByResourceType: Record<string, number> = {};
  locks.forEach((l) => {
    locksByResourceType[l.resourceType] = (locksByResourceType[l.resourceType] || 0) + 1;
  });

  const holderCounts = new Map<string, number>();
  locks.forEach((l) => {
    holderCounts.set(l.holder, (holderCounts.get(l.holder) || 0) + 1);
  });

  const topHolders = Array.from(holderCounts.entries())
    .map(([holder, lockCount]) => ({ holder, lockCount }))
    .sort((a, b) => b.lockCount - a.lockCount)
    .slice(0, 10);

  return {
    totalLocks,
    activeLocks,
    expiredLocks,
    releasedLocks,
    averageLockDuration,
    locksByType: locksByType as Record<LockType, number>,
    locksByResourceType,
    topHolders,
  };
}
