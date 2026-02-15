import React from "react";

import { SectionRegistry } from "@/lib/registry/SectionRegistry";
import { cn } from "@/lib/utils";

import RightBar from "../../_components/RightBar";
import SectionCard from "../../_components/SectionCard";

interface BuilderShellProps {
  templateId?: string;
  sections?: string[];
  children?: React.ReactNode;
}

export default function BuilderShell({ templateId, sections, children }: BuilderShellProps) {
  // Template-aware layout logic
  const templateSections = templateId
    ? SectionRegistry.getTemplateSections(templateId)
    : sections || [];

  return (
    <div className={cn("flex h-full w-full bg-[var(--surface-2)]")}>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4">
          {templateSections.map((sectionId) => (
            <SectionCard key={sectionId} sectionId={sectionId} />
          ))}
          {children}
        </div>
      </main>
      <RightBar />
    </div>
  );
}
