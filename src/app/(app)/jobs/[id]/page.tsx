import { notFound, redirect } from "next/navigation";

import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Jobs detail page - redirects to the appropriate workspace based on job type
 *
 * - CLAIM jobs with a claimId → redirect to /claims/[claimId]
 * - RETAIL jobs → redirect to /jobs/retail/[id]
 * - Other jobs (leads) → redirect to /leads/[id]
 * - Non-existent jobs → 404
 */
export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  // Fetch the lead/job to determine its type
  const job = await prisma.leads.findUnique({
    where: { id },
    select: {
      id: true,
      jobType: true,
      claimId: true,
    },
  });

  // If job doesn't exist, show 404
  if (!job) {
    notFound();
  }

  // Redirect based on job type
  if (job.claimId) {
    // Claim job - redirect to claims workspace
    redirect(`/claims/${job.claimId}`);
  }

  if (job.jobType === "RETAIL") {
    // Retail job - redirect to retail workspace
    redirect(`/jobs/retail/${job.id}`);
  }

  // Default: redirect to leads workspace
  redirect(`/leads/${job.id}`);
}
