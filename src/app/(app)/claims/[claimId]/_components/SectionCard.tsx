// src/app/(app)/claims/[claimId]/_components/SectionCard.tsx
import { Pencil } from "lucide-react";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  editable?: boolean;
}

export default function SectionCard({
  title,
  action,
  children,
  className = "",
  editable = false,
}: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {editable && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Pencil className="h-3 w-3" />
              Click to edit
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
