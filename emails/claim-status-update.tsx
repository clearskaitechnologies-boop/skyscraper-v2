// =====================================================
// EMAIL #140: CLAIM STATUS UPDATE
// =====================================================
// Sent when a claim status changes (e.g. Submitted → In Review)
// Includes: claim info, old/new status, explanation, CTA
// =====================================================

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html as EmailHtml,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface ClaimStatusUpdateEmailProps {
  recipientName?: string;
  claimNumber: string;
  propertyAddress: string;
  oldStatus: string;
  newStatus: string;
  statusDescription: string;
  claimUrl: string;
  company?: string;
}

const statusColors: Record<string, string> = {
  submitted: "#3B82F6",
  "in review": "#F59E0B",
  approved: "#10B981",
  denied: "#EF4444",
  "in progress": "#8B5CF6",
  completed: "#10B981",
  closed: "#6B7280",
};

function getStatusColor(status: string): string {
  return statusColors[status.toLowerCase()] || "#94A3B8";
}

export default function ClaimStatusUpdateEmail({
  recipientName,
  claimNumber,
  propertyAddress,
  oldStatus,
  newStatus,
  statusDescription,
  claimUrl,
  company = "PreLoss Vision",
}: ClaimStatusUpdateEmailProps) {
  const preview = `Claim ${claimNumber} status: ${oldStatus} → ${newStatus}`;

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{company}</Text>
            <Text style={styles.subtle}>Claim Status Update</Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{recipientName ? `Hi ${recipientName},` : "Hi,"}</Text>
            <Text style={styles.p}>
              There has been an update to your claim. Here are the details:
            </Text>
          </Section>

          {/* Claim Details */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Claim:</strong> {claimNumber}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Property:</strong> {propertyAddress}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: getStatusColor(oldStatus) }}>{oldStatus}</span>
              {" → "}
              <span style={{ color: getStatusColor(newStatus), fontWeight: 700 }}>{newStatus}</span>
            </Text>
          </Section>

          {/* What this means */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ ...styles.p, fontWeight: 600 }}>What this means:</Text>
            <Text style={styles.p}>{statusDescription}</Text>
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: 24 }}>
            <Button href={claimUrl} style={styles.primaryBtn}>
              View Claim Details
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              You are receiving this email because you are associated with claim {claimNumber}. If
              you have questions, reply to this email or contact your assigned adjuster.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              <a href="{{{unsubscribeUrl}}}" style={{ color: "#94A3B8" }}>
                Unsubscribe from claim updates
              </a>
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
    background: "#117CFF",
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
