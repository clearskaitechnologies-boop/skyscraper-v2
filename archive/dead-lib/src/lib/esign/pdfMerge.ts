/**
 * PDF Merge Utility - Signature Injection
 *
 * Merges signature images into PDFs using pdf-lib
 * Never overwrites originals - always creates new signed PDF
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { rectToPoints, type SignatureFieldRect } from "./placements";

export interface SignaturePlacement {
  rect: SignatureFieldRect;
  pngBytes: Uint8Array; // transparent PNG from canvas
  signedAtIso?: string;
  signerLabel?: string; // "Homeowner", "Contractor"
}

export interface SignatureMetadata {
  companyName: string;
  claimId: string;
  propertyAddress?: string;
  signerName: string;
  signerEmail?: string;
  signedAt: string;
  signerIp?: string;
  userAgent?: string;
}

/**
 * Apply signature images to PDF at specified placements
 * Returns new PDF bytes with signatures embedded
 */
export async function applySignatureImagesToPdf(args: {
  sourcePdfBytes: Uint8Array;
  placements: SignaturePlacement[];
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(args.sourcePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const p of args.placements) {
    const page = pdfDoc.getPage(p.rect.pageIndex);
    const pageW = page.getWidth();
    const pageH = page.getHeight();

    const { x, y, w, h } = rectToPoints(p.rect, pageW, pageH);

    // Embed signature PNG
    const png = await pdfDoc.embedPng(p.pngBytes);
    const pngDims = png.scale(1);

    // Fit image into field rect, preserve aspect ratio
    const scale = Math.min(w / pngDims.width, h / pngDims.height);
    const drawW = pngDims.width * scale;
    const drawH = pngDims.height * scale;

    const drawX = x + (w - drawW) / 2;
    const drawY = y + (h - drawH) / 2;

    page.drawImage(png, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
      opacity: 1,
    });

    // Optional: Add "Signed" line below signature
    if (p.signedAtIso || p.signerLabel) {
      const signedLine = [
        p.signerLabel ? `${p.signerLabel} signed` : "Signed",
        p.signedAtIso ? `• ${new Date(p.signedAtIso).toLocaleString()}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      page.drawText(signedLine, {
        x: x,
        y: Math.max(2, y - 10),
        size: 8,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
    }
  }

  const out = await pdfDoc.save();
  return out;
}

/**
 * Append a full signature page to the end of a PDF
 * Use this when you don't have specific field placements
 */
export async function appendSignaturePage(
  sourcePdfBytes: Uint8Array,
  meta: SignatureMetadata,
  signatureImageBase64: string
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(sourcePdfBytes);

  const page = pdf.addPage();
  const { width, height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Decode signature image
  const signatureImageBytes = Uint8Array.from(
    Buffer.from(signatureImageBase64.split(",")[1], "base64")
  );
  const signatureImage = await pdf.embedPng(signatureImageBytes);

  const margin = 48;
  let y = height - margin;

  const draw = (text: string, size = 11, isBold = false) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0, 0, 0),
    });
    y -= size + 8;
  };

  // Header
  draw(meta.companyName, 14, true);
  y -= 12;

  draw("DOCUMENT EXECUTION", 12, true);
  y -= 12;

  draw("This document was electronically signed.");
  y -= 20;

  // Signature section
  draw("Client Signature:", 11, true);
  y -= 8;

  page.drawImage(signatureImage, {
    x: margin,
    y: y - 120,
    width: 400,
    height: 120,
  });

  y -= 140;

  // Signer details
  draw(`Printed Name: ${meta.signerName}`);
  draw(`Email: ${meta.signerEmail ?? "—"}`);
  draw(`Date Signed: ${meta.signedAt}`);
  y -= 12;

  // Audit metadata
  draw(`IP Address: ${meta.signerIp ?? "—"}`);
  draw(`User Agent: ${meta.userAgent ?? "—"}`);
  y -= 12;

  draw(`Claim ID: ${meta.claimId}`);
  draw(`Property Address: ${meta.propertyAddress ?? "—"}`);

  return await pdf.save();
}

/**
 * Generate a hash of PDF bytes for integrity checking
 */
export async function generatePdfHash(pdfBytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", pdfBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
