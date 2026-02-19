"use client";

/**
 * /claims/[claimId]/reports - Reports tab for specific claim
 * Lists all Report records tied to this claim
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, Eye, Trash2, Plus, Loader2 } from "lucide-react";

interface Report {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  pdfUrl?: string;
}

export default function ClaimReportsPage({ params }: { params: { claimId: string } }) {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, [params.claimId]);

  async function fetchReports() {
    try {
      const res = await fetch(`/api/reports/save?claimId=${params.claimId}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReport(reportId: string) {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await fetch(`/api/reports/view/${reportId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete report");
      
      // Refresh list
      fetchReports();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      adjuster_packet: "Adjuster Packet",
      inspection_report: "Inspection Report",
      homeowner_report: "Homeowner Summary",
      internal_summary: "Internal Notes",
    };
    return labels[type] || type;
  };

  const getReportTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      adjuster_packet: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      inspection_report: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      homeowner_report: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      internal_summary: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-generated inspection reports, adjuster packets, and summaries
          </p>
        </div>
        <button
          onClick={() => router.push(`/reports/builder?claimId=${params.claimId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Report
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No reports yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first report using the AI Report Builder
          </p>
          <button
            onClick={() => router.push(`/reports/builder?claimId=${params.claimId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Report
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getReportTypeBadgeColor(
                        report.type
                      )}`}
                    >
                      {getReportTypeLabel(report.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {report.title}
                    </div>
                    {report.subtitle && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {report.subtitle}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {report.createdBy.name || report.createdBy.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/reports/${report.id}`)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="View report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {report.pdfUrl && (
                        <button
                          onClick={() => window.open(report.pdfUrl, "_blank")}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
