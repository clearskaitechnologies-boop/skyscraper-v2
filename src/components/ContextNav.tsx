"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CONTEXT_NAV } from "@/config/nav";
import { allowed } from "@/lib/acl";
import { cx,firstMatch } from "@/lib/ui";

export default function ContextNav() {
  const pathname = usePathname() ?? "/";
  const root = firstMatch(pathname, Object.keys(CONTEXT_NAV));
  const items = (CONTEXT_NAV[root] || []).filter((i) =>
    allowed(i.roles as any, i.plans as any)
  );

  if (!items.length) return null;

  return (
    <div className="h-10 border-b border-[color:var(--border)] bg-[var(--surface-2)] backdrop-blur" role="navigation" aria-label="Section navigation">
      <div className="flex h-full items-center gap-2 overflow-x-auto px-3">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cx(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                "motion-safe:hover:scale-105 motion-reduce:transition-none",
                active
                  ? "bg-[var(--primary-weak)] text-[color:var(--primary)] border border-[color:var(--primary)]"
                  : "text-[color:var(--muted)] hover:bg-[var(--surface-1)]"
              )}
              aria-current={active ? "page" : undefined}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
