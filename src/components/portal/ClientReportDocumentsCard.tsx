/**
 * CLIENT REPORT DOCUMENTS CARD
 * Shows finalized/submitted reports to homeowners in client portal
 * View-only access with PDF download
 */

"use client";

import { CheckCircle, Download, FileText, Loader2,Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ClientReportDocumentsCardProps {
  claimId: string;
  claimNumber: string | null;
}

interface ReportData {
  id: string;
  status: string;
  version: number;
  pdfUrl: string | null;
  finalizedAt: string | null;
  submittedAt: string | null;
  updatedAt: string;
}

export function ClientReportDocumentsCard({
  claimId,
  claimNumber,
}: ClientReportDocumentsCardProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Feature flag check
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_UNIVERSAL_REPORTS === "true";

  useEffect(() => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/claims/${claimId}/report`);

        if (response.status === 404) {
          // No report exists
          setReport(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }

        const data = await response.json();

        // Only show finalized or submitted reports
        if (data.status === "finalized" || data.status === "submitted") {
          setReport(data);
        } else {
          setReport(null);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        // Silently fail - no report to show
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [claimId, isEnabled]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/report/pdf`);

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `claim-${claimNumber || claimId}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  // Don't render if feature disabled
  if (!isEnabled) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-600">Loading reports...</span>
        </div>
      </Card>
    );
  }

  // No report or draft only
  if (!report) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-neutral-500">
          <FileText className="h-5 w-5" />
          <div>
            <h3 className="font-medium text-neutral-700">Property Report</h3>
            <p className="text-sm text-neutral-500">
              Your detailed property report will appear here once it's finalized.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Show report
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Universal Claims Report</h3>
              <p className="text-sm text-neutral-600">Claim #{claimNumber || claimId}</p>
            </div>
          </div>

          {/* Status Badge */}
          {report.status === "finalized" && (
            <Badge variant="default" className="bg-blue-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Finalized
            </Badge>
          )}
          {report.status === "submitted" && (
            <Badge variant="default" className="bg-green-600">
              <Lock className="mr-1 h-3 w-3" />
              Submitted to Carrier
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Version:</span>
            <span className="font-medium text-neutral-900">{report.version}</span>
          </div>
          {report.finalizedAt && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Finalized:</span>
              <span className="font-medium text-neutral-900">
                {new Date(report.finalizedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          {report.submittedAt && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Submitted:</span>
              <span className="font-medium text-neutral-900">
                {new Date(report.submittedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-600">Last Updated:</span>
            <span className="font-medium text-neutral-900">
              {new Date(report.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            variant="default"
            className="w-full"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF Report
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-neutral-500">
          This report contains a detailed analysis of your property, including damage assessment,
          weather verification, and professional recommendations.
        </p>
      </div>
    </Card>
  );
}
