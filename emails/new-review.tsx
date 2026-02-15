// =====================================================
// EMAIL #139: NEW REVIEW NOTIFICATION
// =====================================================
// Sent when a contractor receives a new review
// Includes: reviewer, star rating, review text, CTA
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

export interface NewReviewEmailProps {
  recipientName?: string;
  reviewerName?: string;
  starRating: number;
  reviewText: string;
  reviewUrl: string;
  company?: string;
}

export default function NewReviewEmail({
  recipientName,
  reviewerName,
  starRating,
  reviewText,
  reviewUrl,
  company = "PreLoss Vision",
}: NewReviewEmailProps) {
  const displayReviewer = reviewerName || "A homeowner";
  const stars = "★".repeat(starRating) + "☆".repeat(5 - starRating);
  const truncated = reviewText.length > 200 ? reviewText.slice(0, 200) + "…" : reviewText;
  const preview = `${displayReviewer} left you a ${starRating}-star review`;

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{company}</Text>
            <Text style={styles.subtle}>New Review</Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{recipientName ? `Hi ${recipientName},` : "Hi,"}</Text>
            <Text style={styles.p}>
              <strong>{displayReviewer}</strong> left you a new review!
            </Text>
          </Section>

          {/* Rating & Review */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                margin: "0 0 8px",
                letterSpacing: 2,
                color: "#FBBF24",
              }}
            >
              {stars}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 4px" }}>
              <strong>{displayReviewer}</strong>
            </Text>
            <Text style={{ ...styles.p, margin: 0, fontStyle: "italic" }}>
              &ldquo;{truncated}&rdquo;
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: 24 }}>
            <Button href={reviewUrl} style={styles.primaryBtn}>
              View & Respond to Review
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              Reviews help build trust with potential clients. Responding to reviews — positive or
              negative — shows professionalism and care.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              <a href="{{{unsubscribeUrl}}}" style={{ color: "#94A3B8" }}>
                Unsubscribe from review notifications
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
