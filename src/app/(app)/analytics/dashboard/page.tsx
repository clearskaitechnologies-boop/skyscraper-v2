import { BarChart3, DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db/prisma";
import { PUBLIC_DEMO_ORG_ID } from "@/lib/demo/constants";
import { getOrg } from "@/lib/org/getOrg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * OPTIMIZED ANALYTICS DASHBOARD - Server-side rendered for speed
 */
export default async function AnalyticsDashboardPage() {
  // Get org - redirect if not authenticated
  const orgResult = await getOrg({ mode: "required" });
  if (!orgResult.ok) {
    redirect("/sign-in");
  }

  const organizationId = orgResult.orgId;

  // Check if demo mode is enabled
  let demoModeEnabled = false;
  try {
    const orgSettings = await prisma.org.findUnique({
      where: { id: organizationId },
      select: { demoMode: true },
    });
    demoModeEnabled = orgSettings?.demoMode ?? false;
  } catch {
    // Ignore if column doesn't exist
  }

  // Build where clause for demo mode
  const leadsWhere = demoModeEnabled
    ? { OR: [{ orgId: organizationId }, { orgId: PUBLIC_DEMO_ORG_ID, isDemo: true }] }
    : { orgId: organizationId };

  const claimsWhere = demoModeEnabled
    ? { OR: [{ orgId: organizationId }, { orgId: PUBLIC_DEMO_ORG_ID, isDemo: true }] }
    : { orgId: organizationId };

  // Fetch all data in parallel - FAST!
  const [leads, claims, retailJobs, recentLeads, recentClaims] = await Promise.all([
    prisma.leads.findMany({
      where: leadsWhere,
      select: { id: true, stage: true, value: true, createdAt: true, jobCategory: true },
    }),
    prisma.claims.findMany({
      where: claimsWhere,
      select: { id: true, status: true, estimatedValue: true, createdAt: true },
    }),
    prisma.leads.findMany({
      where: { ...leadsWhere, jobCategory: { in: ["out_of_pocket", "financed", "repair"] } },
      select: { id: true, value: true },
    }),
    prisma.leads.findMany({
      where: { ...leadsWhere, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { id: true },
    }),
    prisma.claims.findMany({
      where: {
        ...claimsWhere,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    }),
  ]);

  // Calculate metrics
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.stage !== "closed" && l.stage !== "lost").length;
  const totalClaims = claims.length;
  const totalRetailJobs = retailJobs.length;
  const retailValue = retailJobs.reduce((sum, j) => sum + (j.value || 0), 0);
  const leadsValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const claimsValue = claims.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);
  const conversionRate = totalLeads > 0 ? (totalClaims / totalLeads) * 100 : 0;
  const newLeadsLast30Days = recentLeads.length;
  const newClaimsLast30Days = recentClaims.length;

  // Claims by status
  const claimsByStatus = claims.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        title="Analytics Dashboard"
        subtitle="Track performance and conversions"
        icon={<BarChart3 className="h-5 w-5" />}
      />

      {/* Conversions Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Users className="h-4 w-4" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalLeads}</p>
              <p className="text-xs text-slate-500">{newLeadsLast30Days} new (30d)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <FileText className="h-4 w-4" />
                Total Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalClaims}</p>
              <p className="text-xs text-slate-500">{newClaimsLast30Days} new (30d)</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-800">
                <TrendingUp className="h-4 w-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-green-600">Leads → Claims</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <DollarSign className="h-4 w-4" />
                Active Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{activeLeads}</p>
              <p className="text-xs text-slate-500">
                {totalLeads > 0 ? ((activeLeads / totalLeads) * 100).toFixed(0) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-800">
                <DollarSign className="h-4 w-4" />
                Retail Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">{totalRetailJobs}</p>
              <p className="text-xs text-purple-600">
                ${(retailValue / 100).toLocaleString()} value
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Key Insights
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                ${((leadsValue + claimsValue) / 100).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                Leads: ${(leadsValue / 100).toLocaleString()} | Claims: $
                {(claimsValue / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Claims Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(claimsByStatus)
                  .slice(0, 3)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-600">{status.replace("_", " ")}</span>
                      <span className="font-semibold text-slate-900">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/leads/new">
                  <button className="w-full rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                    + New Lead
                  </button>
                </Link>
                <Link href="/claims/new">
                  <button className="w-full rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                    + New Claim
                  </button>
                </Link>
                <Link href="/jobs/retail/new">
                  <button className="w-full rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100">
                    + New Retail Job
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link href="/pipeline">
          <Card className="cursor-pointer transition hover:shadow-lg">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-blue-600" />
              <p className="mt-2 font-semibold text-slate-900">Pipeline</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/claims">
          <Card className="cursor-pointer transition hover:shadow-lg">
            <CardContent className="p-4 text-center">
              <FileText className="mx-auto h-8 w-8 text-indigo-600" />
              <p className="mt-2 font-semibold text-slate-900">Claims</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/history">
          <Card className="cursor-pointer transition hover:shadow-lg">
            <CardContent className="p-4 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-purple-600" />
              <p className="mt-2 font-semibold text-slate-900">Reports</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="cursor-pointer transition hover:shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 font-semibold text-slate-900">Settings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
