import { currentUser } from "@clerk/nextjs/server";
import { Hammer, History } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { TradesToolJobPicker } from "@/components/trades/TradesToolJobPicker";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/lib/paths";

import DamageBuilderClient from "./client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Damage Report • SkaiScraper" };

export default async function Page({
  searchParams,
}: {
  searchParams: { leadId?: string; jobId?: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const leadId = searchParams?.leadId ?? "";
  const jobId = searchParams?.jobId ?? "";

  return (
    <PageContainer>
      <PageHero
        section="claims"
        title="Damage Report"
        subtitle="Structure your scopes with room, elevation, and item-level detail"
        icon={<Hammer className="h-5 w-5" />}
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={PATHS.AI_DAMAGE_HISTORY}>
              <History className="mr-1 h-4 w-4" /> History
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href={PATHS.REPORT_NEW}>New Report</Link>
          </Button>
        </div>
      </PageHero>
      <TradesToolJobPicker label="Select job context:" />
      <DamageBuilderClient leadId={leadId} jobId={jobId} />
    </PageContainer>
  );
}
