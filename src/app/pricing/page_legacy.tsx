import { BadgeDollarSign } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <EmptyState
        title="Pricing"
        description="Explore plan tiers. Full pricing matrix launches soon; page kept live to avoid navigation dead links."
        icon={<BadgeDollarSign className="h-12 w-12 text-primary" />}
      />
    </main>
  );
}
