// =====================================================
// EMAIL #141: JOB ASSIGNMENT NOTIFICATION
// =====================================================
// Sent when a pro is assigned to a new job/claim
// Includes: job details, property address, homeowner, CTA
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

export interface JobAssignmentEmailProps {
  recipientName?: string;
  claimNumber: string;
  propertyAddress: string;
  jobDescription?: string;
  homeownerName: string;
  homeownerEmail?: string;
  homeownerPhone?: string;
  scheduledDate?: string;
  jobUrl: string;
  company?: string;
}

export default function JobAssignmentEmail({
  recipientName,
  claimNumber,
  propertyAddress,
  jobDescription,
  homeownerName,
  homeownerEmail,
  homeownerPhone,
  scheduledDate,
  jobUrl,
  company = "PreLoss Vision",
}: JobAssignmentEmailProps) {
  const preview = `New job assigned: ${propertyAddress}`;

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{company}</Text>
            <Text style={styles.subtle}>New Job Assignment</Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{recipientName ? `Hi ${recipientName},` : "Hi,"}</Text>
            <Text style={styles.p}>
              You have been assigned to a new job. Please review the details below and reach out to
              the homeowner to schedule your visit.
            </Text>
          </Section>

          {/* Job Details */}
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
            {jobDescription && (
              <Text style={{ ...styles.p, margin: "0 0 8px" }}>
                <strong>Scope:</strong> {jobDescription}
              </Text>
            )}
            {scheduledDate && (
              <Text style={{ ...styles.p, margin: "0 0 8px" }}>
                <strong>Target Date:</strong> {scheduledDate}
              </Text>
            )}
            <Text style={{ ...styles.p, margin: 0 }}>
              <strong>Status:</strong> <span style={{ color: "#FBBF24" }}>Assigned</span>
            </Text>
          </Section>

          {/* Homeowner Contact */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ ...styles.p, margin: "0 0 8px", fontWeight: 600 }}>
              Homeowner Contact
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 4px" }}>{homeownerName}</Text>
            {homeownerEmail && (
              <Text style={{ ...styles.p, margin: "0 0 4px" }}>
                <Link href={`mailto:${homeownerEmail}`} style={styles.link}>
                  {homeownerEmail}
                </Link>
              </Text>
            )}
            {homeownerPhone && (
              <Text style={{ ...styles.p, margin: 0 }}>
                <Link href={`tel:${homeownerPhone}`} style={styles.link}>
                  {homeownerPhone}
                </Link>
              </Text>
            )}
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: 24 }}>
            <Button href={jobUrl} style={styles.primaryBtn}>
              View Job Details
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              Please confirm or update your availability in the app. If you cannot take this job,
              decline it as soon as possible so it can be reassigned.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              <a href="{{{unsubscribeUrl}}}" style={{ color: "#94A3B8" }}>
                Unsubscribe from job notifications
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
