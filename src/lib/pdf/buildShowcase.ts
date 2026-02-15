/**
 * PDF Showcase Builder
 * Assembles investor-ready PDFs from screenshots and data
 *
 * NOTE: This is a placeholder/stub for demo purposes.
 * Replace with real PDF generation using jsPDF, PDFKit, or similar.
 */

export interface ShowcaseSection {
  title: string;
  description?: string;
  imageUrl?: string;
  content?: string;
}

export interface ShowcaseOptions {
  title: string;
  subtitle?: string;
  logo?: string;
  sections: ShowcaseSection[];
  brandColor?: string;
}

/**
 * Build a showcase PDF document
 * @returns Data URL of generated PDF (placeholder)
 */
export async function buildShowcasePdf(options: ShowcaseOptions): Promise<string> {
  // TODO: Replace with real PDF generation
  // Example libraries: jsPDF, pdfmake, react-pdf

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title}</title>
        <style>
          body { font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: ${options.brandColor || "#2563eb"}; margin-bottom: 8px; }
          .subtitle { color: #64748b; margin-bottom: 32px; }
          .section { margin-bottom: 40px; page-break-inside: avoid; }
          .section h2 { color: #1e293b; margin-bottom: 12px; }
          .section p { color: #475569; line-height: 1.6; }
          img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <h1>${options.title}</h1>
        ${options.subtitle ? `<p class="subtitle">${options.subtitle}</p>` : ""}
        
        ${options.sections
          .map(
            (section) => `
          <div class="section">
            <h2>${section.title}</h2>
            ${section.description ? `<p>${section.description}</p>` : ""}
            ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.title}" />` : ""}
            ${section.content ? `<div>${section.content}</div>` : ""}
          </div>
        `
          )
          .join("")}
      </body>
    </html>
  `;

  // Convert HTML to data URL (browser will render as PDF when opened)
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  return dataUrl;
}

/**
 * Build investor deck PDF
 */
export async function buildInvestorDeck(): Promise<string> {
  return buildShowcasePdf({
    title: "SkaiScraper™ Product Showcase",
    subtitle: "AI-Powered Insurance Claims Management Platform",
    brandColor: "#4f46e5",
    sections: [
      {
        title: "Platform Overview",
        description:
          "Complete end-to-end claims workflow automation with AI-powered reports, evidence management, and carrier integrations.",
      },
      {
        title: "AI Tools Suite",
        description:
          "Generate mockups, analyze DOL data, pull weather reports, and build carrier exports automatically.",
      },
      {
        title: "Evidence Management",
        description: "Drag-and-drop uploads with AI-powered annotation and categorization.",
      },
      {
        title: "Billing & Tokens",
        description: "Flexible token-based pricing with usage tracking and pack purchases.",
      },
      {
        title: "Multi-Tenant Branding",
        description: "White-label solution with custom branding for each organization.",
      },
    ],
  });
}
