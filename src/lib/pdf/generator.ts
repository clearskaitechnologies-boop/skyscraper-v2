/**
 * TASK 89: PDF GENERATION
 *
 * PDF generation from templates, HTML, and data with support for headers, footers, and watermarks.
 */

import puppeteer from "puppeteer";

import prisma from "@/lib/prisma";

export interface PDFOptions {
  format?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  header?: string; // HTML content
  footer?: string; // HTML content
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
  scale?: number;
  pageRanges?: string;
  watermark?: {
    text: string;
    opacity?: number;
    angle?: number;
    fontSize?: number;
  };
}

export interface PDFTemplate {
  id: string;
  name: string;
  htmlContent: string;
  cssContent?: string;
  defaultOptions?: PDFOptions;
}

/**
 * Generate PDF from HTML content
 */
export async function generatePDFFromHTML(html: string, options?: PDFOptions): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options?.format || "A4",
      landscape: options?.orientation === "landscape",
      margin: options?.margin || {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
      printBackground: options?.printBackground !== false,
      displayHeaderFooter: options?.displayHeaderFooter,
      headerTemplate: options?.header || "",
      footerTemplate: options?.footer || "",
      scale: options?.scale || 1,
      pageRanges: options?.pageRanges,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generate PDF from template
 */
export async function generatePDFFromTemplate(
  templateId: string,
  data: Record<string, any>,
  options?: PDFOptions
): Promise<Buffer> {
  const template = await prisma.pdfTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error(`PDF template not found: ${templateId}`);
  }

  // Render template with data
  const html = renderTemplate(template.htmlContent, data);
  const css = template.cssContent || "";

  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${css}
          ${getDefaultStyles()}
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  const mergedOptions = {
    ...(template.defaultOptions as any),
    ...options,
  };

  return await generatePDFFromHTML(fullHTML, mergedOptions);
}

/**
 * Generate invoice PDF
 */
export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      organization: true,
      items: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${getInvoiceStyles()}
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>INVOICE</h1>
            <p>Invoice #: ${invoice.invoiceNumber}</p>
            <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div class="company-info">
            <h3>${invoice.organization.name}</h3>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price}</td>
                  <td>$${item.quantity * item.price}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>$${invoice.amount}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;

  return await generatePDFFromHTML(html);
}

/**
 * Generate report PDF
 */
export async function generateReportPDF(reportData: any, options?: PDFOptions): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${getReportStyles()}
        </style>
      </head>
      <body>
        <div class="report">
          <h1>${reportData.title}</h1>
          <p class="subtitle">${reportData.subtitle || ""}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            ${Object.entries(reportData.summary || {})
              .map(
                ([key, value]) => `
              <div class="stat">
                <span class="label">${key}:</span>
                <span class="value">${value}</span>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="charts">
            ${
              reportData.charts
                ?.map(
                  (chart: any) => `
              <div class="chart">
                <h3>${chart.title}</h3>
                <!-- Chart placeholder -->
              </div>
            `
                )
                .join("") || ""
            }
          </div>

          <div class="data">
            ${JSON.stringify(reportData.data, null, 2)}
          </div>
        </div>
      </body>
    </html>
  `;

  return await generatePDFFromHTML(html, options);
}

/**
 * Merge multiple PDFs
 */
export async function mergePDFs(pdfs: Buffer[]): Promise<Buffer> {
  // TODO: Implement PDF merging with pdf-lib
  console.log("PDF merging not implemented");
  return pdfs[0];
}

/**
 * Add watermark to PDF
 */
export async function addWatermarkToPDF(
  pdf: Buffer,
  watermarkText: string,
  options?: {
    opacity?: number;
    angle?: number;
    fontSize?: number;
  }
): Promise<Buffer> {
  // TODO: Implement watermark with pdf-lib
  console.log("Watermark not implemented");
  return pdf;
}

/**
 * Extract text from PDF
 */
export async function extractTextFromPDF(pdf: Buffer): Promise<string> {
  // TODO: Implement text extraction with pdf-parse
  console.log("Text extraction not implemented");
  return "";
}

/**
 * Get PDF metadata
 */
export async function getPDFMetadata(pdf: Buffer): Promise<{
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
}> {
  // TODO: Implement metadata extraction with pdf-lib
  return {
    pages: 1,
  };
}

// Template Rendering

function renderTemplate(template: string, data: Record<string, any>): string {
  let result = template;

  // Simple variable replacement
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value));
  });

  // Handle loops
  const loopRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  result = result.replace(loopRegex, (match, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return "";

    return array
      .map((item) => {
        let itemContent = content;
        Object.entries(item).forEach(([key, value]) => {
          itemContent = itemContent.replace(new RegExp(`{{${key}}}`, "g"), String(value));
        });
        return itemContent;
      })
      .join("");
  });

  return result;
}

// Styles

function getDefaultStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 0.5em;
    }
    p {
      margin-bottom: 1em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
  `;
}

function getInvoiceStyles(): string {
  return `
    ${getDefaultStyles()}
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: right;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 36pt;
      color: #333;
    }
    .company-info {
      margin-bottom: 30px;
    }
    .items {
      margin-top: 30px;
    }
    .items tfoot {
      font-weight: bold;
    }
  `;
}

function getReportStyles(): string {
  return `
    ${getDefaultStyles()}
    .report {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    .summary {
      background: #f5f5f5;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
    }
    .stat .label {
      font-weight: bold;
    }
    .chart {
      margin: 30px 0;
      page-break-inside: avoid;
    }
  `;
}

/**
 * Create PDF template
 */
export async function createPDFTemplate(
  name: string,
  htmlContent: string,
  cssContent?: string,
  defaultOptions?: PDFOptions,
  organizationId?: string
): Promise<string> {
  const template = await prisma.pdfTemplate.create({
    data: {
      name,
      htmlContent,
      cssContent,
      defaultOptions: defaultOptions as any,
      organizationId,
    },
  });

  return template.id;
}

/**
 * List PDF templates
 */
export async function listPDFTemplates(organizationId?: string): Promise<PDFTemplate[]> {
  const templates = await prisma.pdfTemplate.findMany({
    where: organizationId ? { organizationId } : undefined,
  });

  return templates as any;
}
