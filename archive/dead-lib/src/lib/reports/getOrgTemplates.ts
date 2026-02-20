/**
 * Get Organization Templates
 * Fetches all templates owned by a specific organization
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

export async function getOrgTemplates(orgId: string) {
  if (!Templates) return [];

  return Templates.findMany({
    where: {
      orgId,
      templateType: "COMPANY",
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getOrgTemplateById(templateId: string, orgId: string) {
  if (!Templates) return null;

  return Templates.findFirst({
    where: {
      id: templateId,
      orgId,
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getDefaultTemplate(orgId: string, type?: string) {
  if (!Templates) return null;

  return Templates.findFirst({
    where: {
      orgId,
      isDefault: true,
      ...(type && { templateType: type }),
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });
}
