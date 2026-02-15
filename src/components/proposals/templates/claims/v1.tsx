"use client";

/**
 * PHASE 3 SPRINT 3: Claims Packet Template v1
 * Carrier-ready claims documentation packet
 */

import type { AIDraftSections,ProposalContext } from "@/lib/proposals/types";

interface ClaimsTemplateProps {
  ctx: ProposalContext;
  ai: AIDraftSections;
}

export default function ClaimsTemplateV1({ ctx, ai }: ClaimsTemplateProps) {
  return (
    <div className="claims-document">
      <style jsx global>{`
        @media print {
          .claims-document {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.5;
          }
          .header {
            border-bottom: 3px solid #000;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          .section {
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }
          .evidence-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin-top: 1rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0.5rem;
          }
          th,
          td {
            border: 1px solid #000;
            padding: 0.5rem;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>INSURANCE CLAIM DOCUMENTATION</h1>
        <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
          Claim #{ctx.client.claimNumber || "PENDING"} | Prepared: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Claim Summary */}
      <div className="section">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>1. CLAIM SUMMARY</h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: "30%" }}>Insured</th>
              <td>{ctx.client.name}</td>
            </tr>
            <tr>
              <th>Carrier</th>
              <td>{ctx.client.carrier || "TBD"}</td>
            </tr>
            <tr>
              <th>Policy/Claim #</th>
              <td>{ctx.client.claimNumber || "Pending"}</td>
            </tr>
            <tr>
              <th>Property Address</th>
              <td>{ctx.client.address || "N/A"}</td>
            </tr>
            <tr>
              <th>Date of Loss</th>
              <td>{ctx.job.lossDate?.toLocaleDateString() || "TBD"}</td>
            </tr>
            <tr>
              <th>Loss Type</th>
              <td>{ctx.job.lossType || "Assessment required"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Causation & Damages */}
      <div className="section">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          2. CAUSATION & SCOPE OF DAMAGES
        </h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{ai.summary}</p>
        <p style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>{ai.scope}</p>
      </div>

      {/* Weather Data */}
      {ctx.weather && (
        <div className="section">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>3. WEATHER VERIFICATION</h2>
          <table>
            <tbody>
              <tr>
                <th style={{ width: "30%" }}>Summary</th>
                <td>{ctx.weather.summary || "N/A"}</td>
              </tr>
              <tr>
                <th>Wind Speed</th>
                <td>{ctx.weather.windMph ? `${ctx.weather.windMph} mph` : "N/A"}</td>
              </tr>
              <tr>
                <th>Precipitation</th>
                <td>{ctx.weather.precipIn ? `${ctx.weather.precipIn} inches` : "N/A"}</td>
              </tr>
              <tr>
                <th>Temperature</th>
                <td>{ctx.weather.tempF ? `${ctx.weather.tempF}°F` : "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Evidence Matrix */}
      <div className="section">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>4. PHOTOGRAPHIC EVIDENCE</h2>
        <p>
          <strong>Total Evidence Items:</strong> {ctx.evidence.length}
        </p>
        <div className="evidence-grid">
          {ctx.evidence.slice(0, 24).map((item, index) => (
            <div key={item.id} style={{ textAlign: "center" }}>
              <img
                src={item.url}
                alt={`Evidence ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  border: "1px solid #000",
                }}
              />
              <p style={{ fontSize: "0.7rem", margin: "0.25rem 0 0 0" }}>
                #{index + 1} - {new Date(item.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Damage Analysis (from DOL) */}
      {ctx.dol && (
        <div className="section">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            5. PROFESSIONAL DAMAGE ASSESSMENT
          </h2>
          <p>
            <strong>Summary:</strong>
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{ctx.dol.summary}</p>
          {ctx.dol.recommendations && (
            <>
              <p style={{ marginTop: "1rem" }}>
                <strong>Recommendations:</strong>
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{ctx.dol.recommendations}</p>
            </>
          )}
        </div>
      )}

      {/* Supporting Documentation */}
      <div className="section">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>6. SUPPORTING DOCUMENTATION</h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{ai.terms}</div>
      </div>

      {/* Recommendations */}
      <div className="section">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          7. CONTRACTOR RECOMMENDATIONS
        </h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{ai.notes}</div>
      </div>

      {/* Contact */}
      <div
        className="section"
        style={{
          marginTop: "2rem",
          borderTop: "2px solid #000",
          paddingTop: "1rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Contractor Contact Information</h3>
        <p>
          <strong>{ctx.org.name}</strong>
        </p>
        {ctx.org.contactPhone && <p>Phone: {ctx.org.contactPhone}</p>}
        {ctx.org.contactEmail && <p>Email: {ctx.org.contactEmail}</p>}
      </div>
    </div>
  );
}
