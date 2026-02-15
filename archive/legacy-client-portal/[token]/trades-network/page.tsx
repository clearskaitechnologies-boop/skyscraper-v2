import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function TradesNetworkPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  // For MVP show all trade partners for org
  const partners = await prisma.trade_partners.findMany({ where: { orgId: tokenData.orgId }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Trusted Trade Partners</h1>
      {partners.length === 0 && <p className="text-sm text-muted-foreground">No partners published yet.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partners.map(tp => (
          <div key={tp.id} className="border rounded p-4 flex flex-col gap-2 bg-white">
            <div className="font-medium truncate">{tp.name}</div>
            {tp.serviceType && <div className="text-xs text-muted-foreground">{tp.serviceType}</div>}
            {tp.description && <div className="text-xs line-clamp-3 text-muted-foreground">{tp.description}</div>}
            <div className="flex flex-wrap gap-2 text-xs pt-2">
              {tp.websiteUrl && <a href={tp.websiteUrl} target="_blank" className="underline">Website</a>}
              {tp.phone && <a href={`tel:${tp.phone}`} className="underline">Call</a>}
              {tp.email && <a href={`mailto:${tp.email}`} className="underline">Email</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
