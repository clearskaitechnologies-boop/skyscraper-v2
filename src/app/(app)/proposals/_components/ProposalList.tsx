"use client";

import { CheckCircle2, Clock,Download, FileText, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Proposal {
  id: string;
  projectName: string;
  status: "generating" | "ready" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

interface ProposalListProps {
  proposals: Proposal[];
}

export function ProposalList({ proposals }: ProposalListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generating":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-[color:var(--muted)]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "generating":
        return <Badge className="bg-blue-600 text-white">Generating</Badge>;
      case "ready":
        return <Badge className="bg-green-600 text-white">Ready</Badge>;
      case "failed":
        return <Badge className="bg-red-600 text-white">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-6">
      <div className="mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-[color:var(--text)]" />
        <h2 className="text-xl font-semibold text-[color:var(--text)]">Recent Proposals</h2>
      </div>

      {proposals.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-[color:var(--muted)] opacity-50" />
          <p className="text-sm text-[color:var(--muted)]">
            No proposals yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Link key={proposal.id} href={`/proposals/${proposal.id}`} className="block">
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-3)] p-4 transition hover:bg-[color:var(--surface-4)]">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(proposal.status)}
                    <h3 className="truncate text-sm font-medium text-[color:var(--text)]">
                      {proposal.projectName}
                    </h3>
                  </div>
                  {getStatusBadge(proposal.status)}
                </div>

                <p className="mb-3 text-xs text-[color:var(--muted)]">
                  Created {new Date(proposal.createdAt).toLocaleDateString()}
                </p>

                {proposal.status === "ready" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      // Download PDF
                      window.open(`/api/proposals/${proposal.id}/download`, "_blank");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}

                {proposal.status === "generating" && (
                  <div className="w-full">
                    <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface-4)]">
                      <div className="h-full w-2/3 animate-pulse bg-blue-500" />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
