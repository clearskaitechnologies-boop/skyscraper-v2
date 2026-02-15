// components/pdf/PageHeader.tsx

import { Image, StyleSheet,Text, View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { getThemeColors } from "./SharedStyles";

interface PageHeaderProps {
  data: ReportData;
  titleOverride?: string;
}

export function PageHeader({ data, titleOverride }: PageHeaderProps) {
  const colors = getThemeColors(data);

  return (
    <View style={[styles.container, { borderBottomColor: colors.primary }]}>
      <View style={styles.left}>
        {data.org.logoUrl && <Image src={data.org.logoUrl} style={styles.logo} />}
        <View style={styles.orgText}>
          <Text style={[styles.orgName, { color: colors.primary }]}>{data.org.name}</Text>
          {data.org.slogan && <Text style={styles.orgSlogan}>{data.org.slogan}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.title, { color: colors.primary }]}>
          {titleOverride || data.cover?.title || "Report"}
        </Text>
        <Text style={styles.meta}>
          Claim: {data.claim.claimNumber || "N/A"} • DOL:{" "}
          {data.claim.dateOfLoss ? new Date(data.claim.dateOfLoss).toLocaleDateString() : "N/A"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  orgText: {
    flexDirection: "column",
  },
  orgName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  orgSlogan: {
    fontSize: 8,
  },
  right: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
  },
  meta: {
    fontSize: 8,
  },
});
