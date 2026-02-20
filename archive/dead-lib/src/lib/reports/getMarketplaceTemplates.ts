/**
 * Get Marketplace Templates
 * Retrieves public templates available for all orgs
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

export async function getMarketplaceTemplates() {
  if (!Templates) return [];

  return Templates.findMany({
    where: {
      templateType: "MARKETPLACE",
      // isPublic: true, // Uncomment when schema is updated
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
