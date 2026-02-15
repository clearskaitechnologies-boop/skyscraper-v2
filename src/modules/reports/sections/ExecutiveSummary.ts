// ============================================================================
// EXECUTIVE SUMMARY RENDERER
// ============================================================================

import { PDFFont, PDFPage, rgb } from "pdf-lib";

import type { ReportContext } from "../types";

export async function renderExecutiveSummary(
  page: PDFPage,
  context: ReportContext,
  fonts: { font: PDFFont; fontBold: PDFFont },
  colors: { brandRgb: any; accentRgb: any }
) {
  const { width, height } = page.getSize();
  const { font, fontBold } = fonts;
  const { accentRgb } = colors;

  // Title
  page.drawText("EXECUTIVE SUMMARY", {
    x: 60,
    y: height - 80,
    size: 20,
    font: fontBold,
    color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
  });

  // Summary content
  const summary = context.executiveSummary || 
    `This report documents storm damage to the property located at ${context.metadata.propertyAddress}. ` +
    `A qualifying weather event occurred on ${context.metadata.dateOfLoss}, resulting in damage requiring full roof replacement. ` +
    `All work will be performed in compliance with IRC/IBC codes and manufacturer requirements.`;

  // Word wrap summary
  const words = summary.split(" ");
  let line = "";
  let yPos = height - 130;
  const maxWidth = width - 120;

  words.forEach((word) => {
    const testLine = line + word + " ";
    const textWidth = font.widthOfTextAtSize(testLine, 12);
    
    if (textWidth > maxWidth && line !== "") {
      page.drawText(line, {
        x: 60,
        y: yPos,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      line = word + " ";
      yPos -= 18;
    } else {
      line = testLine;
    }
  });

  // Draw remaining line
  if (line.trim()) {
    page.drawText(line, {
      x: 60,
      y: yPos,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  // Bullet points
  yPos -= 40;
  page.drawText("KEY DECISION POINTS:", {
    x: 60,
    y: yPos,
    size: 13,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  yPos -= 30;
  const bullets = [
    "Qualifying weather event confirmed via NOAA / Stormersite data",
    "Damage assessment performed by licensed contractor",
    "All work meets or exceeds code requirements",
    "Manufacturer warranty compliance ensured",
  ];

  bullets.forEach((bullet) => {
    page.drawText("•", {
      x: 80,
      y: yPos,
      size: 14,
      font: fontBold,
      color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
    });

    page.drawText(bullet, {
      x: 100,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPos -= 24;
  });
}
