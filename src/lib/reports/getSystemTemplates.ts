/**
 * Get System Templates
 * Built-in templates available to all organizations
 */

import { prismaModel } from "@/lib/db/prismaModel";

const Templates = prismaModel<any>(
  "report_templates",
  "reportTemplates",
  "reportTemplate",
  "ReportTemplate",
  "report_templates_v2",
  "template",
  "templates"
);

export async function getSystemTemplates() {
  if (!Templates) return [];

  return Templates.findMany({
    where: {
      templateType: "SYSTEM",
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getMarketplaceTemplates() {
  if (!Templates) return [];

  return Templates.findMany({
    where: {
      templateType: "MARKETPLACE",
      isPublic: true,
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getTemplateByIdPublic(templateId: string) {
  if (!Templates) return null;

  return Templates.findFirst({
    where: {
      id: templateId,
      OR: [{ templateType: "SYSTEM" }, { templateType: "MARKETPLACE", isPublic: true }],
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });
}
