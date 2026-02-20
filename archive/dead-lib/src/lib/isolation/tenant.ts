/**
 * TASK 134: TENANT ISOLATION
 *
 * Complete data isolation between tenants with row-level security.
 */

import prisma from "@/lib/prisma";

export async function validateTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      organization: { tenantId },
    },
  });

  return !!membership;
}

export async function getTenantData<T>(
  tenantId: string,
  model: string,
  filters?: any
): Promise<T[]> {
  const where = { ...filters, tenantId };

  // @ts-ignore
  const data = await prisma[model].findMany({ where });
  return data as T[];
}

export async function createTenantData<T>(tenantId: string, model: string, data: any): Promise<T> {
  // @ts-ignore
  const result = await prisma[model].create({
    data: { ...data, tenantId },
  });
  return result as T;
}

export async function enforceIsolation(query: any, tenantId: string): any {
  return {
    ...query,
    where: {
      ...query.where,
      tenantId,
    },
  };
}

export async function auditCrossTenanAccess(
  userId: string,
  attemptedTenantId: string,
  userTenantId: string
): Promise<void> {
  if (attemptedTenantId !== userTenantId) {
    await prisma.auditLog.create({
      data: {
        userId,
        tenantId: userTenantId,
        action: "SECURITY_EVENT",
        severity: "CRITICAL",
        details: {
          type: "CROSS_TENANT_ACCESS_ATTEMPT",
          attemptedTenantId,
        } as any,
      } as any,
    });
  }
}
