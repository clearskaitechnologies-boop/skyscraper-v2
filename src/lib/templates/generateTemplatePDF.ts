/**
 * PDF Generation for Templates
 *
 * Generates PDF from template with company branding applied
 * Uses React-PDF or Puppeteer for rendering
 */

import { getMergedTemplate } from "./mergeTemplate";

interface PDFGenerationOptions {
  templateId: string;
  orgId: string;
  claimData?: {
    claimNumber?: string;
    lossDate?: string;
    propertyAddress?: string;
    insured_name?: string;
  };
}

/**
 * Generate PDF from template with branding
 *
 * @param options - Template ID, org ID, and optional claim data
 * @returns PDF buffer or URL to generated PDF
 */
export async function generateTemplatePDF(options: PDFGenerationOptions): Promise<Buffer | string> {
  const { templateId, orgId, claimData } = options;

  console.log(`[PDF_GENERATION] Starting PDF generation for template ${templateId}`);

  try {
    // 1. Get merged template with branding
    const mergedTemplate = await getMergedTemplate(templateId, orgId);

    if (!mergedTemplate) {
      throw new Error("Template not found or branding merge failed");
    }

    console.log(`[PDF_GENERATION] Merged template loaded with branding`);

    // 2. Generate PDF using Puppeteer (server-side rendering)
    // This approach renders the preview page and converts to PDF
    const pdfBuffer = await generatePDFWithPuppeteer(templateId, orgId, claimData);

    console.log(`[PDF_GENERATION] PDF generated successfully (${pdfBuffer.length} bytes)`);

    return pdfBuffer;
  } catch (error: any) {
    console.error(`[PDF_GENERATION] Error:`, error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Generate PDF using Puppeteer (server-side rendering)
 *
 * This renders the preview page in headless browser and exports to PDF
 */
async function generatePDFWithPuppeteer(
  templateId: string,
  orgId: string,
  claimData?: any
): Promise<Buffer> {
  // Note: This is a placeholder for Puppeteer implementation
  // In production, you would:
  // 1. Launch headless browser
  // 2. Navigate to preview page
  // 3. Wait for template to load
  // 4. Generate PDF
  // 5. Return buffer

  // For now, we'll return a simple PDF generation notice
  // You'll need to install puppeteer: pnpm add puppeteer

  throw new Error(
    "PDF generation requires Puppeteer setup. " +
      "Run: pnpm add puppeteer && configure CHROME_BIN environment variable"
  );

  // Example Puppeteer code (uncomment when ready):
  /*
  const puppeteer = require('puppeteer');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Navigate to preview page
  const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reports/templates/${templateId}/preview`;
  await page.goto(previewUrl, { waitUntil: 'networkidle0' });

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
  });

  await browser.close();

  return pdfBuffer;
  */
}

/**
 * Generate PDF using React-PDF (alternative approach)
 *
 * This uses @react-pdf/renderer to generate PDF programmatically
 */
export async function generatePDFWithReactPDF(
  templateId: string,
  orgId: string,
  claimData?: any
): Promise<Buffer> {
  // Note: This is a placeholder for React-PDF implementation
  // You would need to:
  // 1. Install @react-pdf/renderer
  // 2. Create PDF components matching preview
  // 3. Render to buffer

  throw new Error(
    "React-PDF generation not yet implemented. " +
      "Use Puppeteer approach for now or implement React-PDF components"
  );

  // Example React-PDF code (uncomment when ready):
  /*
  import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

  const mergedTemplate = await getMergedTemplate(templateId, orgId);

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 20,
      borderBottom: `2px solid ${mergedTemplate.styles.primaryColor}`,
      paddingBottom: 10,
    },
    // ... more styles
  });

  const PDFDocument = () => (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text>{mergedTemplate.header.companyName}</Text>
        </View>
        {mergedTemplate.sections.map((section) => (
          <View key={section.type}>
            <Text>{section.type}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );

  const pdfBuffer = await pdf(<PDFDocument />).toBuffer();
  return pdfBuffer;
  */
}

/**
 * Save generated PDF to storage
 *
 * @param pdfBuffer - PDF data buffer
 * @param filename - Desired filename
 * @returns URL to stored PDF
 */
export async function savePDFToStorage(pdfBuffer: Buffer, filename: string): Promise<string> {
  // TODO: Implement storage upload
  // Options:
  // 1. Supabase Storage
  // 2. AWS S3
  // 3. Vercel Blob Storage

  console.log(`[PDF_STORAGE] Would save PDF: ${filename} (${pdfBuffer.length} bytes)`);

  // Placeholder URL
  return `/api/pdfs/${filename}`;
}
