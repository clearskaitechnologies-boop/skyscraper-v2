"use client";

import { ArrowLeft, Loader2, RefreshCw, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/layout/PageHero";
import { MailerJobsList } from "@/components/mailers/MailerJobsList";
import { MailerStatusCard } from "@/components/mailers/MailerStatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MailerBatch {
  id: string;
  template: string;
  selection: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  jobs: MailerJob[];
}

interface MailerJob {
  id: string;
  status: string;
  mailedAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  trackingUrl?: string;
  qrUrl?: string;
  toAddress: any;
}

export default function MailerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchJobId = params?.id as string;

  const [batches, setBatches] = useState<MailerBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchJobId]);

  const fetchBatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/mailers/batches?batchJobId=${batchJobId}`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error("Error fetching mailer batches:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBatches(true);
  };

  const handleExportCsv = (batch: MailerBatch) => {
    const headers = ["Address", "Status", "Mailed At", "Delivered At", "Tracking URL", "QR URL"];
    const rows = batch.jobs.map((job) => [
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

  const handleRetryFailed = async (batch: MailerBatch) => {
    // TODO: Implement retry logic for failed mailers
    alert("Retry failed mailers - Coming soon");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHero
          section="reports"
          title="Mailer Campaign Details"
          subtitle="Track delivery status and performance metrics"
        />
      </div>

      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Send className="mr-2 h-5 w-5" />
                Campaign Summary
              </CardTitle>
              <CardDescription>
                {batches.length} batch{batches.length !== 1 && "es"} sent
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Mailers</p>
              <p className="text-2xl font-bold">
                {batches.reduce((sum, batch) => sum + batch.quantity, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spend</p>
              <p className="text-2xl font-bold">
                ${batches.reduce((sum, batch) => sum + Number(batch.totalPrice), 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {batches.reduce(
                  (sum, batch) => sum + batch.jobs.filter((j) => j.status === "delivered").length,
                  0
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {batches.reduce(
                  (sum, batch) => sum + batch.jobs.filter((j) => j.status === "failed").length,
                  0
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Details */}
      {batches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Mailers Sent Yet</h3>
            <p className="text-muted-foreground">
              Go back to the batch job page to order your first mailer campaign.
            </p>
          </CardContent>
        </Card>
      ) : (
        batches.map((batch) => (
          <div key={batch.id} className="space-y-4">
            <MailerStatusCard batch={batch} onExportCsv={() => handleExportCsv(batch)} />
            <MailerJobsList jobs={batch.jobs} />

            {batch.jobs.some((j) => j.status === "failed") && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => handleRetryFailed(batch)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Failed Mailers
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
