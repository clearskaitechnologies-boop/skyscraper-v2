/**
 * TASK 154: LOAD BALANCING
 *
 * Load balancer with multiple algorithms and health checks.
 */

import prisma from "@/lib/prisma";

export type LoadBalancingAlgorithm =
  | "ROUND_ROBIN"
  | "LEAST_CONNECTIONS"
  | "IP_HASH"
  | "WEIGHTED_ROUND_ROBIN";

export interface Backend {
  id: string;
  host: string;
  port: number;
  weight: number;
  healthy: boolean;
  activeConnections: number;
  totalRequests: number;
}

export interface LoadBalancer {
  id: string;
  name: string;
  algorithm: LoadBalancingAlgorithm;
  backends: Backend[];
  healthCheckInterval: number;
  healthCheckPath: string;
}

let roundRobinIndex = 0;

/**
 * Create load balancer
 */
export async function createLoadBalancer(data: {
  name: string;
  algorithm: LoadBalancingAlgorithm;
  backends: Omit<Backend, "id" | "healthy" | "activeConnections" | "totalRequests">[];
  healthCheckInterval?: number;
  healthCheckPath?: string;
}): Promise<string> {
  const lb = await prisma.loadBalancer.create({
    data: {
      name: data.name,
      algorithm: data.algorithm,
      backends: data.backends.map((b) => ({
        ...b,
        id: `backend_${Math.random().toString(36).substring(7)}`,
        healthy: true,
        activeConnections: 0,
        totalRequests: 0,
      })) as any,
      healthCheckInterval: data.healthCheckInterval || 30,
      healthCheckPath: data.healthCheckPath || "/health",
    } as any,
  });

  // Start health checking
  startHealthChecks(lb.id);

  return lb.id;
}

/**
 * Select backend based on algorithm
 */
export async function selectBackend(
  loadBalancerId: string,
  clientIp?: string
): Promise<Backend | null> {
  const lb = await prisma.loadBalancer.findUnique({
    where: { id: loadBalancerId },
  });

  if (!lb) return null;

  const backends = (lb.backends as Backend[]).filter((b) => b.healthy);

  if (backends.length === 0) return null;

  switch (lb.algorithm) {
    case "ROUND_ROBIN":
      return selectRoundRobin(backends);

    case "LEAST_CONNECTIONS":
      return selectLeastConnections(backends);

    case "IP_HASH":
      return selectIpHash(backends, clientIp || "");

    case "WEIGHTED_ROUND_ROBIN":
      return selectWeightedRoundRobin(backends);

    default:
      return backends[0];
  }
}

/**
 * Round robin selection
 */
function selectRoundRobin(backends: Backend[]): Backend {
  const backend = backends[roundRobinIndex % backends.length];
  roundRobinIndex++;
  return backend;
}

/**
 * Least connections selection
 */
function selectLeastConnections(backends: Backend[]): Backend {
  return backends.reduce((min, backend) =>
    backend.activeConnections < min.activeConnections ? backend : min
  );
}

/**
 * IP hash selection
 */
function selectIpHash(backends: Backend[], clientIp: string): Backend {
  let hash = 0;
  for (let i = 0; i < clientIp.length; i++) {
    hash = (hash << 5) - hash + clientIp.charCodeAt(i);
  }
  const index = Math.abs(hash) % backends.length;
  return backends[index];
}

/**
 * Weighted round robin selection
 */
function selectWeightedRoundRobin(backends: Backend[]): Backend {
  const totalWeight = backends.reduce((sum, b) => sum + b.weight, 0);
  let random = Math.random() * totalWeight;

  for (const backend of backends) {
    random -= backend.weight;
    if (random <= 0) {
      return backend;
    }
  }

  return backends[0];
}

/**
 * Track connection start
 */
export async function trackConnectionStart(
  loadBalancerId: string,
  backendId: string
): Promise<void> {
  const lb = await prisma.loadBalancer.findUnique({
    where: { id: loadBalancerId },
  });

  if (!lb) return;

  const backends = (lb.backends as Backend[]).map((b) => {
    if (b.id === backendId) {
      return {
        ...b,
        activeConnections: b.activeConnections + 1,
        totalRequests: b.totalRequests + 1,
      };
    }
    return b;
  });

  await prisma.loadBalancer.update({
    where: { id: loadBalancerId },
    data: { backends: backends as any } as any,
  });
}

/**
 * Track connection end
 */
export async function trackConnectionEnd(loadBalancerId: string, backendId: string): Promise<void> {
  const lb = await prisma.loadBalancer.findUnique({
    where: { id: loadBalancerId },
  });

  if (!lb) return;

  const backends = (lb.backends as Backend[]).map((b) => {
    if (b.id === backendId) {
      return {
        ...b,
        activeConnections: Math.max(0, b.activeConnections - 1),
      };
    }
    return b;
  });

  await prisma.loadBalancer.update({
    where: { id: loadBalancerId },
    data: { backends: backends as any } as any,
  });
}

/**
 * Start health checks
 */
function startHealthChecks(loadBalancerId: string): void {
  const checkHealth = async () => {
    const lb = await prisma.loadBalancer.findUnique({
      where: { id: loadBalancerId },
    });

    if (!lb) return;

    const backends = lb.backends as Backend[];
    const updatedBackends = await Promise.all(
      backends.map(async (backend) => {
        const healthy = await checkBackendHealth(backend, lb.healthCheckPath);
        return { ...backend, healthy };
      })
    );

    await prisma.loadBalancer.update({
      where: { id: loadBalancerId },
      data: { backends: updatedBackends as any } as any,
    });
  };

  // Initial check
  checkHealth();

  // Periodic checks
  setInterval(checkHealth, 30000); // Every 30 seconds
}

/**
 * Check backend health
 */
async function checkBackendHealth(backend: Backend, healthCheckPath: string): Promise<boolean> {
  try {
    const response = await fetch(`http://${backend.host}:${backend.port}${healthCheckPath}`, {
      method: "GET",
      timeout: 3000,
    } as any);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get load balancer stats
 */
export async function getLoadBalancerStats(loadBalancerId: string): Promise<{
  totalBackends: number;
  healthyBackends: number;
  totalRequests: number;
  activeConnections: number;
}> {
  const lb = await prisma.loadBalancer.findUnique({
    where: { id: loadBalancerId },
  });

  if (!lb) {
    return { totalBackends: 0, healthyBackends: 0, totalRequests: 0, activeConnections: 0 };
  }

  const backends = lb.backends as Backend[];

  return {
    totalBackends: backends.length,
    healthyBackends: backends.filter((b) => b.healthy).length,
    totalRequests: backends.reduce((sum, b) => sum + b.totalRequests, 0),
    activeConnections: backends.reduce((sum, b) => sum + b.activeConnections, 0),
  };
}
