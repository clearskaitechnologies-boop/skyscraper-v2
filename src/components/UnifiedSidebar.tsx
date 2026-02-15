"use client";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CORE_NAV } from "@/config/nav";

export default function UnifiedSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[color:var(--border)] bg-[var(--surface-1)]">
      <div className="border-b border-[color:var(--border)] p-6">
        <h2 className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-2xl font-bold text-transparent">
          SkaiAI
        </h2>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Mission Control</p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {CORE_NAV.map((item) => {
          const isActive = item.match ? item.match.test(pathname || "") : pathname === item.href || pathname?.startsWith(item.href + "/");
          const IconComponent = item.icon ? (Icons[item.icon as keyof typeof Icons] as LucideIcon) : null;
          
          return (
            <Link key={item.href} href={item.href} className="relative block">
              <motion.div
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-[color:var(--muted)] hover:bg-[var(--surface-2)] hover:text-[color:var(--text)]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] shadow-[var(--glow)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {IconComponent && <IconComponent className="relative z-10 h-5 w-5" />}
                <span className="relative z-10 font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)]" />
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
}
