// app/(app)/reports/batch/page.tsx

import { PageHero } from "@/components/layout/PageHero";
import { BatchReportGenerator } from "@/components/reports/BatchReportGenerator";
import { getOrg } from "@/lib/org/getOrg";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BatchReportsPage() {
  // Use getOrg with mode: "required" - redirects to /sign-in or /onboarding if no org
  const orgResult = await getOrg({ mode: "required" });

  // If we get here, org is guaranteed (otherwise would have redirected)
  if (!orgResult.ok) {
    throw new Error("Unexpected: getOrg(required) returned not ok without redirecting");
  }

  const orgId = orgResult.orgId;

  // Fetch recent claims
  const claims = await prisma.claims.findMany({
    where: { orgId },
    select: {
      id: true,
      claimNumber: true,
      insured_name: true,
      dateOfLoss: true,
      damageType: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch templates for quick selection
  const templates = await prisma.report_templates
    .findMany({
      where: { org_id: orgId },
      orderBy: { created_at: "desc" },
    })
    .catch(() => []);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHero
        title="Batch Report Generation"
        subtitle="Generate multiple reports for multiple claims in one action."
      />

      <BatchReportGenerator orgId={orgId} claims={claims as any} templates={templates as any} />
    </div>
  );
}
