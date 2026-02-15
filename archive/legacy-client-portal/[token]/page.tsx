import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function ClientPortalOverview({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) {
    return <div className="text-center py-20">Invalid or expired access link.</div>;
  }

  const claim = tokenData.claimId ? await prisma.claims.findUnique({ where: { id: tokenData.claimId } }) : null;
  const latestUpdate = claim ? await prisma.claim_updates.findFirst({ where: { claimId: claim.id, visibleToClient: true }, orderBy: { createdAt: "desc" } }) : null;
  const visibleTimelineCount = claim ? await prisma.claim_timeline_events.count({ where: { claim_id: claim.id, visible_to_client: true } }) : 0;
  const visibleDocumentCount = claim ? await prisma.claim_documents.count({ where: { claimId: claim.id, visibleToClient: true } }) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Claim Overview</h1>
      {!claim && <p>No claim linked yet.</p>}
      {claim && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded p-4"><div className="text-sm text-muted-foreground">Status</div><div className="font-medium">{claim.status}</div></div>
          <div className="border rounded p-4"><div className="text-sm text-muted-foreground">Documents Visible</div><div className="font-medium">{visibleDocumentCount}</div></div>
          <div className="border rounded p-4"><div className="text-sm text-muted-foreground">Timeline Events</div><div className="font-medium">{visibleTimelineCount}</div></div>
        </div>
      )}
      {latestUpdate && (
        <div className="border rounded p-4 bg-muted/40">
          <div className="text-sm text-muted-foreground mb-1">Latest Update</div>
          <div className="text-sm">{latestUpdate.message}</div>
        </div>
      )}
    </div>
  );
}
