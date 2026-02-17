/**
 * ============================================================================
 * Role Presets — Canonical Enterprise Role Definitions
 * ============================================================================
 *
 * Single source of truth for all role types, permissions, and preset configs.
 * Consolidates the 3 competing systems:
 *   - src/lib/security/roles.ts  (Clerk-based, flat types)
 *   - src/lib/auth/permissions.ts (DB-backed rank hierarchy)
 *   - src/lib/auth/rbac.ts       (permission-based with team_members)
 *
 * USAGE:
 *   import { ROLE_PRESETS, getRolePreset, getRoleLabel } from "@/lib/auth/role-presets";
 *
 *   // Get all available roles for a dropdown
 *   const roles = ROLE_PRESETS;
 *
 *   // Get a specific role's config
 *   const admin = getRolePreset("admin");
 *   admin.label // "Admin"
 *   admin.rank  // 5
 *   admin.clerkRole // "org:admin"
 *
 * ============================================================================
 */

export interface RolePreset {
  /** Internal key — stored in DB */
  key: string;
  /** Display label */
  label: string;
  /** Short description for UI */
  description: string;
  /** Numeric rank for hierarchy comparisons (higher = more access) */
  rank: number;
  /** Maps to Clerk org membership role */
  clerkRole: "org:admin" | "org:member";
  /** What this role can do — high-level capabilities */
  capabilities: string[];
  /** Color for badges */
  badgeColor: string;
  /** Icon name (Lucide) */
  icon: string;
}

/**
 * All available role presets, ordered by rank (highest first).
 * This is the CANONICAL list — all other role systems should reference this.
 */
export const ROLE_PRESETS: RolePreset[] = [
  {
    key: "owner",
    label: "Owner",
    description: "Full platform access. Manages billing, team, and all settings.",
    rank: 6,
    clerkRole: "org:admin",
    capabilities: [
      "billing:manage",
      "team:manage",
      "team:invite",
      "settings:manage",
      "claims:full",
      "reports:full",
      "finance:full",
      "vendors:full",
    ],
    badgeColor: "bg-purple-100 text-purple-700",
    icon: "Crown",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Full access except ownership transfer. Manages team and settings.",
    rank: 5,
    clerkRole: "org:admin",
    capabilities: [
      "team:manage",
      "team:invite",
      "settings:manage",
      "claims:full",
      "reports:full",
      "finance:view",
      "vendors:full",
    ],
    badgeColor: "bg-red-100 text-red-700",
    icon: "Shield",
  },
  {
    key: "manager",
    label: "Manager",
    description: "Manages projects, claims, and team workflows. Cannot modify billing.",
    rank: 4,
    clerkRole: "org:admin",
    capabilities: ["team:invite", "claims:full", "reports:full", "finance:view", "vendors:manage"],
    badgeColor: "bg-blue-100 text-blue-700",
    icon: "Users",
  },
  {
    key: "project_manager",
    label: "Project Manager",
    description: "Oversees assigned projects and claims. Can create reports and proposals.",
    rank: 3,
    clerkRole: "org:member",
    capabilities: ["claims:assigned", "reports:create", "vendors:view", "finance:view"],
    badgeColor: "bg-cyan-100 text-cyan-700",
    icon: "ClipboardList",
  },
  {
    key: "sales_rep",
    label: "Sales Rep",
    description: "Creates leads and claims. Can view pipeline and proposals.",
    rank: 2,
    clerkRole: "org:member",
    capabilities: ["claims:create", "claims:view", "reports:view", "vendors:view"],
    badgeColor: "bg-green-100 text-green-700",
    icon: "TrendingUp",
  },
  {
    key: "field_tech",
    label: "Field Technician",
    description: "Updates job status and uploads photos from the field.",
    rank: 2,
    clerkRole: "org:member",
    capabilities: ["claims:assigned", "photos:upload", "vendors:view"],
    badgeColor: "bg-orange-100 text-orange-700",
    icon: "Wrench",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Views financial reports, invoices, and billing. Read-only for claims.",
    rank: 2,
    clerkRole: "org:member",
    capabilities: ["finance:full", "claims:view", "reports:view"],
    badgeColor: "bg-emerald-100 text-emerald-700",
    icon: "DollarSign",
  },
  {
    key: "member",
    label: "Member",
    description: "Standard team member. Can view and interact with assigned work.",
    rank: 1,
    clerkRole: "org:member",
    capabilities: ["claims:view", "reports:view", "vendors:view"],
    badgeColor: "bg-gray-100 text-gray-700",
    icon: "User",
  },
  {
    key: "viewer",
    label: "Viewer",
    description: "Read-only access. Can view dashboards and reports but cannot modify anything.",
    rank: 0,
    clerkRole: "org:member",
    capabilities: ["claims:view", "reports:view"],
    badgeColor: "bg-slate-100 text-slate-500",
    icon: "Eye",
  },
];

/**
 * Lookup a role preset by key.
 * Falls back to "member" if the key is not recognized.
 */
export function getRolePreset(key: string): RolePreset {
  const normalized = key.toLowerCase().trim();
  return (
    ROLE_PRESETS.find((r) => r.key === normalized) || ROLE_PRESETS.find((r) => r.key === "member")!
  );
}

/**
 * Get the display label for a role key.
 */
export function getRoleLabel(key: string): string {
  return getRolePreset(key).label;
}

/**
 * Check if role A has equal or higher rank than role B.
 */
export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const user = getRolePreset(userRole);
  const required = getRolePreset(requiredRole);
  return user.rank >= required.rank;
}

/**
 * Get roles that a user with the given role is allowed to assign.
 * Users can only assign roles with equal or lower rank.
 */
export function getAssignableRoles(userRole: string): RolePreset[] {
  const user = getRolePreset(userRole);
  return ROLE_PRESETS.filter((r) => r.rank <= user.rank);
}

/**
 * Convert a role key to the Clerk org membership role.
 */
export function toClerkRole(key: string): "org:admin" | "org:member" {
  return getRolePreset(key).clerkRole;
}

/**
 * Role keys as a union type for TypeScript consumers.
 */
export type RoleKey =
  | "owner"
  | "admin"
  | "manager"
  | "project_manager"
  | "sales_rep"
  | "field_tech"
  | "finance"
  | "member"
  | "viewer";
