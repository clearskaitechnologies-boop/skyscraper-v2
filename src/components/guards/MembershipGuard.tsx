"use client";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

interface MembershipGuardProps {
  hasMembership?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function MembershipGuard({ hasMembership, children, fallback }: MembershipGuardProps) {
  const { userId } = useAuth();
  if (!userId) return <div className="p-4 text-sm">Authentication required.</div>;
  if (!hasMembership) return <>{fallback || <div className="p-4 text-sm">Membership required.</div>}</>;
  return <>{children}</>;
}
