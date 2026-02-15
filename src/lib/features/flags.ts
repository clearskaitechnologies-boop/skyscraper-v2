/**
 * TASK 137: FEATURE FLAGS
 *
 * Dynamic feature toggling with gradual rollout.
 */

import prisma from "@/lib/prisma";

export type RolloutStrategy = "ALL" | "PERCENTAGE" | "WHITELIST";

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  strategy: RolloutStrategy;
  percentage?: number;
  whitelist?: string[];
  createdAt: Date;
}

export async function createFeatureFlag(data: {
  name: string;
  description?: string;
  enabled: boolean;
  strategy: RolloutStrategy;
  percentage?: number;
  whitelist?: string[];
}): Promise<string> {
  const flag = await prisma.featureFlag.create({
    data: data as any,
  });
  return flag.id;
}

export async function isFeatureEnabled(featureName: string, tenantId: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({
    where: { name: featureName },
  });

  if (!flag || !flag.enabled) return false;

  switch (flag.strategy) {
    case "ALL":
      return true;

    case "PERCENTAGE":
      const hash = hashTenantId(tenantId);
      return hash < (flag.percentage || 0);

    case "WHITELIST":
      return ((flag.whitelist as string[]) || []).includes(tenantId);

    default:
      return false;
  }
}

function hashTenantId(tenantId: string): number {
  let hash = 0;
  for (let i = 0; i < tenantId.length; i++) {
    hash = (hash << 5) - hash + tenantId.charCodeAt(i);
  }
  return Math.abs(hash % 100);
}

export async function getAllFlags(): Promise<FeatureFlag[]> {
  const flags = await prisma.featureFlag.findMany();
  return flags as any;
}

export async function updateFlag(
  flagId: string,
  updates: Partial<Omit<FeatureFlag, "id" | "createdAt">>
): Promise<void> {
  await prisma.featureFlag.update({
    where: { id: flagId },
    data: updates as any,
  });
}

export async function deleteFlag(flagId: string): Promise<void> {
  await prisma.featureFlag.delete({ where: { id: flagId } });
}
