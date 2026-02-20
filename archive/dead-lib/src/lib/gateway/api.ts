/**
 * TASK 133: API GATEWAY
 *
 * API gateway with routing, rate limiting, and authentication.
 */

import prisma from "@/lib/prisma";

export interface APIRoute {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  upstream: string;
  rateLimit?: number;
  requiresAuth: boolean;
  allowedRoles?: string[];
}

export async function registerRoute(route: Omit<APIRoute, "id">): Promise<string> {
  const apiRoute = await prisma.apiRoute.create({
    data: route as any,
  });
  return apiRoute.id;
}

export async function getRoute(path: string, method: string): Promise<APIRoute | null> {
  const route = await prisma.apiRoute.findFirst({
    where: { path, method },
  });
  return route as any;
}

export async function proxyRequest(route: APIRoute, request: any): Promise<any> {
  // TODO: Implement actual proxy logic
  const response = await fetch(route.upstream, {
    method: route.method,
    headers: request.headers,
    body: request.body,
  });
  return response.json();
}

export async function checkRateLimit(tenantId: string, route: APIRoute): Promise<boolean> {
  if (!route.rateLimit) return true;

  const count = await prisma.apiLog.count({
    where: {
      tenantId,
      endpoint: route.path,
      timestamp: { gte: new Date(Date.now() - 60000) },
    },
  });

  return count < route.rateLimit;
}
