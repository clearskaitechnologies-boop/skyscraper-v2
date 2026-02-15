// components/pdf/RetailReportPDF.tsx

import { Document, Page } from "@react-pdf/renderer";

import { ReportData, ReportSectionId } from "@/lib/reports/types";

import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import { AiDamageSection } from "./sections/AiDamageSection";
import { AiSummaryRetailSection } from "./sections/AiSummaryRetailSection";
import { ClientSnapshotSection } from "./sections/ClientSnapshotSection";
import { CoverPage } from "./sections/CoverPage";
import { MapsAndPhotosSection } from "./sections/MapsAndPhotosSection";
import { MaterialsSection } from "./sections/MaterialsSection";
import { RetailPricingSection } from "./sections/RetailPricingSection";
import { RetailSignatureSection } from "./sections/RetailSignatureSection";
import { ScopeOfWorkSection } from "./sections/ScopeOfWorkSection";
import { TimelineSection } from "./sections/TimelineSection";
import { WarrantySection } from "./sections/WarrantySection";
import { baseStyles } from "./SharedStyles";

interface Props {
  data: ReportData;
  sections: ReportSectionId[];
}

export function RetailReportPDF({ data, sections }: Props) {
  return (
    <Document>
      {/* COVER */}
      {sections.includes("COVER") && (
        <Page size="A4" style={baseStyles.page}>
          <CoverPage data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* CLIENT SNAPSHOT */}
      {sections.includes("CLIENT_SNAPSHOT") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Your Property & Contact Info" />
          <ClientSnapshotSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* MAPS + PHOTOS */}
      {sections.includes("MAPS_AND_PHOTOS") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Photos Of Your Property" />
          <MapsAndPhotosSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* DAMAGE OVERVIEW (AI, but homeowner language) */}
      {sections.includes("AI_DAMAGE") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="What We Found" />
          <AiDamageSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* SCOPE OF WORK */}
      {sections.includes("SCOPE_OF_WORK") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Scope of Work" />
          <ScopeOfWorkSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* MATERIALS */}
      {sections.includes("MATERIALS") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Materials & Color Selections" />
          <MaterialsSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* WARRANTY + TIMELINE */}
      {(sections.includes("WARRANTY_DETAILS") || sections.includes("TIMELINE")) && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Warranty & Project Timeline" />
          {sections.includes("WARRANTY_DETAILS") && <WarrantySection data={data} />}
          {sections.includes("TIMELINE") && <TimelineSection data={data} />}
          <PageFooter data={data} />
        </Page>
      )}

      {/* RETAIL SUMMARY */}
      {sections.includes("AI_SUMMARY_RETAIL") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Summary & Next Steps" />
          <AiSummaryRetailSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* RETAIL PRICING & FINANCING */}
      {sections.includes("RETAIL_PRICING") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Investment Summary" />
          <RetailPricingSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}

      {/* CUSTOMER SIGNATURE */}
      {sections.includes("CUSTOMER_SIGNATURE") && (
        <Page size="A4" style={baseStyles.page}>
          <PageHeader data={data} titleOverride="Customer Acceptance & Signatures" />
          <RetailSignatureSection data={data} />
          <PageFooter data={data} />
        </Page>
      )}
    </Document>
  );
}
