"use client";

export function ClaimScopeTable({ claim_id: claimId }: { claim_id: string }) {
  const items = [
    { category: "Roofing", desc: "Shingle replacement", amount: 12000, status: "Paid" },
    { category: "Interior", desc: "Ceiling paint and drywall", amount: 950, status: "Pending" },
  ];

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-[color:var(--border)] text-[color:var(--muted)]">
          <th className="py-2 text-left">Category</th>
          <th className="py-2 text-left">Description</th>
          <th className="py-2 text-right">Amount</th>
          <th className="py-2 text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr
            key={i}
            className="border-b border-[color:var(--border)] transition hover:bg-[var(--surface-2)]"
          >
            <td className="py-2">{item.category}</td>
            <td className="py-2">{item.desc}</td>
            <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
            <td className="py-2 text-right">{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
