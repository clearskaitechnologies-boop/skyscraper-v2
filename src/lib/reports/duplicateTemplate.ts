/**
 * Duplicate Template
 * Copy a template to an organization's custom library
 */

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

// Use report_templates model directly
const Templates = prisma.report_templates;

export async function duplicateTemplate(
  templateId: string,
  targetOrgId: string,
  options?: {
    name?: string;
    createdBy?: string;
  }
) {
  if (!Templates) {
    throw new Error("Templates model not available in this schema");
  }

  // Get source template
  const sourceTemplate = await Templates.findUnique({
    where: { id: templateId },
  });

  if (!sourceTemplate) {
    throw new Error("Template not found");
  }

  const section_order =
    sourceTemplate.section_order === null
      ? Prisma.JsonNull
      : (sourceTemplate.section_order as Prisma.InputJsonValue);

  const section_enabled =
    sourceTemplate.section_enabled === null
      ? Prisma.JsonNull
      : (sourceTemplate.section_enabled as Prisma.InputJsonValue);

  const defaults =
    sourceTemplate.defaults === null
      ? Prisma.JsonNull
      : (sourceTemplate.defaults as Prisma.InputJsonValue);

  // Create duplicate
  const newTemplate = await Templates.create({
    data: {
      id: crypto.randomUUID(),
      org_id: targetOrgId,
      name: options?.name || `${sourceTemplate.name} (Copy)`,
      section_order,
      section_enabled,
      defaults,
      is_default: false,
      created_by: options?.createdBy || "system",
      updated_at: new Date(),
    },
  });

  return newTemplate;
}
