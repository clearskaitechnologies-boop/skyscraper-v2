// components/reports/ClaimSelector.tsx
"use client";

import { usePathname,useRouter } from "next/navigation";

interface ClaimOption {
  id: string;
  claimNumber: string | null;
  propertyAddress: string | null;
  dateOfLoss: Date | null;
}

interface ClaimSelectorProps {
  claims: ClaimOption[];
  selectedClaimId: string;
}

export function ClaimSelector({ claims, selectedClaimId }: ClaimSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (claimId: string) => {
    router.push(`${pathname}?claimId=${claimId}`);
  };

  return (
    <select
      value={selectedClaimId}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
      aria-label="Select claim"
    >
      {claims.map((claim) => (
        <option key={claim.id} value={claim.id}>
          {claim.claimNumber || claim.id.slice(0, 8)} - {claim.propertyAddress || "No address"}
        </option>
      ))}
    </select>
  );
}
