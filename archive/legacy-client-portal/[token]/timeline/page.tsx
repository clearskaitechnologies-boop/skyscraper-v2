import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function TimelinePage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  const events = await prisma.claim_timeline_events.findMany({ where: { claim_id: tokenData.claimId, visible_to_client: true }, orderBy: { occurred_at: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Claim Timeline</h1>
      {events.length === 0 && <p className="text-sm text-muted-foreground">No visible events yet.</p>}
      <ul className="space-y-2">
        {events.map(ev => (
          <li key={ev.id} className="border rounded p-3">
            <div className="text-sm font-medium">{ev.type}</div>
            {ev.description && <div className="text-xs text-muted-foreground mt-1">{ev.description}</div>}
            <div className="text-[11px] mt-2 text-muted-foreground">{new Date(ev.occurred_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
