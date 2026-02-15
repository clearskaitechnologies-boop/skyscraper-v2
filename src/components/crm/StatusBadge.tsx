/**
 * Status badge component for CRM views
 */
export function StatusBadge({ value }: { value?: string }) {
  const v = (value || "draft").toLowerCase();
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    in_review: "bg-amber-100 text-amber-800",
    approved_pending: "bg-emerald-100 text-emerald-700",
    closed: "bg-emerald-200 text-emerald-900",
    archived: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[v] || map.draft}`}>
      {v.replace("_", " ")}
    </span>
  );
}
