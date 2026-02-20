/**
 * Material Brochure Generator
 *
 * Generates professional material selection brochures.
 * Exportable as standalone PDF.
 */

import PDFDocument from "pdfkit";

import type { MaterialProduct } from "../materials/vendor-catalog";

export interface BrochureOptions {
  products: MaterialProduct[];
  companyName?: string;
  companyLogo?: string;
  primaryColor?: string;
  includeComparison?: boolean;
  includePricing?: boolean;
}

/**
 * Generate material brochure PDF
 */
export async function generateMaterialBrochure(options: BrochureOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const primaryColor = options.primaryColor || "#2563eb";

      // Cover Page
      doc
        .fontSize(32)
        .fillColor(primaryColor)
        .text(options.companyName || "Roofing Material Selection Guide", {
          align: "center",
        });

      doc.moveDown(1);
      doc.fontSize(16).fillColor("#64748b").text("Professional Material Options for Your Home", {
        align: "center",
      });

      doc.moveDown(3);

      // Products
      options.products.forEach((product, idx) => {
        if (idx > 0) doc.addPage();

        // Product Header
        doc.fontSize(24).fillColor(primaryColor).text(product.name, { underline: true });

        doc.moveDown(0.5);
        doc
          .fontSize(14)
          .fillColor("#64748b")
          .text(`${product.manufacturer} - ${product.productLine}`);

        doc.moveDown(1);

        // Specifications
        doc.fontSize(16).fillColor("#000000").text("Specifications:");
        doc.moveDown(0.5);

        doc.fontSize(11).fillColor("#374151");
        doc.text(`Warranty: ${product.warranty} years`);
        doc.text(`Wind Rating: ${product.windRating} mph`);
        if (product.impactRating) {
          doc.text(`Impact Rating: ${product.impactRating}`);
        }
        doc.text(`Type: ${product.type}`);
        doc.text(`Weight: ${product.specifications.weight}`);
        doc.text(`Coverage: ${product.specifications.coverage}`);

        doc.moveDown(1);

        // Pricing (if enabled)
        if (options.includePricing) {
          doc.fontSize(16).fillColor(primaryColor).text("Pricing:");
          doc.moveDown(0.5);

          doc.fontSize(11).fillColor("#374151");
          doc.text(`Material: $${product.pricing.material} per square`);
          doc.text(`Labor: $${product.pricing.labor} per square`);
          doc.fontSize(14).fillColor(primaryColor);
          doc.text(`Total: $${product.pricing.total} per square`, {
            bold: true,
          });

          doc.moveDown(1);
        }

        // Features
        doc.fontSize(16).fillColor("#000000").text("Key Features:");
        doc.moveDown(0.5);

        doc.fontSize(10).fillColor("#374151");
        product.features.forEach((feature) => {
          doc.text(`• ${feature}`, { indent: 10 });
        });

        doc.moveDown(1);

        // Colors (next page if many)
        if (product.colors.length > 6) doc.addPage();

        doc.fontSize(16).fillColor(primaryColor).text("Available Colors:");
        doc.moveDown(0.5);

        product.colors.forEach((color) => {
          // Color swatch (simulated with box)
          doc.rect(doc.x, doc.y, 30, 20).fillAndStroke(color.hexCode, "#000");

          doc
            .fontSize(11)
            .fillColor("#000000")
            .text(color.name, doc.x + 35, doc.y - 15);

          doc
            .fontSize(9)
            .fillColor("#64748b")
            .text(color.description, doc.x + 35, doc.y - 15, { width: 400 });

          doc.moveDown(1.2);
        });

        doc.moveDown(1);

        // Best For
        doc.fontSize(16).fillColor("#000000").text("Best For:");
        doc.moveDown(0.5);

        doc.fontSize(10).fillColor("#374151");
        product.bestFor.forEach((use) => {
          doc.text(`• ${use}`, { indent: 10 });
        });
      });

      // Comparison Page (if enabled)
      if (options.includeComparison && options.products.length > 1) {
        doc.addPage();

        doc.fontSize(20).fillColor(primaryColor).text("Product Comparison", { underline: true });

        doc.moveDown(1);

        // Comparison table (simplified)
        doc.fontSize(10).fillColor("#000000");

        options.products.forEach((product, idx) => {
          doc.text(
            `${idx + 1}. ${product.name}: $${product.pricing.total}/sq • ${product.warranty}yr • ${product.windRating}mph`
          );
          doc.moveDown(0.5);
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Export material comparison table
 */
export function exportMaterialComparison(products: MaterialProduct[]): string {
  const lines: string[] = [];

  lines.push("MATERIAL COMPARISON");
  lines.push("═".repeat(80));
  lines.push("");

  // Header
  lines.push(
    "Product".padEnd(30) + "Price".padEnd(12) + "Warranty".padEnd(12) + "Wind".padEnd(10) + "Impact"
  );
  lines.push("─".repeat(80));

  // Products
  products.forEach((product) => {
    lines.push(
      product.name.padEnd(30) +
        `$${product.pricing.total}/sq`.padEnd(12) +
        `${product.warranty}yr`.padEnd(12) +
        `${product.windRating}mph`.padEnd(10) +
        (product.impactRating || "N/A")
    );
  });

  return lines.join("\n");
}

/**
 * Generate color selection guide
 */
export function generateColorGuide(product: MaterialProduct): string {
  const lines: string[] = [];

  lines.push(`${product.name.toUpperCase()} - COLOR OPTIONS`);
  lines.push("═".repeat(60));
  lines.push("");

  product.colors.forEach((color, idx) => {
    lines.push(`${idx + 1}. ${color.name}`);
    lines.push(`   Color Code: ${color.hexCode}`);
    lines.push(`   Description: ${color.description}`);
    lines.push(`   Popularity: ${color.popularity.toUpperCase()}`);
    lines.push("");
  });

  return lines.join("\n");
}
