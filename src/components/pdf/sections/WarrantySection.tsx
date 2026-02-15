// components/pdf/sections/WarrantySection.tsx

import { Text, View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { SectionHeader } from "../SectionHeader";
import { baseStyles } from "../SharedStyles";

export function WarrantySection({ data }: { data: ReportData }) {
  const w = data.warranty;

  if (!w) {
    return (
      <View style={baseStyles.section}>
        <SectionHeader data={data} title="Warranty" />
        <Text style={baseStyles.value}>No warranty details selected.</Text>
      </View>
    );
  }

  return (
    <View style={baseStyles.section}>
      <SectionHeader data={data} title="Warranty Details" />

      {w.optionName && (
        <View style={{ marginBottom: 6 }}>
          <Text style={baseStyles.label}>Warranty Program</Text>
          <Text style={baseStyles.value}>{w.optionName}</Text>
        </View>
      )}

      <View style={baseStyles.row}>
        {w.durationYears != null && (
          <View style={baseStyles.col}>
            <Text style={baseStyles.label}>Duration</Text>
            <Text style={baseStyles.value}>{w.durationYears} years</Text>
          </View>
        )}
        {w.isTransferable != null && (
          <View style={baseStyles.col}>
            <Text style={baseStyles.label}>Transferable</Text>
            <Text style={baseStyles.value}>{w.isTransferable ? "Yes" : "No"}</Text>
          </View>
        )}
      </View>

      {w.aiSummaryIntro && (
        <View style={{ marginTop: 8 }}>
          <Text style={baseStyles.value}>{w.aiSummaryIntro}</Text>
        </View>
      )}

      {w.aiCoverageBullets && w.aiCoverageBullets.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={baseStyles.label}>What is Covered</Text>
          {w.aiCoverageBullets.map((b: string, idx: number) => (
            <Text key={idx} style={baseStyles.value}>
              • {b}
            </Text>
          ))}
        </View>
      )}

      {w.aiExclusionsBullets && w.aiExclusionsBullets.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={baseStyles.label}>Exclusions</Text>
          {w.aiExclusionsBullets.map((b: string, idx: number) => (
            <Text key={idx} style={baseStyles.value}>
              • {b}
            </Text>
          ))}
        </View>
      )}

      {w.aiMaintenanceBullets && w.aiMaintenanceBullets.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={baseStyles.label}>Maintenance Expectations</Text>
          {w.aiMaintenanceBullets.map((b: string, idx: number) => (
            <Text key={idx} style={baseStyles.value}>
              • {b}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
