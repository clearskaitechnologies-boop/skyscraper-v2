import { Calendar, Plus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";

import { AppointmentsClient } from "./AppointmentsClient";

export const metadata: Metadata = {
  title: "Appointments | SkaiScraper",
  description: "Manage your appointments and schedule",
};

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  // Soft gate: do not block page; auto-create org when possible
  const ctx = await getActiveOrgContext({ required: true });

  // Extract userId and orgId safely from the context result
  const userId = ctx.ok ? ctx.userId : "";
  const orgId = ctx.ok ? ctx.orgId : "";

  return (
    <PageContainer>
      <PageHero
        section="jobs"
        title="Appointments"
        subtitle="Schedule and track inspections, site visits, and follow-ups"
        icon={<Calendar className="h-6 w-6" />}
      >
        <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
          <Link href="/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </PageHero>
      <AppointmentsClient currentUserId={userId} orgId={orgId} />
    </PageContainer>
  );
}
