import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import prisma from "@/lib/prisma";

import { ProposalCreationForm } from "./_components/ProposalCreationForm";
import { ProposalList } from "./_components/ProposalList";

export const metadata = {
  title: "Proposals | SkaiScraper",
  description: "Create and manage project proposals with AI-powered generation.",
};

export default async function ProposalEnginePage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  // Fetch templates for picker
  const templates = await prisma.report_templates
    .findMany({
      where: {
        org_id: orgId,
      },
      orderBy: [{ is_default: "desc" }, { name: "asc" }],
    })
    .catch(() => []);

  // Fetch recent proposals (we'll create this table in a moment)
  // For now, pass empty array
  const proposals: any[] = [];

  return (
    <PageContainer>
      <PageHero
        section="reports"
        title="Proposal Engine"
        subtitle="Generate professional proposals with AI-powered content"
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Creation Form */}
        <div className="lg:col-span-2">
          <ProposalCreationForm templates={templates} orgId={orgId} />
        </div>

        {/* Right: Recent Proposals */}
        <div>
          <ProposalList proposals={proposals} />
        </div>
      </div>
    </PageContainer>
  );
}
