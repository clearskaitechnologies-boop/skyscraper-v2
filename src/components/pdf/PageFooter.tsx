// components/pdf/PageFooter.tsx

import { StyleSheet,Text, View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

interface PageFooterProps {
  data: ReportData;
}

export function PageFooter({ data }: PageFooterProps) {
  return (
    <View style={styles.container} fixed>
      <Text style={styles.text}>
        {data.org.name} • {data.org.phone || ""} • {data.org.website || ""}
      </Text>
      <Text style={styles.text}>
        Generated on{" "}
        {data.cover?.createdAt
          ? new Date(data.cover.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString()}{" "}
        • Powered by SkaiScraper™
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: {
    fontSize: 8,
  },
});
