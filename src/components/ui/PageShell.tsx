import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  emoji?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  gradient?: "blue" | "purple" | "emerald" | "orange";
}

const gradientClasses = {
  blue: "from-blue-600 to-indigo-600",
  purple: "from-purple-600 to-pink-600",
  emerald: "from-emerald-600 to-teal-600",
  orange: "from-orange-600 to-red-600",
};

export default function PageShell({
  children,
  title,
  subtitle,
  emoji,
  breadcrumbs,
  actions,
  gradient = "blue",
}: PageShellProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-blue-600">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-900">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            {emoji && <span className="text-2xl">{emoji}</span>}
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>

      {/* Content */}
      <div className="space-y-8">{children}</div>
    </div>
  );
}
