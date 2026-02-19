"use client";

import { ArrowLeft, CheckCircle2, Download, FileText, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface ProposalStatusPageProps {
  params: {
    id: string;
  };
}

export default function ProposalStatusPage({ params }: ProposalStatusPageProps) {
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProposal();

    // Poll every 2 seconds if generating
    const interval = setInterval(() => {
      if (proposal?.status === "generating") {
        fetchProposal();
      }
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, proposal?.status]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}/status`);
      if (!res.ok) throw new Error("Failed to fetch proposal");

      const data = await res.json();
      setProposal(data);
      setLoading(false);
    } catch (err) {
      logger.error("Failed to fetch proposal:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[color:var(--muted)]" />
        </div>
      </PageContainer>
    );
  }

  if (error || !proposal) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <XCircle className="mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-[color:var(--text)]">
            Proposal Not Found
          </h2>
          <p className="mb-6 text-[color:var(--muted)]">
            {error || "This proposal does not exist"}
          </p>
          <Link href="/proposals">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Proposals
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const getStatusIcon = () => {
    switch (proposal.status) {
      case "generating":
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case "ready":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "failed":
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8 text-[color:var(--muted)]" />;
    }
  };

  const getStatusBadge = () => {
    switch (proposal.status) {
      case "generating":
        return <Badge className="bg-blue-600 text-white">Generating</Badge>;
      case "ready":
        return <Badge className="bg-green-600 text-white">Ready</Badge>;
      case "failed":
        return <Badge className="bg-red-600 text-white">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageHero
          section="reports"
          title={proposal.project_name}
          subtitle={proposal.property_address}
        />
        <Link href="/proposals">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-8">
          {/* Status Icon */}
          <div className="mb-8 flex flex-col items-center text-center">
            {getStatusIcon()}
            <h2 className="mb-2 mt-4 text-2xl font-semibold text-[color:var(--text)]">
              {proposal.status === "generating" && "Generating Your Proposal"}
              {proposal.status === "ready" && "Proposal Ready!"}
              {proposal.status === "failed" && "Generation Failed"}
              {!["generating", "ready", "failed"].includes(proposal.status) && "Processing"}
            </h2>
            {getStatusBadge()}
          </div>

          {/* Generating State */}
          {proposal.status === "generating" && (
            <div className="space-y-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-[color:var(--surface-3)]">
                <div className="h-full w-2/3 animate-pulse bg-blue-500 transition-all" />
              </div>
              <p className="text-center text-sm text-[color:var(--muted)]">
                AI is generating your proposal content...
                <br />
                This may take 30-60 seconds.
              </p>
            </div>
          )}

          {/* Ready State */}
          {proposal.status === "ready" && (
            <div className="space-y-4">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-3)] p-4">
                  <p className="mb-1 text-xs text-[color:var(--muted)]">Sections Generated</p>
                  <p className="text-2xl font-semibold text-[color:var(--text)]">
                    {JSON.parse(proposal.generated_content || "{}").sections?.length || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-3)] p-4">
                  <p className="mb-1 text-xs text-[color:var(--muted)]">Tokens Used</p>
                  <p className="text-2xl font-semibold text-[color:var(--text)]">
                    {proposal.tokens_used?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => window.open(`/api/proposals/${proposal.id}/download`, "_blank")}
              >
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
            </div>
          )}

          {/* Failed State */}
          {proposal.status === "failed" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">
                  {proposal.error_message || "An unknown error occurred during generation"}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/proposals")}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 border-t border-[color:var(--border)] pt-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="mb-1 text-[color:var(--muted)]">Loss Type</dt>
                <dd className="font-medium text-[color:var(--text)]">
                  {proposal.loss_type || "General"}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-[color:var(--muted)]">Created</dt>
                <dd className="font-medium text-[color:var(--text)]">
                  {new Date(proposal.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
