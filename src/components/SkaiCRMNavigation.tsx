// src/components/SkaiCRMNavigation.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  Briefcase,
  ChevronDown,
  Cpu,
  FileText,
  LayoutDashboard,
  MapPin,
  Package,
  Plus,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import BrandMark from "@/components/BrandMark";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationBell from "@/components/NotificationBell";
import ReferralModal from "@/components/referrals/ReferralModal";
import { Button } from "@/components/ui/button";
import { StandardButton } from "@/components/ui/StandardButton";
import { useBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";
import ModeToggles from "@/modules/ui/controls/ModeToggles";

interface NavTab {
  name: string;
  href: string;
  icon: React.ReactNode;
  dropdown?: { name: string; href: string }[];
}

const navigationTabs: NavTab[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    name: "Lead Routing",
    href: "/leads",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    name: "Retail",
    href: "/jobs/retail",
    icon: <Cpu className="h-4 w-4" />,
  },
  {
    name: "Claims",
    href: "/claims",
    icon: <Shield className="h-4 w-4" />,
    dropdown: [
      { name: "All Claims", href: "/claims" },
      { name: "Pipeline View", href: "/claims/tracker" },
      { name: "New Claim", href: "/claims/new" },
      { name: "Supplements", href: "/supplements/new" },
      { name: "Damage Builder", href: "/damage/new" },
      { name: "AI Scope Builder", href: "/scopes/new" },
      { name: "AI Estimate Builder", href: "/estimates/new" },
    ],
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    name: "Teams",
    href: "/teams",
    icon: <Users className="h-4 w-4" />,
  },
  {
    name: "Vendors",
    href: "/vendors",
    icon: <Package className="h-4 w-4" />,
  },
  {
    name: "Trades",
    href: "/trades",
    icon: <Users className="h-4 w-4" />,
    dropdown: [
      { name: "Network Feed", href: "/trades" },
      { name: "Directory", href: "/trades/directory" },
      { name: "My Network", href: "/trades/profile" },
      { name: "Messages", href: "/trades/messages" },
    ],
  },
  {
    name: "Routes/Map",
    href: "/map",
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    name: "Report History",
    href: "/reports/history",
    icon: <FileText className="h-4 w-4" />,
    dropdown: [
      { name: "All Reports", href: "/reports/history" },
      { name: "Retail Packets", href: "/retail/projects" },
      { name: "Claims Reports", href: "/claims/reports" },
    ],
  },
  {
    name: "AI Tools",
    href: "/ai/tools/mockup",
    icon: <Sparkles className="h-4 w-4" />,
    dropdown: [
      { name: "Mockup", href: "/ai/tools/mockup" },
      { name: "Weather", href: "/ai/tools/weather" },
      { name: "Supplement", href: "/ai/tools/supplement" },
      { name: "Depreciation", href: "/ai/tools/depreciation" },
      { name: "Rebuttal", href: "/ai/tools/rebuttal" },
    ],
  },
];

export default function SkaiCRMNavigation() {
  const pathname = usePathname();
  const { user } = useUser();
  const { branding } = useBranding();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActiveTab = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="header-h fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto h-full max-w-[1200px] px-3 md:px-4">
        <div className="flex h-full items-center justify-between gap-3">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="shrink-0">
            <BrandMark className="text-[#0A1A2F]" />
          </Link>

          {/* Navigation Tabs - Centered */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center space-x-1">
              {navigationTabs.map((tab) => (
                <div
                  key={tab.name}
                  className="relative"
                  onMouseEnter={() => tab.dropdown && setActiveDropdown(tab.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link href={tab.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        isActiveTab(tab.href)
                          ? "bg-blue-50 text-blue-600 shadow-sm hover:bg-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {tab.icon}
                      {tab.name}
                      {tab.dropdown && <ChevronDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </Link>

                  {/* Dropdown Menu */}
                  {tab.dropdown && activeDropdown === tab.name && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                      {tab.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Search, Actions, User */}
          <div className="flex items-center space-x-3">
            {/* Global Search */}
            <div className="hidden xl:flex">
              <GlobalSearch placeholder="Search leads, claims, contacts..." />
            </div>

            {/* Referral Button */}
            <ReferralModal />

            {/* Notification Bell */}
            <NotificationBell />

            {/* Mode Toggles (Dark Mode + Field Mode) */}
            <ModeToggles />

            {/* New Job Button */}
            <StandardButton variant="indigo" gradient size="sm">
              <Plus className="h-4 w-4" />
              New Job
            </StandardButton>

            {/* User Avatar */}
            <div className="flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-slate-100",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="border-t border-slate-200 lg:hidden">
          <div className="space-y-1 px-2 py-3">
            {navigationTabs.slice(0, 6).map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all",
                  isActiveTab(tab.href)
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {tab.icon}
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
