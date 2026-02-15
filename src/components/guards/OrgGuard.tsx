"use client";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

interface OrgGuardProps {
  orgId?: string | null;
  children: ReactNode;
  fallback?: ReactNode;
}

export function OrgGuard({ orgId, children, fallback }: OrgGuardProps) {
  const { userId } = useAuth();
  if (!userId) return <div className="p-4 text-sm">Authentication required.</div>;
  if (!orgId) return <>{fallback || <div className="p-4 text-sm">Organization context missing.</div>}</>;
  return <>{children}</>;
}
