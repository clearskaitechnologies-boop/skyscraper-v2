// components/pdf/SectionHeader.tsx

import { StyleSheet,Text, View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { getThemeColors } from "./SharedStyles";

interface SectionHeaderProps {
  data: ReportData;
  title: string;
}

export function SectionHeader({ data, title }: SectionHeaderProps) {
  const colors = getThemeColors(data);

  return (
    <View style={[styles.container, { borderBottomColor: colors.accent }]}>
      <Text style={[styles.title, { color: colors.accent }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
