// =====================================================
// EMAIL #142: ORDER STATUS UPDATE
// =====================================================
// Sent when a material order status changes
// Includes: order number, items, status change, CTA
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

export interface OrderStatusUpdateEmailProps {
  recipientName?: string;
  orderNumber: string;
  itemSummary: string;
  oldStatus: string;
  newStatus: string;
  estimatedDelivery?: string;
  orderUrl: string;
  company?: string;
}

const orderStatusColors: Record<string, string> = {
  placed: "#3B82F6",
  confirmed: "#8B5CF6",
  processing: "#F59E0B",
  shipped: "#06B6D4",
  "out for delivery": "#10B981",
  delivered: "#10B981",
  cancelled: "#EF4444",
  "on hold": "#F59E0B",
  returned: "#6B7280",
};

function getOrderStatusColor(status: string): string {
  return orderStatusColors[status.toLowerCase()] || "#94A3B8";
}

export default function OrderStatusUpdateEmail({
  recipientName,
  orderNumber,
  itemSummary,
  oldStatus,
  newStatus,
  estimatedDelivery,
  orderUrl,
  company = "PreLoss Vision",
}: OrderStatusUpdateEmailProps) {
  const preview = `Order ${orderNumber}: ${oldStatus} → ${newStatus}`;

  return (
    <EmailHtml>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.h1}>{company}</Text>
            <Text style={styles.subtle}>Order Status Update</Text>
          </Section>

          {/* Greeting */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={styles.p}>{recipientName ? `Hi ${recipientName},` : "Hi,"}</Text>
            <Text style={styles.p}>Your order status has been updated. Here are the details:</Text>
          </Section>

          {/* Order Details */}
          <Section
            style={{
              background: "#1E293B",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Order:</strong> #{orderNumber}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Items:</strong> {itemSummary}
            </Text>
            <Text style={{ ...styles.p, margin: "0 0 8px" }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: getOrderStatusColor(oldStatus) }}>{oldStatus}</span>
              {" → "}
              <span style={{ color: getOrderStatusColor(newStatus), fontWeight: 700 }}>
                {newStatus}
              </span>
            </Text>
            {estimatedDelivery && (
              <Text style={{ ...styles.p, margin: 0 }}>
                <strong>Estimated Delivery:</strong> {estimatedDelivery}
              </Text>
            )}
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: 24 }}>
            <Button href={orderUrl} style={styles.primaryBtn}>
              View Order
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.muted}>
              You are receiving this email because you have an active order on {company}. If you
              have questions about your order, reply to this email or contact support.
            </Text>
            <Text style={{ ...styles.muted, marginTop: 8 }}>
              <a href="{{{unsubscribeUrl}}}" style={{ color: "#94A3B8" }}>
                Unsubscribe from order updates
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
