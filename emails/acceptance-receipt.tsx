// =====================================================
// ACCEPTANCE RECEIPT EMAIL TEMPLATE
// Beautiful confirmation email sent after client acceptance
// Includes: receipt PDF download, report link, timestamp
// =====================================================

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html as EmailHtml,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface AcceptanceReceiptEmailProps {
  orgName: string;
  reportId: string;
  shareUrl: string;
  receiptPdfUrl: string;
  reportPdfUrl?: string;
  clientName?: string;
  acceptedAt: Date;
}

export default function AcceptanceReceiptEmail({
  orgName,
  reportId,
  shareUrl,
  receiptPdfUrl,
  reportPdfUrl,
  clientName,
  acceptedAt,
}: AcceptanceReceiptEmailProps) {
  const preview = `Acceptance confirmed for report ${reportId}`;
  const formattedDate = acceptedAt.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{orgName}</Text>
            <Text style={styles.subtle}>Report Acceptance Receipt</Text>
          </Section>

          {/* Main Content */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{clientName ? `Hi ${clientName},` : "Hi,"}</Text>
            <Text style={styles.p}>
              Your acceptance has been recorded successfully. This email confirms that you have
              reviewed and accepted the damage assessment report.
            </Text>
          </Section>

          {/* Report Details */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Report ID:</strong> {reportId}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Accepted:</strong> {formattedDate}
            </Text>
            <Text style={{ ...styles.p, margin: 0 }}>
              <strong>Status:</strong> <span style={{ color: "#10B981" }}>✓ Accepted</span>
            </Text>
          </Section>

          {/* Primary Actions */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ ...styles.p, marginBottom: 12 }}>
              <strong>Your Documents:</strong>
            </Text>

            {/* Receipt PDF */}
            <Button href={receiptPdfUrl} style={styles.primaryBtn}>
              Download Acceptance Receipt
            </Button>

            {/* Report PDF (if available) */}
            {reportPdfUrl && (
              <div style={{ marginTop: 12 }}>
                <Link href={reportPdfUrl} style={styles.link}>
                  Download Full Report PDF
                </Link>
              </div>
            )}

            {/* View Online */}
            <div style={{ marginTop: 12 }}>
              <Link href={shareUrl} style={styles.link}>
                View Report Online
              </Link>
            </div>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              Keep this email for your records. If you have any questions, please reply to this
              email.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              Links for reference:
              <br />
              Receipt PDF: {receiptPdfUrl}
              <br />
              Report Online: {shareUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </EmailHtml>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    background: "#0A0F1C",
    padding: "24px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: {
    background: "#0F172A",
    borderRadius: 12,
    padding: 24,
    color: "#E2E8F0",
    maxWidth: 560,
  },
  h1: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: "#E2E8F0",
  },
  subtle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  p: {
    fontSize: 14,
    lineHeight: "20px",
    margin: "0 0 12px",
  },
  primaryBtn: {
    display: "inline-block",
    background: "#10B981",
    borderRadius: 10,
    padding: "12px 18px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },
  link: {
    color: "#93C5FD",
    textDecoration: "underline",
  },
  hr: {
    borderColor: "#1F2937",
    margin: "18px 0",
  },
  muted: {
    fontSize: 12,
    color: "#94A3B8",
  },
};
