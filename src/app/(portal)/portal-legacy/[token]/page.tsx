import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function PortalOverview({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;

  const claim = tokenData.claimId
    ? await prisma.claims.findUnique({ where: { id: tokenData.claimId } })
    : null;
  // Note: claim_updates model does not exist - using latest activity as fallback
  const latestActivity = claim
    ? await prisma.claim_activities.findFirst({
        where: { claim_id: claim.id },
        orderBy: { created_at: "desc" },
        select: { message: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Claim Overview</h1>
      {!claim && <p>No claim linked yet.</p>}
      {claim && (
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Status" value={claim.status ?? "—"} />
          <Stat label="Latest Update" value={latestActivity?.message || "—"} />
          <Stat label="Updated" value={new Date(claim.updatedAt).toLocaleDateString()} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 truncate text-sm font-medium" title={value}>
        {value}
      </div>
    </div>
  );
}
