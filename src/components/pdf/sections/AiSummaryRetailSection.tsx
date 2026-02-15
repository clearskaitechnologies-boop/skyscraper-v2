// components/pdf/sections/AiSummaryRetailSection.tsx

import { Text,View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { SectionHeader } from "../SectionHeader";
import { baseStyles } from "../SharedStyles";

export function AiSummaryRetailSection({ data }: { data: ReportData }) {
  const s = data.aiSummaryRetail || {};

  if (!data.aiSummaryRetail) {
    return (
      <View style={baseStyles.section}>
        <SectionHeader data={data} title="Summary & Next Steps" />
        <Text style={baseStyles.value}>Retail summary has not been generated for this report.</Text>
      </View>
    );
  }

  return (
    <View style={baseStyles.section}>
      <SectionHeader data={data} title={(s as any).headline || "Summary & Next Steps"} />

      {(s as any).bullets?.length > 0 &&
        (s as any).bullets.map((b: string, idx: number) => (
          <Text key={idx} style={baseStyles.value}>
            • {b}
          </Text>
        ))}

      {(s as any).bodyParagraph && (
        <View style={{ marginTop: 8 }}>
          <Text style={baseStyles.value}>{(s as any).bodyParagraph}</Text>
        </View>
      )}
    </View>
  );
}
