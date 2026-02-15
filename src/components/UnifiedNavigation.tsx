"use client";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CORE_NAV } from "@/config/nav";
import { useUserPrefs } from "@/hooks/useUserPrefs";
import { allowed } from "@/lib/acl";
import { cx } from "@/lib/ui";

export default function UnifiedNavigation() {
  const pathname = usePathname() ?? "/";
  const { sidebarCollapsed, setSidebarCollapsed } = useUserPrefs();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["/reports"]));

  const items = useMemo(() => CORE_NAV.filter((i) => allowed(i.roles as any, i.plans as any)), []);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {items.map((it) => {
        const active = it.match ? it.match.test(pathname) : pathname === it.href;
        const hasChildren = it.children && it.children.length > 0;
        const isExpanded = expandedItems.has(it.href);

        return (
          <div key={it.href}>
            {hasChildren ? (
              // Dropdown parent item
              <>
                <button
                  onClick={() => toggleExpanded(it.href)}
                  className={cx(
                    "group mx-2 my-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    "motion-safe:hover:scale-[1.02] motion-reduce:transition-none",
                    active
                      ? "border border-[color:var(--primary)] bg-[var(--primary-weak)] text-[color:var(--primary)]"
                      : "text-[color:var(--muted)] hover:bg-[var(--surface-2)]"
                  )}
                  title={it.label}
                >
                  <span
                    className={cx(
                      "flex-1 truncate text-left",
                      sidebarCollapsed ? "sr-only md:block" : "block"
                    )}
                  >
                    {it.label}
                  </span>
                  {!sidebarCollapsed &&
                    (isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                  {sidebarCollapsed && <span className="text-[10px] md:hidden">{it.label[0]}</span>}
                </button>

                {/* Dropdown children */}
                {isExpanded && !sidebarCollapsed && (
                  <div className="ml-4 space-y-0.5">
                    {it.children!.map((child) => {
                      const childActive = child.match
                        ? child.match.test(pathname)
                        : pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cx(
                            "group mx-2 my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-[var(--primary-weak)] text-[color:var(--primary)]"
                              : "text-[color:var(--muted)] hover:bg-[var(--surface-2)]"
                          )}
                          title={child.label}
                          aria-current={childActive ? "page" : undefined}
                        >
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // Regular link
              <Link
                href={it.href}
                onClick={onNavigate}
                className={cx(
                  "group mx-2 my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  "motion-safe:hover:scale-[1.02] motion-reduce:transition-none",
                  active
                    ? "border border-[color:var(--primary)] bg-[var(--primary-weak)] text-[color:var(--primary)]"
                    : "text-[color:var(--muted)] hover:bg-[var(--surface-2)]"
                )}
                title={it.label}
                aria-current={active ? "page" : undefined}
              >
                <span className={cx("truncate", sidebarCollapsed ? "sr-only md:block" : "block")}>
                  {it.label}
                </span>
                {sidebarCollapsed && <span className="text-[10px] md:hidden">{it.label[0]}</span>}
              </Link>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed left-4 top-4 z-50 rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-2 backdrop-blur md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={20} className="text-[color:var(--text)]" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 border-r border-[color:var(--border)] bg-[var(--surface-1)] p-0"
        >
          <div className="flex h-14 items-center justify-between border-b border-[color:var(--border)] px-4">
            <span className="text-xs text-[color:var(--muted)]">Navigation</span>
          </div>
          <nav className="py-2">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={cx(
          "sticky top-0 z-40 hidden h-screen border-r border-[color:var(--border)] bg-[var(--surface-1)] backdrop-blur md:block",
          "transition-all",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between px-2">
          <button
            className="rounded border border-[color:var(--border)] px-2 py-1 text-xs text-[color:var(--muted)] transition-colors hover:bg-[var(--surface-2)]"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? "≫" : "≪"}
          </button>
          {!sidebarCollapsed && (
            <span className="text-xs font-semibold text-[color:var(--primary)]">SkaiScraper</span>
          )}
        </div>
        <nav className="py-2">
          <NavLinks />
        </nav>
      </aside>
    </>
  );
}
