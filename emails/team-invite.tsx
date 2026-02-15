// =====================================================
// EMAIL #143: TEAM INVITE
// =====================================================
// Sent when someone is invited to join a team/company
// Includes: inviter, company, role, accept CTA, expiry
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

export interface TeamInviteEmailProps {
  recipientName?: string;
  inviterName: string;
  companyName: string;
  role: string;
  acceptUrl: string;
  expiresInDays?: number;
  company?: string;
}

export default function TeamInviteEmail({
  recipientName,
  inviterName,
  companyName,
  role,
  acceptUrl,
  expiresInDays = 7,
  company = "PreLoss Vision",
}: TeamInviteEmailProps) {
  const preview = `${inviterName} invited you to join ${companyName} on ${company}`;

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{company}</Text>
            <Text style={styles.subtle}>Team Invitation</Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{recipientName ? `Hi ${recipientName},` : "Hi,"}</Text>
            <Text style={styles.p}>
              <strong>{inviterName}</strong> has invited you to join <strong>{companyName}</strong>{" "}
              on {company}.
            </Text>
          </Section>

          {/* Invite Details */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Company:</strong> {companyName}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Invited by:</strong> {inviterName}
            </Text>
            <Text style={{ ...styles.p, margin: 0 }}>
              <strong>Role:</strong> <span style={{ color: "#93C5FD" }}>{role}</span>
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: "center", marginBottom: 18 }}>
            <Button href={acceptUrl} style={styles.primaryBtn}>
              Accept Invitation
            </Button>
          </Section>

          {/* Expiry Notice */}
          <Section style={{ marginBottom: 24 }}>
            <Text
              style={{
                ...styles.p,
                textAlign: "center",
                color: "#FBBF24",
                fontSize: 12,
              }}
            >
              ⏳ This invitation expires in {expiresInDays} day
              {expiresInDays !== 1 ? "s" : ""}. Please accept before it expires.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              If you don&apos;t recognize this invitation or believe it was sent in error, you can
              safely ignore this email. No action will be taken on your behalf.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              <a href="{{{unsubscribeUrl}}}" style={{ color: "#94A3B8" }}>
                Unsubscribe from team notifications
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
