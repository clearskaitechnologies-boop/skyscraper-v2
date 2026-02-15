import React, { useEffect, useState } from "react";

type ReportRow = {
  id: string;
  template: string;
  status: string;
  created_at: string;
  cost_cents: number;
  signed_url?: string;
};

export default function ReportDashboard() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?page=${page}&pageSize=20`);
        const json = await res.json();
        setReports(json.items || []);
      } catch (e) {
        console.error("fetch reports failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Report Dashboard</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left">Template</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created At</th>
              <th className="p-2 text-left">Cost</th>
              <th className="p-2 text-left">Download</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.template}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">${(r.cost_cents / 100).toFixed(2)}</td>
                <td className="p-2">
                  {r.signed_url ? (
                    <a className="text-blue-600" href={r.signed_url}>
                      Download
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="mr-2 rounded bg-gray-200 p-2"
        >
          Prev
        </button>
        <button onClick={() => setPage((p) => p + 1)} className="rounded bg-gray-200 p-2">
          Next
        </button>
      </div>
    </div>
  );
}
