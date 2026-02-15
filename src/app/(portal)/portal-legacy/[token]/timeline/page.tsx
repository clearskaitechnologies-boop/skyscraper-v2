import { getClaimTimelineEventsSafe } from "@/lib/portal/getTimelineEvents";
import { validatePortalToken } from "@/lib/portalAuth";

export default async function TimelinePage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  const events = await getClaimTimelineEventsSafe(tokenData.claimId);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Timeline</h1>
      {events.length === 0 && <p className="text-sm text-gray-500">No visible events yet.</p>}
      <ul className="space-y-2">
        {events.map(ev => (
          <li key={ev.id} className="rounded border bg-white p-3">
            <div className="text-sm font-medium">{ev.type}</div>
            {ev.description && <div className="mt-1 text-xs text-gray-600">{ev.description}</div>}
            <div className="mt-2 text-[10px] text-gray-600 dark:text-gray-400">{new Date(ev.occurred_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
