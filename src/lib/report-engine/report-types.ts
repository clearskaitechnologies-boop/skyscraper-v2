// src/lib/report-engine/report-types.ts

export type ReportAudience = "ADJUSTER" | "HOMEOWNER" | "INTERNAL" | "RETAIL";

export type ReportKind =
  | "QUICK"
  | "CLAIMS_READY"
  | "RETAIL_PROPOSAL"
  | "PUBLIC_ADJUSTER"
  | "FORENSIC";

export type ReportSectionStyle =
  | "plain"
  | "technical"
  | "narrative"
  | "bullet";

export interface ReportSection {
  id: string;
  title: string;
  style: ReportSectionStyle;
  audience: ReportAudience;
  content: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
}

export interface GeneratedReport {
  title: string;
  subtitle?: string;
  reportType: ReportKind;
  audience: ReportAudience;
  executiveSummary?: string;
  sections: ReportSection[];
  meta: {
    claimId?: string;
    claimNumber?: string;
    dateOfLoss?: string | null;
    location?: string | null;
    roofType?: string | null;
    totalRequested?: number | null;
    estimateMode?: string | null;
  };
}
