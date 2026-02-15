"use client";

import { useMemo, useState } from "react";

type ClaimDetail = {
  id: string;
  claimNumber: string | null;
  insured_name: string | null;
  status: string | null;
  carrier: string | null;
  rcvTotal: number | null;
  acvTotal: number | null;
  deductible?: number | null;
  city: string | null;
  state: string | null;
  postalCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  source?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type AIReport = {
  id: string;
  reportType: string | null;
  status: string | null;
  pdfUrl: string | null;
  createdAt: string | Date;
};

type Document = {
  id: string;
  type: string | null;
  title: string | null;
  publicUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string | Date;
};

type Props = {
  claim: ClaimDetail;
  aiReports?: AIReport[];
  documents?: Document[];
};

type TabId = "overview" | "financials" | "timeline";

export function ClaimDetailClient({ claim, aiReports = [], documents = [] }: Props) {
  const [tab, setTab] = useState<TabId>("overview");

  const location = useMemo(() => {
    const parts = [
      claim.addressLine1,
      claim.addressLine2,
      [claim.city, claim.state].filter(Boolean).join(", "),
      claim.postalCode,
    ]
      .filter(Boolean)
      .join(" · ");
    return parts || "Not set";
  }, [claim]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* PHASE 3: Portal origin badge */}
      {claim.source === "portal" && (
        <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Created from Client Portal
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-300">
                This work request was submitted by the homeowner through the client portal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top summary cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Status" value={claim.status ?? "UNASSIGNED"} />
        <SummaryCard label="Carrier" value={claim.carrier ?? "Unknown"} />
        <SummaryCard
          label="RCV / ACV"
          value={`${formatCurrency(claim.rcvTotal)} / ${formatCurrency(claim.acvTotal)}`}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4 text-sm">
          <TabButton id="overview" current={tab} onClick={setTab}>
            Overview
          </TabButton>
          <TabButton id="financials" current={tab} onClick={setTab}>
            Financials
          </TabButton>
          <TabButton id="timeline" current={tab} onClick={setTab}>
            Timeline
          </TabButton>
        </nav>
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Insured & Property</h2>
            <dl className="grid gap-2 text-sm">
              <Row label="Insured">{claim.insured_name ?? "Not set"}</Row>
              <Row label="Claim #">{claim.claimNumber ?? "Not set"}</Row>
              <Row label="Location">{location}</Row>
              <Row label="Created">{formatDate(claim.createdAt) ?? "Unknown"}</Row>
              <Row label="Last Updated">{formatDate(claim.updatedAt) ?? "Unknown"}</Row>
            </dl>
          </div>

          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Next Steps</h2>
            <p className="mb-2">
              This panel will soon show AI-recommended next actions for this claim — inspections,
              supplements, follow-up calls, and more.
            </p>
            <p>
              For now, use this page to keep an eye on status and financials while we finish wiring
              in reports, weather, and carrier correspondence.
            </p>
          </div>
        </div>
      )}

      {tab === "financials" && (
        <div className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Financial Summary</h2>
            <dl className="grid gap-2 text-sm">
              <Row label="RCV">{formatCurrency(claim.rcvTotal)}</Row>
              <Row label="ACV">{formatCurrency(claim.acvTotal)}</Row>
              <Row label="Deductible">{formatCurrency(claim.deductible ?? null) || "Not set"}</Row>
              <Row label="Net To Homeowner">
                {formatCurrency(
                  (claim.rcvTotal ?? 0) -
                    (claim.deductible ?? 0) -
                    ((claim.rcvTotal ?? 0) - (claim.acvTotal ?? 0))
                )}
              </Row>
            </dl>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Documents & Reports</h2>
            {aiReports.length === 0 && documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents or AI reports yet. Upload photos and generate reports to see them here.
              </p>
            ) : (
              <div className="space-y-3">
                {aiReports.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-medium text-muted-foreground">AI Reports</h3>
                    <div className="space-y-1.5">
                      {aiReports.map((report) => (
                        <a
                          key={report.id}
                          href={report.pdfUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded border bg-background p-2 text-sm hover:bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">📄</span>
                            <span className="font-medium">{report.reportType || "Report"}</span>
                            <span className="text-xs text-muted-foreground">({report.status})</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {documents.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-medium text-muted-foreground">Documents</h3>
                    <div className="space-y-1.5">
                      {documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.publicUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded border bg-background p-2 text-sm hover:bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">📎</span>
                            <span className="font-medium">{doc.title || "Document"}</span>
                            {doc.fileSize && (
                              <span className="text-xs text-muted-foreground">
                                ({formatFileSize(doc.fileSize)})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.createdAt)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Activity Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Timeline events (inspections, calls, emails, payments, and AI actions) will appear here.
            For now, this is a placeholder so your demo has a clear place to talk through the story
            of the claim.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm text-foreground">{children}</dd>
    </div>
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TabButton({
  id,
  current,
  onClick,
  children,
}: {
  id: TabId;
  current: TabId;
  onClick: (id: TabId) => void;
  children: React.ReactNode;
}) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`border-b-2 px-1.5 py-2 transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      } text-xs md:text-sm`}
    >
      {children}
    </button>
  );
}
