export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { getCurrentUserRole, type Permission,type TeamRole } from "@/lib/auth/rbac";

// Permission matrix matching rbac.ts
const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  admin: [
    "claims:create", "claims:edit", "claims:delete", "claims:view",
    "vendors:create", "vendors:edit", "vendors:delete", "vendors:view",
    "products:create", "products:edit", "products:delete", "products:view",
    "team:invite", "team:edit", "team:remove", "team:view",
    "billing:manage", "billing:view",
    "integrations:manage", "integrations:view",
    "reports:create", "reports:view",
    "analytics:view",
  ],
  manager: [
    "claims:create", "claims:edit", "claims:view",
    "vendors:create", "vendors:edit", "vendors:view",
    "products:create", "products:edit", "products:view",
    "team:view",
    "billing:view",
    "integrations:view",
    "reports:create", "reports:view",
    "analytics:view",
  ],
  member: [
    "claims:create", "claims:edit", "claims:view",
    "vendors:view",
    "products:view",
    "team:view",
    "reports:create", "reports:view",
  ],
  viewer: [
    "claims:view",
    "vendors:view",
    "products:view",
    "team:view",
    "reports:view",
  ],
};

/**
 * GET /api/permissions
 * Returns current user's role and permissions
 */
export async function GET() {
  try {
    const userRole = await getCurrentUserRole();
    
    if (!userRole) {
      return NextResponse.json({
        role: null,
        permissions: [],
      });
    }

    const permissions = ROLE_PERMISSIONS[userRole.role];

    return NextResponse.json({
      role: userRole.role,
      permissions,
    });
  } catch (error) {
    logger.error("Failed to fetch permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
