import { Palette } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { getOrg } from "@/lib/org/getOrg";
import prisma from "@/lib/prisma";

import BrandingForm from "./BrandingForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BrandingPage() {
  // Use getOrg with mode: "required" - redirects to /sign-in or /onboarding if no org
  const orgResult = await getOrg({ mode: "required" });

  // If we get here, org is guaranteed (otherwise would have redirected)
  if (!orgResult.ok) {
    throw new Error("Unexpected: getOrg(required) returned not ok without redirecting");
  }

  const orgId = orgResult.orgId;
  const userId = orgResult.userId;

  // Backward-compatible lookup (some older records stored Clerk orgId as orgId)
  const orgIdCandidates = [orgResult.orgId, orgResult.clerkOrgId].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );

  // Fetch existing branding
  const branding = await prisma.org_branding
    .findFirst({
      where: {
        orgId: { in: orgIdCandidates },
      },
    })
    .catch(() => null);

  return (
    <PageContainer maxWidth="5xl">
      <PageHero
        section="settings"
        title="Company Branding"
        description="Set your company name, logo, colors, contact info, and team photo. These details auto-populate every AI report, proposal, contractor packet, and client-facing document across the platform."
        icon={<Palette className="h-6 w-6 text-white" />}
      />
      <div className="mt-8">
        <BrandingForm initial={branding} orgId={orgId} userId={userId} />
      </div>
    </PageContainer>
  );
}
