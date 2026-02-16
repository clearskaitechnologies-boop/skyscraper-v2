/**
 * WorkspaceShell — Layout wrapper
 *
 * Provides a standard page shell for workspace-style pages.
 */

import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function WorkspaceShell({ children, className }: WorkspaceShellProps) {
  return (
    <div className={cn("mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
