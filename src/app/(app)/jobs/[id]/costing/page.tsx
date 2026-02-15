import { AlertCircle } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobCostingPanel } from "@/components/job-costing/JobCostingPanel";
import { PageTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const metadata: Metadata = {
  title: "Job Costing | SkaiScraper",
  description: "Manage job costs and estimates",
};

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export default async function JobCostingPage({ params }: Props) {
  const ctx = await safeOrgContext();

  if (ctx.status === "unauthenticated") {
    return (
      <main className="p-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Job Costing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Please sign in to access job costing.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Auto-onboarding handled by safeOrgContext
  // if (ctx.status === "noMembership") {
  //   return <div>Setting up workspace...</div>;
  // }
  if (false) {
    return (
      <main className="space-y-6 p-6">
        <PageTitle>Job Costing</PageTitle>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>No Organization Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>You need to be part of an organization to access job costing.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (ctx.status === "error") {
    return (
      <main className="p-6">
        <Card className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-50 to-red-100 shadow-xl dark:from-red-950 dark:to-red-900">
          <CardContent className="py-12">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-200">
                  Unable to Load Job Costing
                </h2>
                <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                  {ctx.error || "Unexpected error retrieving organization context."} Try refreshing
                  the page or check back in a moment.
                </p>
                <Button
                  variant="outline"
                  className="border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                  onClick={() => window.location.reload()}
                >
                  <AlertCircle className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { id } = params;
  if (!id) notFound();

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageTitle>Job Costing - Job #{id}</PageTitle>
        <a href="/jobs/retail" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Retail Jobs
        </a>
      </div>
      <JobCostingPanel jobId={id} />
    </main>
  );
}
