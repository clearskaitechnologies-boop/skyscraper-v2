/**
 * TASK 139: HEALTH MONITORING
 *
 * System health checks and status monitoring.
 */

import prisma from "@/lib/prisma";

export type HealthStatus = "HEALTHY" | "DEGRADED" | "DOWN";

export interface HealthCheck {
  service: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
  lastChecked: Date;
}

export async function checkDatabaseHealth(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      service: "database",
      status: "HEALTHY",
      responseTime: Date.now() - start,
      lastChecked: new Date(),
    };
  } catch (error: any) {
    return {
      service: "database",
      status: "DOWN",
      responseTime: Date.now() - start,
      message: error.message,
      lastChecked: new Date(),
    };
  }
}

export async function checkStorageHealth(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // TODO: Check storage provider
    return {
      service: "storage",
      status: "HEALTHY",
      responseTime: Date.now() - start,
      lastChecked: new Date(),
    };
  } catch (error: any) {
    return {
      service: "storage",
      status: "DOWN",
      responseTime: Date.now() - start,
      message: error.message,
      lastChecked: new Date(),
    };
  }
}

export async function checkAPIHealth(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const recentErrors = await prisma.apiLog.count({
      where: {
        statusCode: { gte: 500 },
        timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    const status: HealthStatus = recentErrors > 10 ? "DEGRADED" : "HEALTHY";

    return {
      service: "api",
      status,
      responseTime: Date.now() - start,
      message: recentErrors > 10 ? `${recentErrors} errors in last 5 minutes` : undefined,
      lastChecked: new Date(),
    };
  } catch (error: any) {
    return {
      service: "api",
      status: "DOWN",
      responseTime: Date.now() - start,
      message: error.message,
      lastChecked: new Date(),
    };
  }
}

export async function getSystemHealth(): Promise<{
  overall: HealthStatus;
  checks: HealthCheck[];
}> {
  const checks = await Promise.all([checkDatabaseHealth(), checkStorageHealth(), checkAPIHealth()]);

  const downCount = checks.filter((c) => c.status === "DOWN").length;
  const degradedCount = checks.filter((c) => c.status === "DEGRADED").length;

  let overall: HealthStatus = "HEALTHY";
  if (downCount > 0) overall = "DOWN";
  else if (degradedCount > 0) overall = "DEGRADED";

  return { overall, checks };
}

export async function recordHealthCheck(check: HealthCheck): Promise<void> {
  await prisma.healthCheck.create({
    data: check as any,
  });
}
