import { redirect } from "next/navigation";

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  redirect(`/claims/${claimId}/overview`);
}
