"use client";
import { useEffect, useState } from "react";

type Report = {
  id: string;
  address: string;
  date_of_loss: string;
  roof_type: string;
  roof_sqft: number | null;
  pdf_path: string;
  created_at: string;
};

export default function RecentReportsTable() {
  const [data, setData] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p = 1) {
    setLoading(true);
    const res = await fetch(`/api/reports/list?page=${p}&pageSize=10`, { cache: "no-store" });
    const json = await res.json();
    setData(json.data);
    setPage(json.page);
    setTotalPages(json.totalPages);
    setLoading(false);
  }

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Reports</h2>
        <div className="text-sm text-neutral-500">
          Page {page} / {totalPages}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">DOL</th>
              <th className="px-3 py-2">Roof</th>
              <th className="px-3 py-2">Sqft</th>
              <th className="px-3 py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                  No reports yet.
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.address}</td>
                  <td className="px-3 py-2">{new Date(r.date_of_loss).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{r.roof_type}</td>
                  <td className="px-3 py-2">{r.roof_sqft ?? "-"}</td>
                  <td className="px-3 py-2">
                    <a className="text-blue-600 underline" href={r.pdf_path} target="_blank">
                      Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => load(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border px-3 py-1.5 disabled:opacity-50"
        >
          ← Prev
        </button>
        <button
          onClick={() => load(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-md border px-3 py-1.5 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
