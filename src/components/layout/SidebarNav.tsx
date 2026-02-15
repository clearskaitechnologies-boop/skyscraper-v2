"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CORE_NAV, type NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

// Derive sidebar items from single source of truth CORE_NAV
function resolveNavItems(): NavItem[] {
  return [...CORE_NAV];
}

export function SidebarNav() {
  const pathname = usePathname();
  const items = resolveNavItems();

  return (
    <nav className="flex flex-col gap-1 py-4">
      {items.map((item) => {
        const active = item.match
          ? item.match.test(pathname ?? "")
          : pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              active ? "bg-sky-50 font-medium text-sky-700" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
