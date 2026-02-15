import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ClientClaimView } from "@/components/client/ClientClaimView";

interface ClientClaimPageProps {
  params: Promise<{
    claimId: string;
  }>;
}

export default async function ClientClaimPage({ params }: ClientClaimPageProps) {
  const { userId } = await auth();
  const { claimId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  return <ClientClaimView claimId={claimId} />;
}
