"use client";

import { 
  Briefcase, 
  CloudRain, 
  FileText, 
  Hammer, 
  Image, 
  Map, 
  Package, 
  Route, 
  Sparkles, 
  Sun, 
  Users} from "lucide-react";
import Link from "next/link";

type Tab = { 
  href: string; 
  label: string; 
  icon: React.ElementType;
  tone: "blue" | "purple" | "red" | "green" | "teal" | "orange" | "slate";
};

const BASE_TABS: Tab[] = [
  { href: "/builder", label: "New Report", icon: FileText, tone: "blue" },
  { href: "/generate", label: "New Proposal", icon: Sparkles, tone: "purple" },
  { href: "/mockups", label: "AI Mockup", icon: Image, tone: "purple" },
  { href: "/damage", label: "Damage Builder", icon: Hammer, tone: "red" },
  { href: "/quick-dol", label: "Quick DOL", icon: Sun, tone: "green" },
  { href: "/weather-report", label: "Weather Report", icon: CloudRain, tone: "teal" },
  { href: "/exports/carrier", label: "Box Summary", icon: Package, tone: "orange" },
  { href: "/teams", label: "Teams", icon: Users, tone: "slate" },
  { href: "/company-map", label: "Company Map", icon: Map, tone: "slate" },
  { href: "/route-optimization", label: "Route Opt", icon: Route, tone: "slate" },
  { href: "/jobs/map", label: "Jobs Map", icon: Briefcase, tone: "slate" },
];

const toneClasses = {
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  red: "bg-red-600",
  green: "bg-green-600",
  teal: "bg-teal-600",
  orange: "bg-orange-600",
  slate: "bg-slate-700",
};

export default function QuickTabs({ tabs = BASE_TABS }: { tabs?: Tab[] }) {
  return (
    <div className="mb-8 flex w-full items-center justify-center">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <span className={`inline-block h-2 w-2 rounded-full ${toneClasses[tab.tone]}`} />
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
