import React from "react";

const COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  open: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  supplement: "bg-purple-100 text-purple-800",
  closed: "bg-gray-200 text-gray-700"
};

export function ClaimStatusBadge({ status }: { status: string }) {
  const cls = COLORS[status] || "bg-gray-100 text-gray-700";
  return <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${cls}`}>{status}</span>;
}
