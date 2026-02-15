import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function MessagesPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  const msgs = await prisma.client_messages.findMany({ where: { claimId: tokenData.claimId, visibleToClient: true }, orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Messages</h1>
      {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
      <ul className="space-y-2">
        {msgs.map(m => (
          <li key={m.id} className={`rounded p-3 border ${m.senderType === 'contractor' ? 'bg-muted/50' : 'bg-white'}`}> 
            <div className="text-xs text-muted-foreground mb-1">{m.senderType === 'contractor' ? 'Contractor' : 'You'}</div>
            <div className="text-sm">{m.body}</div>
            <div className="text-[10px] mt-1 text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Two-way messaging input coming in Phase 2.</p>
    </div>
  );
}
