"use client";
import React from "react";

interface WorkspaceShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  statusMeta?: React.ReactNode; // e.g. data timestamp
}

export function WorkspaceShell({
  title,
  subtitle,
  actions,
  children,
  statusMeta,
}: WorkspaceShellProps) {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-3xl font-bold text-transparent">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-[color:var(--muted)]">{subtitle}</p>}
          {statusMeta && <div className="text-xs text-[color:var(--muted)]">{statusMeta}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

export default WorkspaceShell;
