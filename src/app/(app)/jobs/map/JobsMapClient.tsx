"use client";

import { Briefcase, Calendar, DollarSign, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { JobPin } from "./actions";

export default function JobsMapClient({ jobs }: { jobs: JobPin[] }) {
  const [selectedJob, setSelectedJob] = useState<JobPin | null>(null);
  const [filter, setFilter] = useState<"all" | "job" | "project" | "claim">("all");

  const filteredJobs = filter === "all" ? jobs : jobs.filter((j) => j.type === filter);

  function getStatusColor(status: string) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("lead")) return "bg-blue-500";
    if (statusLower.includes("approved") || statusLower.includes("sold")) return "bg-green-500";
    if (statusLower.includes("pending") || statusLower.includes("qualified"))
      return "bg-yellow-500";
    if (statusLower.includes("progress") || statusLower.includes("production"))
      return "bg-orange-500";
    return "bg-[var(--surface-2)]";
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Map Placeholder */}
      <div className="lg:col-span-2">
        <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] shadow-sm">
          <div className="flex h-[600px] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-md text-center">
              <MapPin className="mx-auto h-16 w-16 text-blue-600" />
              <h3 className="mt-4 text-lg font-medium text-[color:var(--text)]">
                Interactive Jobs Map
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                Configure{" "}
                <code className="rounded bg-[var(--surface-2)] px-1 py-0.5">
                  NEXT_PUBLIC_MAPBOX_TOKEN
                </code>{" "}
                to see all jobs plotted on an interactive map.
              </p>
              <p className="mt-4 text-xs text-slate-700 dark:text-slate-300">
                {filteredJobs.length} jobs ready to display.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Job List */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">
              Jobs ({filteredJobs.length})
            </h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="rounded-md border border-[color:var(--border)] px-2 py-1 text-sm"
              aria-label="Filter jobs by type"
            >
              <option value="all">All</option>
              <option value="job">Jobs</option>
              <option value="project">Projects</option>
              <option value="claim">Claims</option>
            </select>
          </div>

          <div className="max-h-[540px] space-y-3 overflow-y-auto">
            {filteredJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                  selectedJob?.id === job.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-[color:var(--border)] bg-[var(--surface-1)] hover:border-[color:var(--border)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${getStatusColor(job.status)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      <div className="truncate font-medium text-[color:var(--text)]">
                        {job.name}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                      {job.address}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block rounded-full bg-[var(--surface-1)] px-2 py-0.5 text-[10px] font-medium capitalize text-[color:var(--text)]">
                        {job.type}
                      </span>
                      <span className="inline-block rounded-full bg-[var(--surface-1)] px-2 py-0.5 text-[10px] font-medium capitalize text-[color:var(--text)]">
                        {job.status.replace(/_/g, " ")}
                      </span>
                      {job.value && (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                          ${job.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {filteredJobs.length === 0 && (
              <div className="rounded-lg bg-[var(--surface-2)] p-4 text-center text-sm text-slate-700 dark:text-slate-300">
                No {filter !== "all" ? filter + "s" : "jobs"} to display
              </div>
            )}
          </div>
        </div>

        {/* Selected Job Details */}
        {selectedJob && (
          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-[color:var(--text)]">{selectedJob.name}</h4>
            </div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">{selectedJob.address}</p>

            {selectedJob.value && (
              <div className="mb-2 flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Value: ${selectedJob.value.toLocaleString()}</span>
              </div>
            )}

            {selectedJob.scheduledDate && (
              <div className="mb-3 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{new Date(selectedJob.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button asChild className="flex-1 bg-sky-600 hover:bg-sky-700">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions
                </a>
              </Button>
              <button
                onClick={() =>
                  (window.location.href =
                    selectedJob.type === "project"
                      ? `/projects/${selectedJob.id}`
                      : `/jobs/${selectedJob.id}`)
                }
                className="flex-1 rounded-md border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm font-medium text-[color:var(--text)] hover:bg-[var(--surface-2)]"
              >
                View Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
