// components/pdf/sections/AiSummaryClaimSection.tsx

import { Text,View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { SectionHeader } from "../SectionHeader";
import { baseStyles } from "../SharedStyles";

export function AiSummaryClaimSection({ data }: { data: ReportData }) {
  const s = data.aiSummaryClaim || {};

  if (!data.aiSummaryClaim) {
    return (
      <View style={baseStyles.section}>
        <SectionHeader data={data} title="Executive Claim Summary" />
        <Text style={baseStyles.value}>Claim summary has not been generated for this report.</Text>
      </View>
    );
  }

  return (
    <View style={baseStyles.section}>
      <SectionHeader data={data} title={(s as any).headline || "Executive Claim Summary"} />

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
