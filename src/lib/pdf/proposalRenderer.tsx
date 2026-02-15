import { Document, Font,Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

// ============================================================================
// PDF STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #2563eb",
    paddingBottom: 15,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: "1 solid #cbd5e1",
  },
  sectionContent: {
    fontSize: 11,
    color: "#334155",
    lineHeight: 1.6,
  },
  metadata: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 10,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center",
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
  },
  coverPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 40,
    textAlign: "center",
  },
  coverInfo: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 8,
    textAlign: "center",
  },
});

// ============================================================================
// TYPES
// ============================================================================

export interface ProposalPDFData {
  projectName: string;
  propertyAddress: string;
  lossType?: string;
  generatedAt: string;
  sections: Array<{
    sectionKey: string;
    content: any;
    tokensUsed?: number;
  }>;
  totalTokensUsed?: number;
  orgName?: string;
  brandLogoUrl?: string;
}

// ============================================================================
// PDF DOCUMENT COMPONENT
// ============================================================================

export const ProposalPDFDocument: React.FC<{ data: ProposalPDFData }> = ({ data }) => {
  const {
    projectName,
    propertyAddress,
    lossType,
    generatedAt,
    sections,
    totalTokensUsed,
    orgName,
    brandLogoUrl,
  } = data;

  const formatSectionTitle = (key: string): string => {
    return key
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderSectionContent = (content: any): string => {
    if (typeof content === "string") {
      return content;
    }
    if (typeof content === "object" && content !== null) {
      return JSON.stringify(content, null, 2);
    }
    return String(content);
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {brandLogoUrl && <Image src={brandLogoUrl} style={styles.logo} />}

          <Text style={styles.coverTitle}>{projectName}</Text>

          <Text style={styles.coverSubtitle}>{propertyAddress}</Text>

          {lossType && <Text style={styles.coverInfo}>Loss Type: {lossType}</Text>}

          <Text style={styles.coverInfo}>
            Generated: {new Date(generatedAt).toLocaleDateString()}
          </Text>

          {orgName && <Text style={styles.coverInfo}>{orgName}</Text>}
        </View>

        <Text style={styles.footer}>AI-Generated Proposal • Powered by SkaiScraper</Text>
      </Page>

      {/* Content Sections */}
      {sections.map((section, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.header}>
            {brandLogoUrl && <Image src={brandLogoUrl} style={styles.logo} />}
            <Text style={styles.title}>{projectName}</Text>
            <Text style={styles.subtitle}>{propertyAddress}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{formatSectionTitle(section.sectionKey)}</Text>
            <Text style={styles.sectionContent}>{renderSectionContent(section.content)}</Text>
            {section.tokensUsed && (
              <Text style={styles.metadata}>Tokens used: {section.tokensUsed}</Text>
            )}
          </View>

          <Text style={styles.footer}>
            Page {index + 2} • {formatSectionTitle(section.sectionKey)}
          </Text>
        </Page>
      ))}

      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Generation Summary</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Information</Text>
          <Text style={styles.sectionContent}>Project: {projectName}</Text>
          <Text style={styles.sectionContent}>Property: {propertyAddress}</Text>
          {lossType && <Text style={styles.sectionContent}>Loss Type: {lossType}</Text>}
          <Text style={styles.sectionContent}>
            Generated: {new Date(generatedAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sections Generated</Text>
          {sections.map((section, index) => (
            <Text key={index} style={styles.sectionContent}>
              • {formatSectionTitle(section.sectionKey)}
            </Text>
          ))}
        </View>

        {totalTokensUsed && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Usage</Text>
            <Text style={styles.sectionContent}>
              Total tokens consumed: {totalTokensUsed.toLocaleString()}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>End of Document • AI-Generated Proposal</Text>
      </Page>
    </Document>
  );
};
