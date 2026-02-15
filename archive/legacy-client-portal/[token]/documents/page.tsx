import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function DocumentsPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  const docs = await prisma.claim_documents.findMany({ where: { claimId: tokenData.claimId, visibleToClient: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Documents</h1>
      {docs.length === 0 && <p className="text-sm text-muted-foreground">No documents visible yet.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map(d => (
          <a key={d.id} href={d.url} target="_blank" className="border rounded p-3 hover:bg-muted/40 transition">
            <div className="text-sm font-medium truncate">{d.title}</div>
            {d.type && <div className="text-[11px] text-muted-foreground mt-1">{d.type}</div>}
          </a>
        ))}
      </div>
    </div>
  );
}
