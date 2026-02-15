import { format } from "date-fns";
import { Download, FileText } from "lucide-react";

import prisma from "@/lib/prisma";

interface ClientAIReportsCardProps {
  claimId: string;
}

/**
 * Phase 3: Display AI-generated reports (read-only) for portal users
 * Shows AI reports with PDF downloads if available
 */
export async function ClientAIReportsCard({ claimId }: ClientAIReportsCardProps) {
  // Load AI reports for this claim
  const aiReports = await prisma.ai_reports.findMany({
    where: { claimId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (aiReports.length === 0) {
    return null; // Don't show empty section
  }

  // Load PDFs for these reports from FileAsset
  const reportPDFs = await prisma.file_assets.findMany({
    where: {
      claimId,
      category: {
        in: ["weather", "rebuttal", "depreciation", "supplement"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map reports to their PDFs
  const reportPDFMap = new Map<string, (typeof reportPDFs)[0]>();
  for (const pdf of reportPDFs) {
    reportPDFMap.set(pdf.category.toUpperCase(), pdf);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <h2 className="text-lg font-semibold text-slate-900">AI Insights</h2>
      <p className="mt-1 text-sm text-slate-600">Automated reports and analysis for your claim</p>

      <div className="mt-4 space-y-3">
        {aiReports.map((report) => {
          const reportTypeCaps = report.type.toUpperCase();
          const hasPDF = reportPDFMap.has(reportTypeCaps);
          const pdf = reportPDFMap.get(reportTypeCaps);

          return (
            <div key={report.id} className="rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-medium capitalize text-slate-900">
                      {report.type.replace(/_/g, " ")} Report
                    </h3>
                  </div>
                  {report.content && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{report.content}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Generated {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </p>
                </div>

                {hasPDF && pdf && (
                  <a
                    href={pdf.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 flex items-center gap-1 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    title={`Download ${pdf.filename}`}
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
