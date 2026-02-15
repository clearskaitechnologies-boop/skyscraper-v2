// src/app/(app)/claims/[claimId]/layout.tsx
import { notFound } from "next/navigation";
import { ReactNode } from "react";

import ClaimAIColumn from "./_components/ClaimAIColumn";
import ClaimSidebar from "./_components/ClaimSidebar";
import ClaimTabs from "./_components/ClaimTabs";
import { getClaim } from "./loader";

interface ClaimLayoutProps {
  children: ReactNode;
  params: { claimId: string };
}

export default async function ClaimLayout({ children, params }: ClaimLayoutProps) {
  const result = await getClaim(params.claimId);

  if (!result.ok) {
    notFound();
  }

  const claim = result.claim;

  const sidebarClaim = {
    id: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status,
    clientName: claim.insured_name ?? undefined,
    clientEmail: claim.homeownerEmail ?? undefined,
    insuranceCarrier: claim.carrier ?? undefined,
    policyNumber: claim.policyNumber ?? undefined,
    adjusterName: claim.adjusterName ?? undefined,
    claimType: claim.damageType ?? undefined,
    coverPhotoUrl: claim.coverPhotoUrl ?? null,
    updatedAt: claim.updatedAt,
  };

  return (
    <div className="grid h-screen grid-cols-[320px_1fr_340px] overflow-hidden bg-[#0a0a0f]">
      {/* LEFT SIDEBAR */}
      <aside className="overflow-y-auto border-r border-white/10 bg-[#0f0f14]">
        <ClaimSidebar claim={sidebarClaim} />
      </aside>

      {/* MAIN CONTENT */}
      <main className="overflow-y-auto p-8">
        <ClaimTabs claimId={params.claimId} />
        <div className="mt-8">{children}</div>
      </main>

      {/* RIGHT AI PANEL */}
      <aside className="overflow-y-auto border-l border-white/10 bg-[#0f0f14]">
        <ClaimAIColumn />
      </aside>
    </div>
  );
}
