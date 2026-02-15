"use client";

import { getPricingTiers } from "@/lib/pricing/batchProposalPricing";

export function PricingTable() {
  const tiers = getPricingTiers();

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Homes</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Price / Home
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Total Price
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tier</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tiers.map((tier, idx) => (
            <tr key={tier.homes} className={idx % 2 === 0 ? "bg-background" : "bg-muted/50"}>
              <td className="px-6 py-4 text-sm font-medium text-foreground">{tier.homes}</td>
              <td className="px-6 py-4 text-sm text-foreground">${tier.pricePerHome}</td>
              <td className="px-6 py-4 text-sm font-semibold text-foreground">
                ${tier.total.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                {tier.tier > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Save ${20 - tier.pricePerHome}/home
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
