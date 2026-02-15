/**
 * TemplatePreview - Live preview of PDF templates
 */
import React, { useEffect, useRef } from "react";

import { renderPdfHtml } from "@/lib/pdfTemplates";

export default function TemplatePreview({ mode }: { mode: "retail" | "insurance" | "inspection" }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const titles = {
      retail: "Retail Proposal",
      insurance: "Insurance Claim Report",
      inspection: "Inspection Report",
    };

    const summaries = {
      retail:
        "Professional proposal with materials, pricing, and payment schedule. Includes mockup renders and warranty details.",
      insurance:
        "Carrier-ready claim documentation with storm verification, code compliance citations, and damage evidence.",
      inspection:
        "Detailed roof condition assessment with risk analysis and recommended next steps.",
    };

    const html = renderPdfHtml(mode, {
      brand: { logoUrl: "/clearskai-logo.jpg" },
      heading: titles[mode],
      property: { address: "123 Demo Property Ln, Phoenix, AZ" },
      ai_summary: summaries[mode],
      photos: [],
    });

    const doc = ref.current?.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();
  }, [mode]);

  return (
    <iframe
      ref={ref}
      className="h-96 w-full rounded-xl border bg-white shadow-sm"
      title={`${mode} preview`}
    />
  );
}
