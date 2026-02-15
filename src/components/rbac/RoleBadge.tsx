// Role Badge Component - Display user role with icon and color
// Phase G Priority 3: Complete RBAC Implementation
// Usage: <RoleBadge role="ADMIN" />

import { Briefcase, Crown, FileText, HardHat, Shield, User } from "lucide-react";

import { type Role } from "@/lib/rbac";

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md" | "lg";
}

const roleConfig: Record<Role, { icon: any; color: string; label: string }> = {
  OWNER: { icon: Crown, color: "purple", label: "Owner" },
  ADMIN: { icon: Shield, color: "blue", label: "Admin" },
  PM: { icon: Briefcase, color: "green", label: "Project Manager" },
  FIELD_TECH: { icon: HardHat, color: "orange", label: "Field Tech" },
  OFFICE_STAFF: { icon: FileText, color: "slate", label: "Office Staff" },
  CLIENT: { icon: User, color: "gray", label: "Client" },
};

const sizeClasses = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]} bg-${config.color}-100 text-${config.color}-700 dark:bg-${config.color}-900/30 dark:text-${config.color}-300`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  );
}
