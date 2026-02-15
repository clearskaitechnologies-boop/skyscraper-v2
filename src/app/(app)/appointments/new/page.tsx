import { ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

import NewAppointmentForm from "./NewAppointmentForm";

export const metadata: Metadata = {
  title: "New Appointment | SkaiScraper",
  description: "Schedule a new appointment",
};

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage() {
  const ctx = await safeOrgContext();

  if (ctx.status !== "ok" || !ctx.orgId) {
    return (
      <PageContainer>
        <div className="py-16 text-center">
          <p className="text-slate-600">Please sign in to create appointments.</p>
        </div>
      </PageContainer>
    );
  }

  // Fetch recent claims and leads for linking
  const [claims, leads] = await Promise.all([
    prisma.claims.findMany({
      where: { orgId: ctx.orgId },
      select: { id: true, claimNumber: true, title: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.leads.findMany({
      where: { orgId: ctx.orgId },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <PageContainer>
      <PageHero
        section="jobs"
        title="New Appointment"
        subtitle="Schedule an inspection, meeting, or site visit"
        icon={<Calendar className="h-6 w-6" />}
      >
        <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>
      </PageHero>

      <NewAppointmentForm claims={claims} leads={leads} />
    </PageContainer>
  );
}
