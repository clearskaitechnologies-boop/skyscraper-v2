import {
  Building2,
  Cloud,
  FileText,
  Image,
  Package,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import ClientOnly from "@/client/ClientOnly";

function AITools() {
  const tools = [
    {
      name: "AI Mockup",
      description: "Generate property mockups (before/after visualization)",
      icon: Image,
      href: "/ai/tools/mockup",
    },
    {
      name: "Weather Intelligence",
      description: "Historical weather data for claim validation",
      icon: Cloud,
      href: "/ai/tools/weather",
    },
    {
      name: "Supplement Builder",
      description: "Draft structured supplemental estimates (placeholder)",
      icon: Package,
      href: "/ai/tools/supplement",
    },
    {
      name: "Depreciation Calculator",
      description: "Estimate item depreciation values (placeholder)",
      icon: TrendingUp,
      href: "/ai/tools/depreciation",
    },
    {
      name: "Rebuttal Builder",
      description: "Draft structured claim rebuttals (placeholder)",
      icon: FileText,
      href: "/ai/tools/rebuttal",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[color:var(--text)]">AI Tools</h1>
        <p className="text-sm text-[color:var(--muted)]">Unified suite of AI helpers — canonical /ai/tools/ routes.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="rounded-lg border border-[color:var(--border)] p-4 transition-colors hover:bg-[color:var(--surface-2)]">
            <div className="flex items-start gap-3">
              <tool.icon className="h-5 w-5 text-[color:var(--muted)]" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[color:var(--text)]">{tool.name}</h3>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AIToolsPage() {
  return (
    <ClientOnly requireSubscription={true}>
      <AITools />
    </ClientOnly>
  );
}
