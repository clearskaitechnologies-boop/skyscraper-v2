"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type TabItem = {
  label: string;
  href: string;
  exact?: boolean; // if true, only exact match is active
};

const TABS: TabItem[] = [
  { label: "Dashboard", href: "/dashboard", exact: true },
  { label: "AI Proposals", href: "/generate" },
  { label: "AI Mockup", href: "/mockups" },
  { label: "Damage Builder", href: "/damage" },
  { label: "Quick DOL", href: "/quick-dol" },
  { label: "Weather Report", href: "/weather-report" },
  { label: "Box Summary", href: "/exports/carrier" },
  { label: "Teams", href: "/teams" },
  { label: "Company Map", href: "/company-map" },
  { label: "Route Optimization", href: "/route-optimization" },
  { label: "Jobs Map", href: "/jobs/map" },
  { label: "Depreciation", href: "/depreciation" },
  { label: "Inbox", href: "/inbox" },
];

export default function AITabs() {
  const raw = usePathname();
  const pathname = raw ?? "";

  const isActive = (item: TabItem) => {
    if (!pathname) return false;
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav aria-label="Primary navigation" className="w-full border-b border-gray-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-center">
          <div className="no-scrollbar flex w-full gap-2 overflow-x-auto py-3">
            {TABS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-selected={isActive(item)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                  isActive(item)
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
