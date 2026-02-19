"use client";

import { report_templates } from "@prisma/client";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

import { TemplateBrandPreview } from "./TemplateBrandPreview";

/**
 * Section configuration stored in template JSON fields
 */
interface SectionConfig {
  key: string;
  enabled: boolean;
  order: number;
}

interface TemplateEditorProps {
  template: report_templates;
}

function parseSections(template: report_templates): SectionConfig[] {
  const sectionOrder = (template.section_order as string[] | null) ?? [];
  const sectionEnabled = (template.section_enabled as Record<string, boolean> | null) ?? {};

  return sectionOrder.map((key, index) => ({
    key,
    enabled: sectionEnabled[key] ?? true,
    order: index,
  }));
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const [sections, setSections] = useState<SectionConfig[]>(() => parseSections(template));
  const [saving, setSaving] = useState(false);

  const handleSectionToggle = async (sectionKey: string, enabled: boolean) => {
    // Optimistic update
    setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, enabled } : s)));

    try {
      const newSectionEnabled = sections.reduce(
        (acc, s) => ({
          ...acc,
          [s.key]: s.key === sectionKey ? enabled : s.enabled,
        }),
        {} as Record<string, boolean>
      );

      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_enabled: newSectionEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle section");
      toast.success("Section updated");
    } catch (error) {
      logger.error("Failed to toggle section:", error);
      toast.error("Failed to toggle section");
      setSections(parseSections(template));
    }
  };

  const handleSaveSectionOrder = async () => {
    setSaving(true);
    try {
      const sectionOrder = sections.map((s) => s.key);
      const sectionEnabled = sections.reduce(
        (acc, s) => ({ ...acc, [s.key]: s.enabled }),
        {} as Record<string, boolean>
      );

      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_order: sectionOrder,
          section_enabled: sectionEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to save section order");
      toast.success("Section order saved");
    } catch (error) {
      logger.error("Failed to save section order:", error);
      toast.error("Failed to save section order");
    } finally {
      setSaving(false);
    }
  };

  const handleBrandingUpdate = async (branding: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaults: branding,
        }),
      });

      if (!res.ok) throw new Error("Failed to update branding");
      toast.success("Branding saved");
    } catch (error) {
      logger.error("Failed to update branding:", error);
      toast.error("Failed to update branding");
    }
  };

  return (
    <div className="flex h-auto flex-col gap-4 lg:h-[calc(100vh-180px)] lg:flex-row">
      {/* Left Column: Section List */}
      <div className="w-full lg:w-[320px] lg:flex-shrink-0">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
          <h3 className="mb-4 font-semibold">Report Sections</h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.key}
                className="flex items-center justify-between rounded-lg bg-[color:var(--surface-1)] p-3"
              >
                <span className="font-medium">{section.key}</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => handleSectionToggle(section.key, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[color:var(--muted)]">Enabled</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveSectionOrder} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Order
          </Button>
        </div>
      </div>

      {/* Center Column: Section Editor placeholder */}
      <div className="min-w-0 flex-1">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Section Editor</AlertTitle>
          <AlertDescription>
            Section content is configured via template defaults. Select sections on the left to
            enable/disable them.
          </AlertDescription>
        </Alert>
      </div>

      {/* Right Column: Branding Preview */}
      <div className="w-full lg:w-[340px] lg:flex-shrink-0">
        <TemplateBrandPreview template={template} onBrandingUpdate={handleBrandingUpdate} />
      </div>
    </div>
  );
}
