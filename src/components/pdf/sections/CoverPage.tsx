// components/pdf/sections/CoverPage.tsx

import { Image, StyleSheet,Text, View } from "@react-pdf/renderer";

import { ReportData } from "@/lib/reports/types";

import { getThemeColors } from "../SharedStyles";

export function CoverPage({ data }: { data: ReportData }) {
  const { org, claim, cover } = data;
  const colors = getThemeColors(data);

  return (
    <View style={styles.container}>
      {org.logoUrl && <Image style={styles.logo} src={org.logoUrl} />}

      <Text style={[styles.title, { color: colors.primary }]}>{cover?.title || "Report"}</Text>
      <Text style={styles.subtitle}>{(cover as any)?.subtitle || ""}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Insured / Client</Text>
        <Text style={styles.infoValue}>{(claim as any).clientName || "N/A"}</Text>

        <Text style={styles.infoLabel}>Property</Text>
        <Text style={styles.infoValue}>{claim.propertyAddress}</Text>

        <Text style={styles.infoLabel}>Carrier / Claim #</Text>
        <Text style={styles.infoValue}>
          {(claim as any).carrier || "N/A"} • {claim.claimNumber || "N/A"}
        </Text>

        <Text style={styles.infoLabel}>Date of Loss</Text>
        <Text style={styles.infoValue}>
          {claim.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : "N/A"}
        </Text>
      </View>

      <View style={styles.photoRow}>
        {(cover as any)?.frontPhotoUrl && (
          <Image src={(cover as any).frontPhotoUrl} style={styles.photo} />
        )}
        {(cover as any)?.aerialPhotoUrl && (
          <Image src={(cover as any).aerialPhotoUrl} style={styles.photo} />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerOrg}>{org.name}</Text>
        {(org.slogan || org.motto) && (
          <Text style={styles.footerSlogan}>{org.slogan || org.motto}</Text>
        )}
        {(org as any).fullAddress && (
          <Text style={styles.footerLine}>{(org as any).fullAddress}</Text>
        )}
        <Text style={styles.footerLine}>
          {org.phone || ""} {org.website ? `• ${org.website}` : ""}
        </Text>
        <Text style={styles.footerLine}>
          Generated on{" "}
          {cover?.createdAt
            ? new Date(cover.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 40,
    textAlign: "center",
  },
  logo: {
    width: 80,
    height: 80,
    margin: "0 auto",
  },
  title: {
    fontSize: 24,
    marginTop: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 24,
  },
  infoBlock: {
    marginBottom: 24,
    textAlign: "left",
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 4,
  },
  infoValue: {
    fontSize: 10,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 16,
  },
  photo: {
    width: 220,
    height: 150,
    objectFit: "cover",
  },
  footer: {
    marginTop: 32,
    fontSize: 9,
    textAlign: "center",
  },
  footerOrg: {
    fontSize: 11,
    fontWeight: "bold",
  },
  footerSlogan: {
    fontSize: 9,
  },
  footerLine: {
    fontSize: 8,
  },
});
