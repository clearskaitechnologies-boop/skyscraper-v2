/**
 * Storm Intake PDF Report Generator
 * Generates branded PDF reports for storm damage assessments
 */

import type { MediaAttachment, StormEventSnapshot, StormIntake } from "@prisma/client";
import PDFDocument from "pdfkit";

interface StormIntakePDFData {
  intake: StormIntake & {
    stormEvent: StormEventSnapshot | null;
    media: MediaAttachment[];
  };
  branding?: {
    companyName?: string;
    logo?: string;
    primaryColor?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

/**
 * Generate PDF buffer for storm intake report
 */
export async function generateStormIntakePDF(data: StormIntakePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Storm Damage Assessment - ${data.intake.address}`,
          Author: data.branding?.companyName || "SkaiScraper",
          Subject: "Storm Damage Assessment Report",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const primaryColor = data.branding?.primaryColor || "#2563eb";

      // PAGE 1: COVER PAGE
      addCoverPage(doc, data, primaryColor);

      // PAGE 2: PROPERTY DETAILS
      doc.addPage();
      addPropertyDetails(doc, data, primaryColor);

      // PAGE 3: STORM EVENT DATA
      if (data.intake.stormEvent) {
        doc.addPage();
        addStormEventSection(doc, data, primaryColor);
      }

      // PAGE 4: DAMAGE ASSESSMENT
      doc.addPage();
      addDamageAssessment(doc, data, primaryColor);

      // PAGE 5: RECOMMENDATIONS
      doc.addPage();
      addRecommendations(doc, data, primaryColor);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addCoverPage(doc: PDFKit.PDFDocument, data: StormIntakePDFData, color: string) {
  const { intake, branding } = data;

  // Title
  doc.fontSize(32).fillColor(color).text("Storm Damage Assessment", 50, 200, {
    align: "center",
  });

  // Address
  doc
    .fontSize(18)
    .fillColor("#000")
    .text(intake.address || "Property Assessment", 50, 260, {
      align: "center",
    });
  doc.fontSize(14).text(`${intake.city}, ${intake.state} ${intake.zip}`, {
    align: "center",
  });

  // Severity Score
  if (intake.severityScore !== null) {
    doc.moveDown(3);
    doc.fontSize(48).fillColor(color).text(intake.severityScore.toString(), {
      align: "center",
    });
    doc.fontSize(16).fillColor("#000").text("Severity Score", {
      align: "center",
    });
  }

  // Branding
  doc.fontSize(12).fillColor("#666");
  doc.text(branding?.companyName || "SkaiScraper", 50, 700, { align: "center" });
  if (branding?.phone) {
    doc.text(branding.phone, { align: "center" });
  }
  if (branding?.website) {
    doc.text(branding.website, { align: "center" });
  }

  // Generated date
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 750, {
    align: "center",
  });
}

function addPropertyDetails(doc: PDFKit.PDFDocument, data: StormIntakePDFData, color: string) {
  const { intake } = data;

  doc.fontSize(24).fillColor(color).text("Property Details", 50, 50);
  doc.moveDown();

  doc.fontSize(12).fillColor("#000");

  // Address
  doc.text(`Address: ${intake.address}`, 50, 100);
  doc.text(`City: ${intake.city}`);
  doc.text(`State: ${intake.state}`);
  doc.text(`ZIP: ${intake.zip}`);

  if (intake.county) {
    doc.text(`County: ${intake.county}`);
  }

  doc.moveDown();

  // Structure details
  if (intake.roofType || intake.houseSqFt || intake.yearBuilt) {
    doc.fontSize(16).fillColor(color).text("Structure Information", 50, doc.y);
    doc.moveDown();
    doc.fontSize(12).fillColor("#000");

    if (intake.roofType) {
      doc.text(`Roof Type: ${intake.roofType}`);
    }
    if (intake.houseSqFt) {
      doc.text(`Square Footage: ${intake.houseSqFt.toLocaleString()} sq ft`);
    }
    if (intake.yearBuilt) {
      doc.text(`Year Built: ${intake.yearBuilt}`);
    }
  }
}

function addStormEventSection(doc: PDFKit.PDFDocument, data: StormIntakePDFData, color: string) {
  const { intake } = data;
  const event = intake.stormEvent;

  if (!event) return;

  doc.fontSize(24).fillColor(color).text("Storm Event History", 50, 50);
  doc.moveDown();

  doc.fontSize(12).fillColor("#000");

  // Hail data
  if (event.hailDate) {
    doc.fontSize(16).fillColor(color).text("Hail Event", 50, doc.y);
    doc.moveDown();
    doc.fontSize(12).fillColor("#000");
    doc.text(`Date: ${new Date(event.hailDate).toLocaleDateString()}`);
    if (event.hailSize) {
      doc.text(`Hail Size: ${event.hailSize}" diameter`);
    }
    doc.moveDown();
  }

