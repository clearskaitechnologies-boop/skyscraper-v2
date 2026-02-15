import { TradePartnerCard } from "@/components/portal/TradePartnerCard";
import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function TradesPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  // Note: contractors model doesn't have orgId field
  const partners = await prisma.contractors.findMany({
    orderBy: { company_name: "asc" },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Recommended Partners</h1>
      {partners.length === 0 && <p className="text-sm text-gray-500">No partners published yet.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partners.map((tp) => (
          <TradePartnerCard
            key={tp.id}
            name={tp.company_name || "Unknown"}
            serviceType={tp.trade}
            description={tp.description}
            websiteUrl={tp.website}
            phone={undefined}
            email={tp.contact_email}
          />
        ))}
      </div>
    </div>
  );
}
