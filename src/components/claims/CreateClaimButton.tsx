"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PaywallModal } from "@/components/billing/PaywallModal";
import { Button } from "@/components/ui/button";
import { useBillingStatus } from "@/hooks/useBillingStatus";

interface CreateClaimButtonProps {
  className?: string;
}

export function CreateClaimButton({ className }: CreateClaimButtonProps) {
  const router = useRouter();
  const [showPaywall, setShowPaywall] = useState(false);
  const { status } = useBillingStatus();

  const handleClick = () => {
    // Check if user is limited before allowing claim creation
    if (status?.isLimited) {
      setShowPaywall(true);
      return;
    }
    router.push("/claims/new");
  };

  return (
    <>
      <Button onClick={handleClick} className={className}>
        New Claim
      </Button>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="claim creation"
        currentPlan={status?.plan}
        usage={{
          used: status?.claimsUsed || 0,
          limit: status?.claimsLimit || 3,
          type: "claims this month",
        }}
      />
    </>
  );
}
