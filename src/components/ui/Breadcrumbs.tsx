import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

/**
 * Enhanced Breadcrumbs component for showing page hierarchy
 * @example
 * <Breadcrumbs items={[
 *   { label: "Claims", href: "/claims" },
 *   { label: "Claim #12345", href: "/claims/abc" },
 *   { label: "Edit" }
 * ]} />
 */
export function Breadcrumbs({ items, showHome = true, className = "" }: BreadcrumbsProps) {
  const allItems = showHome ? [{ label: "Home", href: "/dashboard" }, ...items] : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex items-center gap-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </li>
              )}

              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    {isHome && <Home className="h-4 w-4" />}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={`flex items-center gap-1.5 ${
                      isLast ? "font-semibold text-foreground" : ""
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {isHome && <Home className="h-4 w-4" />}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
