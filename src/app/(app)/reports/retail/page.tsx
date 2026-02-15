import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { safeRetailContext } from "@/lib/db/safeRetailContext";

import RetailProposalClient from "./RetailProposalClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Removed direct loader; replaced with resilient safeRetailContext.

export default async function RetailProposalPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const userId = user.id;
  const orgId = user.publicMetadata?.orgId as string | undefined;
  if (!orgId) {
    console.warn("[RetailProposal] Missing org context", { userId });
    redirect("/sign-in");
  }
  const { leads, claims } = await safeRetailContext(orgId);
  console.info("[RetailProposal] Loaded context", {
    leadCount: leads.length,
    claimCount: claims.length,
    orgId,
    userId,
  });

  return <RetailProposalClient leads={leads as any} claims={claims as any} />;
}

// End of file
