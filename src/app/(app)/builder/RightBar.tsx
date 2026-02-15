import React from "react";

import { SectionRegistry } from "@/lib/registry/SectionRegistry";
import { cn } from "@/lib/utils";

interface RightBarProps {
  templateId?: string;
}

export default function RightBar({ templateId }: RightBarProps) {
  // Example: show template info, add-ons, export options
  const template = templateId ? SectionRegistry.getTemplate(templateId) : null;

  return (
    <aside className={cn("flex w-80 flex-col gap-4 border-l bg-white p-6")}>
      <div className="text-xl font-bold">Right Sidebar</div>
      {template && (
        <div>
          <div className="font-semibold">Template:</div>
          <div>{template.title}</div>
        </div>
      )}
      {/* Add-on cards, export buttons, etc. */}
      <div className="mt-auto">
        <button className="w-full rounded bg-sky-600 py-2 text-white">Export Report</button>
      </div>
    </aside>
  );
}
