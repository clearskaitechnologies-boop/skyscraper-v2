import { Activity, Mail, PlusIcon, Target, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { LeadRoutingDropdown } from "@/components/leads/LeadRoutingDropdown";
import RecordActions from "@/components/RecordActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrg } from "@/lib/org/getOrg";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Leads | SkaiScraper",
  description: "View and manage all sales leads, routing, and pipeline status.",
};

export default async function LeadsPage() {
  // Use getOrg with mode: "required" - redirects to /sign-in or /onboarding if no org
  const orgResult = await getOrg({ mode: "required" });

  // If we get here, org is guaranteed (otherwise would have redirected)
  if (!orgResult.ok) {
    throw new Error("Unexpected: getOrg(required) returned not ok without redirecting");
  }

  const orgId = orgResult.orgId;
  let leads: Array<{
    id: string;
    contactId: string;
    title: string;
    stage: string;
    value: number | null;
    createdAt: Date;
    jobCategory: string | null;
  }> = [];
  let contactsById = new Map<
    string,
    { id: string; firstName: string; lastName: string; email: string | null }
  >();

  try {
    if (orgId) {
      // ⚠️ DEMO SEEDING REMOVED FROM RENDER PATH
      // Demo data is seeded via /api/dev/seed-demo or pnpm run seed:minimal-demo

      // Show only unrouted + repair leads (retail out-of-pocket/financed live in Retail workspace)
      leads = await prisma.leads.findMany({
        where: {
          orgId,
          OR: [{ jobCategory: { in: ["lead", "repair"] } }, { jobCategory: null }],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          contactId: true,
          title: true,
          stage: true,
          value: true,
          createdAt: true,
          jobCategory: true,
        },
      });

      const contactIds = Array.from(new Set(leads.map((l) => l.contactId).filter(Boolean)));
      if (contactIds.length > 0) {
        const contacts = await prisma.contacts.findMany({
          where: { id: { in: contactIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });
        contactsById = new Map(contacts.map((c) => [c.id, c]));
      }
    }
  } catch (error) {
    console.error("[LeadsPage] Failed to fetch leads:", error);
    // Treat as empty state - user sees friendly "No leads yet" instead of scary error
    leads = [];
    contactsById = new Map();
  }

  const newLeadsCount = leads.filter((l) => l.stage === "new").length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="jobs"
        title="Lead Routing"
        subtitle="Route new leads to the right workspace and next step"
        icon={<Target className="h-5 w-5" />}
      >
        <Button
          asChild
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <Link href="/pipeline">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Pipeline
          </Link>
        </Button>
        <Button asChild className="bg-white text-teal-700 hover:bg-teal-50">
          <Link href="/leads/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Lead
          </Link>
        </Button>
      </PageHero>

      <div className="space-y-6">
        {/* Stats Row - Card-based like Retail Workspace */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-indigo-800 dark:text-indigo-200">
                <Target className="h-4 w-4" />
                Pipeline View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/pipeline"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open Pipeline →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <div className="rounded-full bg-blue-500 p-1.5">
                  <Users className="h-3 w-3 text-white" />
                </div>
                Lead Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{newLeadsCount}</p>
              <p className="text-xs text-slate-500">Total routed: {leads.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <div className="rounded-full bg-emerald-500 p-1.5">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                Estimated Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">
                ${totalValue > 0 ? (totalValue / 100).toLocaleString() : "0"}
              </p>
              <p className="text-xs text-slate-500">Total opportunity</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter - Matches Retail & Claims */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Routing Queue - Card-based rows like Retail Workspace */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Lead Routing Queue</h2>
          {leads.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-500" />
              <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
              <p className="mt-2 text-sm text-slate-500">Start by adding your first lead!</p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Link href="/leads/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add First Lead
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.slice(0, 15).map((lead) => {
                const contact = contactsById.get(lead.contactId);
                const isUnrouted = !lead.jobCategory || lead.jobCategory === "lead";

                return (
                  <Card
                    key={lead.id}
                    className="transition-all hover:border-purple-300 hover:shadow-md"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
                        <Target className="h-5 w-5 text-white" />
                      </div>

                      <Link href={`/leads/${lead.id}`} className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{lead.title}</h3>
                        {contact && (
                          <p className="text-sm text-slate-500">
                            {contact.firstName} {contact.lastName}
                          </p>
                        )}
                      </Link>

                      <div className="flex shrink-0 items-center gap-3">
                        {isUnrouted && (
                          <LeadRoutingDropdown
                            leadId={lead.id}
                            currentCategory={lead.jobCategory || undefined}
                          />
                        )}
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              lead.stage === "new"
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : lead.stage === "qualified"
                                  ? "border-purple-300 bg-purple-50 text-purple-700"
                                  : lead.stage === "proposal"
                                    ? "border-orange-300 bg-orange-50 text-orange-700"
                                    : lead.stage === "won"
                                      ? "border-green-300 bg-green-50 text-green-700"
                                      : "border-slate-300 bg-slate-50 text-slate-700"
                            }
                          >
                            {lead.stage}
                          </Badge>
                          {lead.jobCategory && lead.jobCategory !== "lead" && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {lead.jobCategory.replace("_", " ")}
                            </Badge>
                          )}
                          {lead.value && (
                            <p className="mt-1 text-sm font-semibold">
                              ${(lead.value / 100).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <RecordActions
                          deleteEndpoint={`/api/leads/${lead.id}`}
                          itemLabel={lead.title || "Lead"}
                          entityType="Lead"
                          isSoftDelete={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {leads.length > 15 && (
                <div className="pt-2 text-center">
                  <Link href="/leads" className="text-sm text-purple-600 hover:text-purple-700">
                    View all {leads.length} leads →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
