// =====================================================
// EMAIL #138: NEW MESSAGE NOTIFICATION
// =====================================================
// Sent when a user receives a new message in a thread
// Includes: sender name, message preview, CTA to view
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

export interface NewMessageEmailProps {
  recipientName?: string;
  senderName: string;
  messagePreview: string;
  messageUrl: string;
  company?: string;
}

export default function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  messageUrl,
  company = "PreLoss Vision",
}: NewMessageEmailProps) {
  const truncated =
    messagePreview.length > 160 ? messagePreview.slice(0, 160) + "…" : messagePreview;
  const preview = `New message from ${senderName}`;

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{company}</Text>
            <Text style={styles.subtle}>New Message</Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{recipientName ? `Hi ${recipientName},` : "Hi,"}</Text>
            <Text style={styles.p}>
              <strong>{senderName}</strong> sent you a new message:
            </Text>
          </Section>

          {/* Message Preview */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ ...styles.p, margin: 0, fontStyle: "italic" }}>
              &ldquo;{truncated}&rdquo;
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: 24 }}>
            <Button href={messageUrl} style={styles.primaryBtn}>
              View Message
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              You received this email because someone sent you a message on {company}. If you
              believe this was sent in error, please ignore this email.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              <a href="{{{unsubscribeUrl}}}" style={{ color: "#94A3B8" }}>
                Unsubscribe from message notifications
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
