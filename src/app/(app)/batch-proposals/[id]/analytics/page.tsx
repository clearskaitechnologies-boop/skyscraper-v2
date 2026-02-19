"use client";

import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AttributionTable } from "@/components/analytics/AttributionTable";
import { ConversionFunnel } from "@/components/analytics/ConversionFunnel";
import { QrStatsCard } from "@/components/analytics/QrStatsCard";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const batchJobId = params?.id as string;

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchJobId]);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/analytics/batch?batchJobId=${batchJobId}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      logger.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics(true);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHero
            section="reports"
            title="Campaign Analytics"
            subtitle="Track QR performance, conversions, and revenue attribution"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {analytics && (
        <>
          <QrStatsCard stats={analytics.qrStats} batchJobId={batchJobId} />
          <ConversionFunnel stages={analytics.funnelStages} batchJobId={batchJobId} />
          <AttributionTable attributions={analytics.attributions} batchJobId={batchJobId} />
        </>
      )}
    </div>
  );
}
