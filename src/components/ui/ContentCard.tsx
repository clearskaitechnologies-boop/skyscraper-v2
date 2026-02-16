import { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  ContentCard — Unified card container for all page sections         */
/*  Replaces raw <div> cards with CSS variable borders throughout.     */
/*                                                                      */
/*  Matches the Financial Overview "gold standard":                     */
/*    - rounded-2xl                                                     */
/*    - soft shadow                                                     */
/*    - subtle border                                                   */
/*    - glass backdrop                                                  */
/*    - consistent p-6 padding                                          */
/* ------------------------------------------------------------------ */

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  /** Optional header title rendered inside a top border section */
  header?: string;
  /** Remove padding (useful for tables that handle their own) */
  noPadding?: boolean;
}

export function ContentCard({ children, className, header, noPadding }: ContentCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "border border-slate-200/60 dark:border-slate-700/50",
        "bg-white/80 dark:bg-slate-900/60",
        "shadow-sm backdrop-blur-xl",
        "transition-shadow hover:shadow-md",
        className
      )}
    >
      {header && (
        <div className="border-b border-slate-200/60 px-6 py-4 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{header}</h2>
        </div>
      )}
      {!noPadding && !header ? <div className="p-6">{children}</div> : children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DataTable — Wrapper for table elements inside ContentCard          */
/* ------------------------------------------------------------------ */

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

/** Scrollable table wrapper. Place inside <ContentCard noPadding>. */
export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

/** Standardized table head row */
export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-slate-200/40 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
        {children}
      </tr>
    </thead>
  );
}

/** Standardized table body with dividers */
export function DataTableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/30">{children}</tbody>
  );
}

/** Table header cell */
export function Th({
  children,
  className,
  align,
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={cn(
        "px-6 py-3",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

/** Table data cell */
export function Td({
  children,
  className,
  align,
  mono,
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-6 py-4 text-slate-700 dark:text-slate-300",
        align === "center" && "text-center",
        align === "right" && "text-right",
        mono && "font-mono",
        className
      )}
    >
      {children}
    </td>
  );
}

/** Empty state row for tables */
export function EmptyRow({
  colSpan,
  message = "No data yet.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-500">
        {message}
      </td>
    </tr>
  );
}
