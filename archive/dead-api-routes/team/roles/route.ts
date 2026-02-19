/**
 * GET /api/team/roles
 *
 * Returns the list of available role presets for the organization.
 * Used by the invite modal and CSV import UI to populate role dropdowns.
 *
 * If `assignable` query param is true, only returns roles the current
 * user is allowed to assign (based on their own role rank).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { getAssignableRoles, ROLE_PRESETS } from "@/lib/auth/role-presets";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(async (req: NextRequest, { role }) => {
  const url = new URL(req.url);
  const assignableOnly = url.searchParams.get("assignable") === "true";

  const roles = assignableOnly ? getAssignableRoles(role) : ROLE_PRESETS;

  return NextResponse.json({
    roles: roles.map((r) => ({
      key: r.key,
      label: r.label,
      description: r.description,
      badgeColor: r.badgeColor,
      icon: r.icon,
      capabilities: r.capabilities,
    })),
  });
});
