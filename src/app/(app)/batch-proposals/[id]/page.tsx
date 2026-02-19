"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  MapPin,
  Send,
  TrendingUp,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/layout/PageHero";
import { MailerStatusCard } from "@/components/mailers/MailerStatusCard";
import { OrderMailersModal } from "@/components/mailers/OrderMailersModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { logger } from "@/lib/logger";

interface BatchJob {
  id: string;
  name: string;
  status: string;
  homeCount: number;
  pricePerHome: number;
  totalPrice: number;
  stormType: string;
  manufacturer: string;
  processedCount: number;
  errorCount: number;
  createdAt: string;
  approvedAt?: string;
  startedAt?: string;
  completedAt?: string;
  addresses: Address[];
  reports: Report[];
}

interface Address {
  id: string;
  rawAddress: string;
  normalizedAddress?: string;
  status: string;
  stormImpactScore?: number;
  reportUrl?: string;
  errorMessage?: string;
}

function parseMailingAddress(address: string): {
  property_street: string;
  property_city: string;
  property_state: string;
  property_zip: string;
} {
  // Expected: "123 Main St, Austin, TX 78701" (zip optional)
  const m = address.match(/^\s*(.+?),\s*([^,]+),\s*([A-Za-z]{2})\s*(\d{5}(?:-\d{4})?)?\s*$/);
  if (!m) {
    return {
      property_street: address,
      property_city: "",
      property_state: "",
      property_zip: "",
    };
  }

  return {
    property_street: m[1] ?? address,
    property_city: m[2] ?? "",
    property_state: (m[3] ?? "").toUpperCase(),
    property_zip: m[4] ?? "",
  };
}

interface Report {
  id: string;
  type: string;
  pdfUrl?: string;
}

export default function BatchJobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<BatchJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showMailerModal, setShowMailerModal] = useState(false);
  const [mailerBatches, setMailerBatches] = useState<any[]>([]);

  useEffect(() => {
    fetchJob();
    fetchMailerBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/batch-proposals/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      }
    } catch (error) {
      logger.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMailerBatches = async () => {
    try {
      const res = await fetch(`/api/mailers/batches?batchJobId=${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setMailerBatches(data.batches || []);
      }
    } catch (error) {
      logger.error("Error fetching mailer batches:", error);
    }
  };

  const handleMailerSuccess = () => {
    fetchMailerBatches();
  };

  const handleExportCsv = (batch: any) => {
    // Generate CSV from batch jobs
    const headers = ["Address", "Status", "Mailed At", "Delivered At", "Tracking URL", "QR URL"];
    const rows = batch.jobs.map((job: any) => [
      `"${job.toAddress.address_line1}, ${job.toAddress.address_city}, ${job.toAddress.address_state} ${job.toAddress.address_zip}"`,
      job.status,
      job.mailedAt || "",
      job.deliveredAt || "",
      job.trackingUrl || "",
      job.qrUrl || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mailer-delivery-report-${batch.id}.csv`;
    a.click();
  };

  const handleManualProcess = async () => {
    setProcessing(true);
    try {
      await fetch(`/api/batch-proposals/${jobId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchJobId: jobId }),
      });

      // Poll for updates
      const interval = setInterval(fetchJob, 3000);
      setTimeout(() => clearInterval(interval), 60000);
    } catch (error) {
      logger.error("Error processing job:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <PageHero
          section="reports"
          title="Batch Job Not Found"
          subtitle="The requested batch proposal could not be found."
        />
      </div>
    );
  }

  const progress = (job.processedCount / job.homeCount) * 100;
  const statusConfig = getStatusConfig(job.status);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <PageHero
        section="reports"
        title={job.name}
        subtitle={`${job.homeCount} homes • ${job.stormType} • ${job.manufacturer}`}
      />

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Processing {job.homeCount} addresses</CardDescription>
            </div>
            <Badge className={statusConfig.className}>
              {statusConfig.icon}
              <span className="ml-2">{statusConfig.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {job.processedCount} / {job.homeCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="text-2xl font-bold">${Number(job.totalPrice).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{job.processedCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-red-600">{job.errorCount}</p>
            </div>
          </div>

          {job.status === "APPROVED" && (
            <Button onClick={handleManualProcess} disabled={processing} className="w-full">
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Processing Now"
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Mailer Fulfillment */}
      {job.status === "COMPLETE" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Print + Mail Campaign
                </CardTitle>
                <CardDescription>Send postcards or letters to addresses</CardDescription>
              </div>
              <Button onClick={() => setShowMailerModal(true)}>
                <Send className="mr-2 h-4 w-4" />
                Order Mailers
              </Button>
            </div>
          </CardHeader>
          {mailerBatches.length > 0 && (
            <CardContent className="space-y-4">
              {mailerBatches.map((batch) => (
                <MailerStatusCard
                  key={batch.id}
                  batch={batch}
                  onExportCsv={() => handleExportCsv(batch)}
                />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      <OrderMailersModal
        open={showMailerModal}
        onOpenChange={setShowMailerModal}
        batchJobId={jobId}
        addresses={job.addresses.map((a) => ({
          id: a.id,
          ...parseMailingAddress(a.normalizedAddress || a.rawAddress),
        }))}
        onSuccess={handleMailerSuccess}
      />

      {/* Reports */}
      {job.reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center">
                    <FileText className="mr-3 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">{report.type} Report</p>
                      <p className="text-sm text-muted-foreground">PDF Generated</p>
                    </div>
                  </div>
                  {report.pdfUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Addresses ({job.addresses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {job.addresses.map((address) => (
              <AddressRow key={address.id} address={address} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddressRow({ address }: { address: Address }) {
  const statusConfig = getAddressStatusConfig(address.status);

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50">
      <div className="flex flex-1 items-center">
        <div className={`mr-3 ${statusConfig.color}`}>{statusConfig.icon}</div>
        <div className="flex-1">
          <p className="font-medium">{address.normalizedAddress || address.rawAddress}</p>
          {address.errorMessage && <p className="text-sm text-red-600">{address.errorMessage}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {address.stormImpactScore !== undefined && (
          <div className="flex items-center">
            <TrendingUp className="mr-1 h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">{address.stormImpactScore.toFixed(0)}</span>
          </div>
        )}
        {address.reportUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a
              href={address.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View Report"
            >
              <FileText className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function getStatusConfig(status: string) {
  const configs: Record<string, any> = {
    PENDING_SALES_REVIEW: {
      label: "Pending Review",
      icon: <Clock className="h-4 w-4" />,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    APPROVED: {
      label: "Approved",
      icon: <CheckCircle className="h-4 w-4" />,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    PROCESSING: {
      label: "Processing",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    },
    COMPLETE: {
      label: "Complete",
      icon: <CheckCircle className="h-4 w-4" />,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    FAILED: {
      label: "Failed",
      icon: <AlertCircle className="h-4 w-4" />,
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  };

  return configs[status] || configs.PENDING_SALES_REVIEW;
}

function getAddressStatusConfig(status: string) {
  const configs: Record<string, any> = {
    PENDING: {
      icon: <Clock className="h-4 w-4" />,
      color: "text-gray-400",
    },
    PROCESSING: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: "text-blue-600",
    },
    COMPLETE: {
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
    },
    ERROR: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-red-600",
    },
  };

  return configs[status] || configs.PENDING;
}
