// RBAC Guard Component - Hide/show UI based on permissions
// Phase G Priority 3: Complete RBAC Implementation
// Usage: <RBACGuard permission="claims:delete"><Button>Delete</Button></RBACGuard>

"use client";

import { ReactNode } from "react";

import { type Permission, type Role,useRBAC } from "@/hooks/useRBAC";

interface RBACGuardProps {
  children: ReactNode;
  permission?: Permission;
  minimumRole?: Role;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function RBACGuard({
  children,
  permission,
  minimumRole,
  fallback = null,
  loadingFallback = null,
}: RBACGuardProps) {
  const { can, isMinimumRole, loading } = useRBAC();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  // Check permission if specified
  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  // Check minimum role if specified
  if (minimumRole && !isMinimumRole(minimumRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
