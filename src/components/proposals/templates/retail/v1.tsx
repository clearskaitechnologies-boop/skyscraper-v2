"use client";

/* eslint-disable react/forbid-dom-props */
/**
 * PHASE 3 SPRINT 3: Retail Proposal Template v1
 * Professional sales proposal for residential roofing clients
 * NOTE: Inline styles are intentional — this component renders to print/PDF
 * where Tailwind classes may not be available in the print context.
 */

import type { AIDraftSections, ProposalContext } from "@/lib/proposals/types";

interface RetailTemplateProps {
  ctx: ProposalContext;
  ai: AIDraftSections;
}

export default function RetailTemplateV1({ ctx, ai }: RetailTemplateProps) {
  return (
    <div className="proposal-document">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          .proposal-document {
            font-family: ${ctx.org.fontFamily}, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
          }
          .cover-page {
            page-break-after: always;
            min-height: 10in;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          .section {
            margin-bottom: 2rem;
            page-break-inside: avoid;
          }
          h1 {
            color: ${ctx.org.primaryColor};
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }
          h2 {
            color: ${ctx.org.primaryColor};
            font-size: 1.75rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid ${ctx.org.primaryColor};
            padding-bottom: 0.5rem;
          }
          h3 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
          }
        }
      `}</style>

      {/* Cover Page */}
      <div className="cover-page">
        {ctx.org.logoUrl && (
          <img
            src={ctx.org.logoUrl}
            alt={ctx.org.name}
            style={{ maxWidth: "300px", marginBottom: "2rem" }}
          />
        )}
        <h1>{ctx.job.title}</h1>
        <p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "3rem" }}>
          Prepared for: {ctx.client.name}
        </p>
        <div style={{ fontSize: "0.9rem", color: "#888" }}>
          <p>{ctx.org.name}</p>
          {ctx.org.contactPhone && <p>Phone: {ctx.org.contactPhone}</p>}
          {ctx.org.contactEmail && <p>Email: {ctx.org.contactEmail}</p>}
          <p style={{ marginTop: "2rem" }}>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="section">
        <h2>Client Information</h2>
        <p>
          <strong>Name:</strong> {ctx.client.name}
        </p>
        {ctx.client.email && (
          <p>
            <strong>Email:</strong> {ctx.client.email}
          </p>
        )}
        {ctx.client.phone && (
          <p>
            <strong>Phone:</strong> {ctx.client.phone}
          </p>
        )}
        {ctx.client.address && (
          <p>
            <strong>Property Address:</strong> {ctx.client.address}
          </p>
        )}
      </div>

      {/* Executive Summary */}
      <div className="section">
        <h2>Executive Summary</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{ai.summary}</p>
      </div>

      {/* Scope of Work */}
      <div className="section">
        <h2>Scope of Work</h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{ai.scope}</div>
      </div>

      {/* Evidence Highlights (if available) */}
      {ctx.evidence.length > 0 && (
        <div className="section">
          <h2>Project Photos</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            {ctx.evidence.slice(0, 12).map((item) => (
              <div key={item.id} style={{ pageBreakInside: "avoid" }}>
                <img
                  src={item.url}
                  alt={item.caption || item.filename}
                  style={{ width: "100%", height: "auto", borderRadius: "4px" }}
                />
                {item.caption && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginTop: "0.25rem",
                    }}
                  >
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms & Pricing */}
      <div className="section">
        <h2>Terms & Pricing</h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{ai.terms}</div>
      </div>

      {/* Additional Notes */}
      <div className="section">
        <h2>Additional Information</h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{ai.notes}</div>
      </div>

      {/* Signature Block */}
      <div className="section" style={{ marginTop: "4rem" }}>
        <h3>Acceptance</h3>
        <p>By signing below, you accept the terms and scope outlined in this proposal.</p>
        <div style={{ display: "flex", gap: "3rem", marginTop: "2rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderBottom: "1px solid #000", height: "2rem" }}></div>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Client Signature</p>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ borderBottom: "1px solid #000", height: "2rem" }}></div>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
