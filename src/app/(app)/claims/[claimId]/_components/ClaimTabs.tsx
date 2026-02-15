// src/app/(app)/claims/[claimId]/_components/ClaimTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface ClaimTabsProps {
  claimId: string;
}

const tabs = [
  { label: "Overview", href: "/overview" },
  { label: "Photos", href: "/photos" },
  { label: "Documents", href: "/documents" },
  { label: "Measurements", href: "/measurements" },
  { label: "Messages", href: "/messages" },
  { label: "Timeline", href: "/timeline" },
  { label: "Reports", href: "/reports" },
  { label: "Weather", href: "/weather" },
  { label: "Trades", href: "/trades" },
  { label: "Client", href: "/client" },
  { label: "Notes", href: "/notes" },
  { label: "Final Payout", href: "/final-payout" },
  { label: "AI Assistant", href: "/ai" },
];

export default function ClaimTabs({ claimId }: ClaimTabsProps) {
  const pathname = usePathname();

  return (
    <div className="scrollbar-none -mb-px flex items-center gap-1 overflow-x-auto pb-0">
      {tabs.map((tab) => {
        const href = `/claims/${claimId}${tab.href}`;
        const isActive =
          pathname === href || (tab.href === "/overview" && pathname === `/claims/${claimId}`);

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
