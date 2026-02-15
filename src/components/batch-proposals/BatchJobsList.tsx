"use client";

import { CheckCircle, Clock, Eye,Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BatchJob {
  id: string;
  name: string;
  status: string;
  homeCount: number;
  totalPrice: number;
  createdAt: string;
  _count: {
    addresses: number;
    reports: number;
  };
}

export function BatchJobsList() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/batch-proposals")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No batch proposals yet. Create your first one above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/batch-proposals/${job.id}`}
          className="block rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-foreground">{job.name}</h4>
                <StatusBadge status={job.status} />
              </div>
              <div className="mt-2 flex gap-6 text-sm text-muted-foreground">
                <span>{job.homeCount} homes</span>
                <span>${Number(job.totalPrice).toLocaleString()}</span>
                <span>{job._count.reports} reports generated</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Created {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    PENDING_SALES_REVIEW: { icon: Clock, color: "yellow", label: "Pending Review" },
    APPROVED: { icon: CheckCircle, color: "blue", label: "Approved" },
    PROCESSING: { icon: Loader2, color: "purple", label: "Processing", animated: true },
    COMPLETE: { icon: CheckCircle, color: "green", label: "Complete" },
    FAILED: { icon: XCircle, color: "red", label: "Failed" },
  }[status] || { icon: Clock, color: "gray", label: status };

  const Icon = config.icon;

  return (
    <span
      className={`bg- flex items-center gap-1 rounded-full${config.color}-100 text- px-3 py-1 text-xs font-medium${config.color}-800`}
    >
      <Icon className={`h-3 w-3 ${config.animated ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}
