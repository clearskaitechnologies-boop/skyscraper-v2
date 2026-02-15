// RBAC Hook - Client-side role checking
// Phase G Priority 3: Complete RBAC Implementation
// Usage: const { role, can } = useRBAC(); if (can("claims:delete")) { ... }

"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export type Role = "OWNER" | "ADMIN" | "PM" | "FIELD_TECH" | "OFFICE_STAFF" | "CLIENT";
export type Permission =
  | "claims:create"
  | "claims:edit"
  | "claims:delete"
  | "claims:view"
  | "supplements:create"
  | "supplements:approve"
  | "supplements:view"
  | "reports:create"
  | "reports:view"
  | "files:upload"
  | "files:delete"
  | "team:invite"
  | "team:manage"
  | "billing:view"
  | "billing:manage"
  | "org:settings";

const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    "claims:create",
    "claims:edit",
    "claims:delete",
    "claims:view",
    "supplements:create",
    "supplements:approve",
    "supplements:view",
    "reports:create",
    "reports:view",
    "files:upload",
    "files:delete",
    "team:invite",
    "team:manage",
    "billing:view",
    "billing:manage",
    "org:settings",
  ],
  ADMIN: [
    "claims:create",
    "claims:edit",
    "claims:delete",
    "claims:view",
    "supplements:create",
    "supplements:approve",
    "supplements:view",
    "reports:create",
    "reports:view",
    "files:upload",
    "files:delete",
    "team:invite",
    "team:manage",
  ],
  PM: [
    "claims:create",
    "claims:edit",
    "claims:view",
    "supplements:create",
    "supplements:view",
    "reports:create",
    "reports:view",
    "files:upload",
    "files:delete",
  ],
  FIELD_TECH: ["claims:view", "supplements:view", "reports:view", "files:upload"],
  OFFICE_STAFF: ["claims:view", "supplements:view", "reports:view", "files:upload"],
  CLIENT: ["claims:view", "files:upload"],
};

interface RBACContext {
  role: Role | null;
  loading: boolean;
  can: (permission: Permission) => boolean;
  isMinimumRole: (minimumRole: Role) => boolean;
}

export function useRBAC(): RBACContext {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/rbac/me");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("[useRBAC] Error fetching role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, isLoaded]);

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  };

  const roleHierarchy: Record<Role, number> = {
    OWNER: 100,
    ADMIN: 80,
    PM: 60,
    FIELD_TECH: 40,
    OFFICE_STAFF: 20,
    CLIENT: 10,
  };

  const isMinimumRole = (minimumRole: Role): boolean => {
    if (!role) return false;
    return roleHierarchy[role] >= roleHierarchy[minimumRole];
  };

  return {
    role,
    loading,
    can,
    isMinimumRole,
  };
}
