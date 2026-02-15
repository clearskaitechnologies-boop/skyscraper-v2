/**
 * Team Invite Email Template
 * Sent when a contractor invites a team member to join their company
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface TeamInviteEmailProps {
  inviterName: string;
  companyName: string;
  inviteeName?: string;
  role: string;
  inviteUrl: string;
}

export default function TeamInviteEmail({
  inviterName = "A team member",
  companyName = "Your Company",
  inviteeName,
  role = "member",
  inviteUrl = "https://skaiscrape.com/trades/join",
}: TeamInviteEmailProps) {
  const previewText = `${inviterName} invited you to join ${companyName} on ClearSkai`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://skaiscrape.com/logo-dark.png"
            width="140"
            height="40"
            alt="ClearSkai"
            style={logo}
          />
          <Heading style={heading}>You&apos;re invited to join {companyName}</Heading>
          <Text style={paragraph}>{inviteeName ? `Hi ${inviteeName},` : "Hi there,"}</Text>
          <Text style={paragraph}>
            <strong>{inviterName}</strong> has invited you to join <strong>{companyName}</strong> on
            ClearSkai as a <strong>{role}</strong>.
          </Text>
          <Text style={paragraph}>
            ClearSkai helps trades professionals manage claims, connect with clients, and grow their
            business. Accept this invitation to get started with your team.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={inviteUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={paragraph}>Or copy and paste this link into your browser:</Text>
          <Text style={link}>{inviteUrl}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            This invitation was sent by {inviterName} from {companyName}. If you didn&apos;t expect
            this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const logo = {
  margin: "0 auto",
  marginBottom: "24px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#0f172a",
  padding: "0 40px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#334155",
  padding: "0 40px",
};

const link = {
  fontSize: "13px",
  lineHeight: "1.4",
  color: "#2563eb",
  padding: "0 40px",
  wordBreak: "break-all" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  padding: "16px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "0 auto",
  fontWeight: "600",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 40px",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.5",
  padding: "0 40px",
};
