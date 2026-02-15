"use client";
import { useRouter } from "next/navigation";

export function AddToReportButton({
  product,
  claimId,
  estimateId,
  mode,
}: {
  product: {
    id: string;
    vendorId?: string;
    spec?: string;
    warranty?: string;
    color?: string;
    name: string;
  };
  claimId?: string;
  estimateId?: string;
  mode: "claims" | "retail";
}) {
  const router = useRouter();
  async function handleAdd() {
    const payload = {
      productId: product.id,
      vendorId: product.vendorId,
      spec: product.spec,
      warranty: product.warranty,
      color: product.color,
      quantity: 1,
    };

    if (mode === "claims" && claimId) {
      await fetch("/api/claims/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, claimId }),
      });
      router.push(`/reports/claims/new/materials?claimId=${claimId}`);
    } else if (mode === "retail" && estimateId) {
      await fetch("/api/retail/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, estimateId }),
      });
      router.push(`/retail/estimate?estimateId=${estimateId}`);
    }
  }

  return (
    <button
      onClick={handleAdd}
      className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:opacity-90"
    >
      Add to Report
    </button>
  );
}
