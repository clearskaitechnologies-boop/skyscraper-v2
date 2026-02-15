// components/pdf/sections/OcrDocsSection.tsx

import { Text,View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { SectionHeader } from "../SectionHeader";
import { baseStyles } from "../SharedStyles";

export function OcrDocsSection({ data }: { data: ReportData }) {
  const docs = data.ocrDocs || [];

  if (!docs.length) {
    return (
      <View style={baseStyles.section}>
        <SectionHeader data={data} title="Supporting Documents (OCR)" />
        <Text style={baseStyles.value}>No OCR-processed documents included in this report.</Text>
      </View>
    );
  }

  return (
    <View style={baseStyles.section}>
      <SectionHeader data={data} title="Supporting Documents (OCR)" />

      {docs.map((doc, idx) => (
        <View key={idx} style={{ marginBottom: 8 }}>
          <Text style={baseStyles.label}>
            {(doc as any).title || "Document"} ({(doc as any).sourceType || "Unknown"})
          </Text>
          {(doc as any).pageCount != null && (
            <Text style={baseStyles.value}>Pages: {(doc as any).pageCount}</Text>
          )}
          {(doc as any).aiSummary && (
            <>
              <Text style={baseStyles.label}>Summary</Text>
              <Text style={baseStyles.value}>{(doc as any).aiSummary}</Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}
