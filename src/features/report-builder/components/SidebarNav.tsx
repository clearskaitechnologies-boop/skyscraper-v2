"use client";

import {
  Calculator,
  FileArchive,
  FileText,
  FolderOpen,
  Image,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavProps {
  projectId: string;
}

const navItems = [
  { href: "overview", label: "Project Overview", icon: FolderOpen },
  { href: "photos", label: "Photos", icon: Image },
  { href: "reports", label: "Reports", icon: FileText },
  { href: "estimates", label: "Estimates & Scopes", icon: Calculator },
  { href: "docs", label: "Documents", icon: FileArchive },
  { href: "contacts", label: "Contacts", icon: Users },
  { href: "settings", label: "Project Settings", icon: Settings },
];

export function SidebarNav({ projectId }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">SkaiScraper™ Reports</h2>
        <p className="text-sm text-gray-500">Project Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const href = `/projects/${projectId}/${item.href}`;
          const isActive = pathname?.includes(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Projects
        </Link>
      </div>
    </div>
  );
}
