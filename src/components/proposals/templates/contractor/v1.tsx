"use client";

/**
 * PHASE 3: Contractor Proposal Template v1
 *
 * Neutral, factual template for GC/facility-grade proposals.
 * Emphasizes technical scope, materials, timeline, and totals.
 * No sales language - professional and straightforward.
 *
 * NOTE: Inline styles are REQUIRED for HTML-to-PDF conversion.
 * PDF renderers don't support external CSS - styles must be inline.
 */

/* eslint-disable react/forbid-component-props */

import type { AIDraftSections, ProposalContext } from "@/lib/proposals/types";

interface ContractorTemplateV1Props {
  ctx: ProposalContext;
  ai: AIDraftSections;
}

export default function ContractorTemplateV1({ ctx, ai }: ContractorTemplateV1Props) {
  const primaryColor = ctx.org?.primaryColor || "#2563eb";

  return (
    <main
      style={{
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial",
        color: "#111",
        lineHeight: "1.6",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `3px solid ${primaryColor}`,
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        {ctx.org?.logoUrl && (
          <img
            src={ctx.org.logoUrl}
            alt={ctx.org.name}
            style={{ height: "48px", marginBottom: "12px" }}
          />
        )}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 8px",
            color: primaryColor,
          }}
        >
          {ctx.org?.name || "Work Order"}
        </h1>
        <div style={{ fontSize: "14px", color: "#666" }}>
          {ctx.client?.name} • {ctx.client?.address}
        </div>
      </div>

      {/* Project Information */}
      <section style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 12px",
            color: "#333",
          }}
        >
          Project Information
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td
                style={{
                  padding: "8px 12px",
                  fontWeight: "600",
                  width: "180px",
                }}
              >
                Project Name
              </td>
              <td style={{ padding: "8px 12px" }}>{ctx.job?.title || "Untitled Project"}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px 12px", fontWeight: "600" }}>Property Address</td>
              <td style={{ padding: "8px 12px" }}>{ctx.client?.address || "N/A"}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px 12px", fontWeight: "600" }}>Contact</td>
              <td style={{ padding: "8px 12px" }}>
                {ctx.client?.name} • {ctx.client?.email} • {ctx.client?.phone}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px 12px", fontWeight: "600" }}>Date Prepared</td>
              <td style={{ padding: "8px 12px" }}>{new Date().toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Technical Scope */}
      <section style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 12px",
            color: "#333",
          }}
        >
          Scope of Work
        </h2>
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "16px",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {ai.scope || ctx.job?.description || "No scope details provided."}
        </div>
      </section>

      {/* Materials & Equipment - Optional section removed due to schema mismatch */}

      {/* Evidence/Documentation (if available) */}
      {ctx.evidence && ctx.evidence.length > 0 && (
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "0 0 12px",
              color: "#333",
            }}
          >
            Project Documentation
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {ctx.evidence.slice(0, 9).map((item, i) => (
              <figure key={i} style={{ margin: 0 }}>
                <img
                  src={item.url}
                  alt={item.caption || `Evidence ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                {item.caption && (
                  <figcaption
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                      textAlign: "center",
                    }}
                  >
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Timeline - Optional section removed due to schema mismatch */}

      {/* Terms & Conditions */}
      {ai.terms && (
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "0 0 12px",
              color: "#333",
            }}
          >
            Terms & Conditions
          </h2>
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
            }}
          >
            {ai.terms}
          </div>
        </section>
      )}

      {/* Additional Notes */}
      {ai.notes && (
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "0 0 12px",
              color: "#333",
            }}
          >
            Notes
          </h2>
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
            }}
          >
            {ai.notes}
          </div>
        </section>
      )}

      {/* Signature Block */}
      <section
        style={{
          marginTop: "48px",
          paddingTop: "24px",
          borderTop: "2px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 24px",
            color: "#333",
          }}
        >
          Authorization
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
          }}
        >
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                marginBottom: "8px",
                height: "40px",
              }}
            ></div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Contractor Signature</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{ctx.org?.name}</div>
          </div>
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                marginBottom: "8px",
                height: "40px",
              }}
            ></div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Client Signature</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{ctx.client?.name}</div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginTop: "24px",
          }}
        >
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                marginBottom: "8px",
                height: "32px",
              }}
            ></div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Date</div>
          </div>
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                marginBottom: "8px",
                height: "32px",
              }}
            ></div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Date</div>
          </div>
        </div>
      </section>

      {/* Footer (fixed at bottom on print) */}
      <footer
        style={{
          position: "fixed",
          bottom: "16px",
          left: "0",
          right: "0",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
        }}
      >
        {ctx.org?.address && <span>{ctx.org.address} • </span>}
        {ctx.org?.contactPhone && <span>{ctx.org.contactPhone} • </span>}
        {ctx.org?.contactEmail && <span>{ctx.org.contactEmail}</span>}
      </footer>
    </main>
  );
}