  // Wind data
  if (event.windDate) {
    doc.fontSize(16).fillColor(color).text("Wind Event", 50, doc.y);
    doc.moveDown();
    doc.fontSize(12).fillColor("#000");
    doc.text(`Date: ${new Date(event.windDate).toLocaleDateString()}`);
    if (event.windSpeed) {
      doc.text(`Wind Speed: ${event.windSpeed} mph`);
    }
    doc.moveDown();
  }

  // Total storms
  if (event.stormsLast12Months !== null) {
    doc.fontSize(14).fillColor("#000");
    doc.text(`Total Storms (Last 12 Months): ${event.stormsLast12Months}`);
    doc.moveDown();
  }

  // Data source
  doc.fontSize(10).fillColor("#666");
  doc.text(`Weather data provided by ${event.provider}`);
}

function addDamageAssessment(doc: PDFKit.PDFDocument, data: StormIntakePDFData, color: string) {
  const { intake } = data;

  doc.fontSize(24).fillColor(color).text("Damage Assessment", 50, 50);
  doc.moveDown();

  doc.fontSize(12).fillColor("#000");

  // Damage indicators
  const indicators: string[] = [];
  if (intake.hailDamage) indicators.push("Hail damage present");
  if (intake.windDamage) indicators.push("Wind damage present");
  if (intake.leaksPresent) indicators.push("Active leaks detected");
  if (intake.interiorDamage) indicators.push("Interior damage noted");

  if (indicators.length > 0) {
    doc.fontSize(16).fillColor(color).text("Damage Indicators", 50, doc.y);
    doc.moveDown();
    doc.fontSize(12).fillColor("#000");
    indicators.forEach((indicator) => {
      doc.text(`• ${indicator}`);
    });
    doc.moveDown(2);
  } else {
    doc.text("No damage indicators reported.");
    doc.moveDown(2);
  }

  // Severity assessment
  if (intake.severityScore !== null) {
    doc.fontSize(16).fillColor(color).text("Severity Assessment", 50, doc.y);
    doc.moveDown();
    doc.fontSize(14).fillColor("#000");
    doc.text(`Overall Severity Score: ${intake.severityScore}/100`);
    doc.moveDown();

    const score = intake.severityScore;
    let assessment = "";
    if (score >= 70) {
      assessment = "High Risk - Professional inspection strongly recommended";
    } else if (score >= 40) {
      assessment = "Moderate Risk - Consider professional assessment";
    } else {
      assessment = "Low Risk - Continue monitoring";
    }
    doc.fontSize(12).text(assessment);
  }
}

function addRecommendations(doc: PDFKit.PDFDocument, data: StormIntakePDFData, color: string) {
  const { intake } = data;

  doc.fontSize(24).fillColor(color).text("Recommendations", 50, 50);
  doc.moveDown();

  doc.fontSize(12).fillColor("#000");

  const score = intake.severityScore || 0;

  if (score >= 70) {
    doc.text("• Schedule immediate professional inspection");
    doc.text("• Document all damage with photos");
    doc.text("• Contact your insurance company");
    doc.text("• Consider emergency repairs to prevent further damage");
  } else if (score >= 40) {
    doc.text("• Schedule professional assessment within 1-2 weeks");
    doc.text("• Monitor for changes in damage severity");
    doc.text("• Document damage with photos");
    doc.text("• Review insurance coverage");
  } else {
    doc.text("• Continue monitoring property condition");
    doc.text("• Schedule routine maintenance inspection");
    doc.text("• Keep photos for records");
    doc.text("• Review roof warranty if applicable");
  }

  doc.moveDown(2);
  doc.fontSize(10).fillColor("#666");
  doc.text(
    "This assessment is based on homeowner-provided information and should not replace a professional inspection."
  );
}
