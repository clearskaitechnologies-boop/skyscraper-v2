// Access Control List helpers - stub for Clerk integration
export type Role = "admin" | "manager" | "member";
export type Plan = "solo" | "business" | "enterprise";

/**
 * Get user role from Clerk metadata
 * TODO: Wire to actual Clerk user.publicMetadata.role
 */
export function userRole(): Role {
  // Stub - replace with Clerk auth check
  return "manager";
}

/**
 * Get user plan from Clerk metadata
 * TODO: Wire to actual Clerk org.publicMetadata.plan
 */
export function userPlan(): Plan {
  // Stub - replace with Clerk org check
  return "business";
}

/**
 * Check if user is allowed based on roles and plans
 * @param roles - Required roles (any match)
 * @param plans - Required plans (any match)
 * @returns true if user meets requirements
 */
export function allowed(roles?: Role[], plans?: Plan[]): boolean {
  const r = userRole();
  const p = userPlan();
  const roleOk = !roles?.length || roles.includes(r);
  const planOk = !plans?.length || plans.includes(p);
  return roleOk && planOk;
}
