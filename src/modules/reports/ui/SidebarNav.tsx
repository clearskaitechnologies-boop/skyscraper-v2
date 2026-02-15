"use client";

// ============================================================================
// SIDEBAR NAVIGATION - Phase 3
// ============================================================================
// Left sidebar with Projects/Reports/Photos/Exports/Settings + keyboard shortcuts

import { Download, FileText, FolderOpen, Home,Image, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  shortcut: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    path: "/dashboard",
    shortcut: "H",
  },
  {
    label: "Projects",
    icon: <FolderOpen className="h-5 w-5" />,
    path: "/projects",
    shortcut: "P",
  },
  {
    label: "Report History",
    icon: <FileText className="h-5 w-5" />,
    path: "/reports/history",
    shortcut: "R",
  },
  {
    label: "Photos",
    icon: <Image className="h-5 w-5" />,
    path: "/photos",
    shortcut: "I",
  },
  {
    label: "Exports",
    icon: <Download className="h-5 w-5" />,
    path: "/exports",
    shortcut: "E",
  },
  {
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/settings",
    shortcut: "S",
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // ESC to close modals (handled by modal components)
      if (e.key === "Escape") return;

      // Check for shortcuts
      const item = NAV_ITEMS.find((i) => i.shortcut.toLowerCase() === e.key.toLowerCase());

      if (item) {
        e.preventDefault();
        router.push(item.path);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <nav className="flex h-screen w-64 flex-col border-r border-border bg-card text-card-foreground">
      {/* Logo/Brand */}
      <div className="border-b border-gray-800 px-6 py-6">
        <h1 className="text-xl font-bold">SkaiScraper™</h1>
        <p className="mt-1 text-xs text-gray-400">Contractor Packet System</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>

              {/* Keyboard shortcut hint */}
              <kbd
                className={`rounded px-2 py-1 font-mono text-xs ${
                  isActive ? "bg-blue-700 text-blue-100" : "bg-gray-800 text-gray-400"
                }`}
              >
                {item.shortcut}
              </kbd>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-6 py-4">
        <p className="text-xs text-gray-500">
          Press <kbd className="rounded bg-gray-800 px-1 py-0.5">ESC</kbd> to close modals
        </p>
      </div>
    </nav>
  );
}
