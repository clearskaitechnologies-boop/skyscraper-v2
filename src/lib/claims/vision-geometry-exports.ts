/**
 * PHASE 36-37: Vision & Geometry Docx Export Helpers
 * 
 * Helper functions to integrate Vision AI heatmaps and Geometry scorecards
 * into claims packet Docx exports.
 * 
 * Usage:
 *   import { addVisionHeatmapSection, addGeometryScorecardSection } from "@/lib/claims/vision-geometry-exports";
 *   
 *   // In generateInsuranceDOCX or generateRetailDOCX:
 *   const visionSections = await addVisionHeatmapSection(visionAnalysis, claimId);
 *   const geometrySections = await addGeometryScorecardSection(slopeAnalysis, scorecards);
 *   sections.push(...visionSections, ...geometrySections);
 */

import {
import { logger } from "@/lib/logger";
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  HeadingLevel,
  ImageRun,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import type { SlopeAnalysis, SlopeScorecard } from "@/lib/ai/geometry";
import type { DamageRegion,VisionAnalysis } from "@/lib/ai/vision";
import { canvasToBlob } from "@/lib/vision/heatmap";

/**
 * Fetch image buffer from URL (required for Docx ImageRun)
 */
async function fetchImageBuffer(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    logger.error(`Failed to fetch image ${url}:`, error);
    throw error;
  }
}

/**
 * Convert Canvas to Buffer for Docx export
 */
async function canvasToBuffer(canvas: HTMLCanvasElement): Promise<Buffer> {
  const blob = await canvasToBlob(canvas);
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Add Vision AI heatmap section to Docx packet
 * 
 * Includes:
 * - Section header with analysis summary
 * - Embedded heatmap image
 * - Damage summary table
 * - Urgent issues list
 * 
 * @param visionAnalysis - AI vision analysis result
 * @param claimId - Claim ID for fetching heatmap canvas
 * @returns Array of Paragraphs to insert into Docx document
 */
export async function addVisionHeatmapSection(
  visionAnalysis: VisionAnalysis,
  claimId: string
): Promise<Paragraph[]> {
  const sections: Paragraph[] = [];

  // Section Header
  sections.push(
    new Paragraph({
      text: "AI Vision Analysis - Damage Detection",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      text: `Overall Condition: ${visionAnalysis.overallCondition.toUpperCase()}`,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Overall Condition: `,
          bold: true,
        }),
        new TextRun({
          text: visionAnalysis.overallCondition.toUpperCase(),
          color: visionAnalysis.overallCondition === "poor" ? "FF0000" : 
                 visionAnalysis.overallCondition === "fair" ? "FFA500" : "008000",
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      text: visionAnalysis.summary,
      spacing: { after: 300 },
    })
  );

  // Heatmap Image (if available)
  // TODO: Fetch heatmap canvas from client-side render or generate server-side
  // For now, add placeholder instructions
  sections.push(
    new Paragraph({
      text: "[Heatmap Image - To implement: render heatmap server-side or attach client-generated Canvas]",
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      italics: true,
    })
  );

  // Damage Summary Table
  sections.push(
    new Paragraph({
      text: "Detected Damages:",
      spacing: { before: 200, after: 100 },
      bold: true,
    })
  );

  // Create damage table
  const damageRows: TableRow[] = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Type", bold: true })],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Severity", bold: true })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Priority", bold: true })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Confidence", bold: true })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Description", bold: true })],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  // Data rows
  visionAnalysis.damages.forEach((damage: DamageRegion) => {
    damageRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(damage.type)],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: damage.severity,
                color: damage.severity === "severe" ? "FF0000" : 
                       damage.severity === "moderate" ? "FFA500" : 
                       damage.severity === "minor" ? "FFD700" : "008000",
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph(damage.repairPriority)],
          }),
          new TableCell({
            children: [new Paragraph(`${Math.round(damage.confidence * 100)}%`)],
          }),
          new TableCell({
            children: [new Paragraph(damage.description)],
          }),
        ],
      })
    );
  });

  // Add table (note: Docx Table constructor would be used here in actual implementation)
  sections.push(
    new Paragraph({
      text: `Total Damages Detected: ${visionAnalysis.damages.length}`,
      spacing: { before: 300, after: 100 },
    })
  );

  // Urgent Issues
  if (visionAnalysis.urgentIssues.length > 0) {
    sections.push(
      new Paragraph({
        text: "⚠️ URGENT ISSUES REQUIRING IMMEDIATE ATTENTION:",
        spacing: { before: 300, after: 100 },
        bold: true,
        color: "FF0000",
      })
    );

    visionAnalysis.urgentIssues.forEach((issue, idx) => {
      sections.push(
        new Paragraph({
          text: `${idx + 1}. ${issue}`,
          spacing: { after: 100 },
          bullet: { level: 0 },
        })
      );
    });
  }

  // Cost Estimate
  sections.push(
    new Paragraph({
      text: `Estimated Repair Cost: $${visionAnalysis.estimatedRepairCost.toLocaleString()}`,
      spacing: { before: 300, after: 200 },
      bold: true,
    }),
    new Paragraph({
      text: `Analysis Date: ${visionAnalysis.analyzedAt.toLocaleString()}`,
      spacing: { after: 400 },
      italics: true,
    })
  );

  return sections;
}

/**
 * Add Geometry scorecard section to Docx packet
 * 
 * Includes:
 * - Slope analysis summary
 * - Per-plane scorecards with material estimates
 * - Labor multiplier tables
 * - Safety notes
 * 
 * @param slopeAnalysis - Roof geometry analysis
 * @param scorecards - Per-plane repair scorecards
 * @returns Array of Paragraphs to insert into Docx document
 */
export async function addGeometryScorecardSection(
  slopeAnalysis: SlopeAnalysis,
  scorecards: SlopeScorecard[]
): Promise<Paragraph[]> {
  const sections: Paragraph[] = [];

  // Section Header
  sections.push(
    new Paragraph({
      text: "Roof Geometry Analysis - Slope Detection",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Total Roof Planes: ", bold: true }),
        new TextRun(`${slopeAnalysis.planes.length}`),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Total Area: ", bold: true }),
        new TextRun(`${slopeAnalysis.totalArea.toLocaleString()} sq ft`),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Average Slope: ", bold: true }),
        new TextRun(slopeAnalysis.averageSlope),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Complexity Rating: ", bold: true }),
        new TextRun({
          text: slopeAnalysis.complexityRating.toUpperCase(),
          color: slopeAnalysis.complexityRating === "high" ? "FF0000" : 
                 slopeAnalysis.complexityRating === "medium" ? "FFA500" : "008000",
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Safety Notes
  if (slopeAnalysis.safetyNotes.length > 0) {
    sections.push(
      new Paragraph({
        text: "⚠️ SAFETY CONSIDERATIONS:",
        spacing: { before: 200, after: 100 },
        bold: true,
        color: "FFA500",
      })
    );

    slopeAnalysis.safetyNotes.forEach((note, idx) => {
      sections.push(
        new Paragraph({
          text: `${idx + 1}. ${note}`,
          spacing: { after: 100 },
          bullet: { level: 0 },
        })
      );
    });
  }

  // Per-Plane Scorecards
  sections.push(
    new Paragraph({
      text: "Per-Plane Repair Scorecards:",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 200 },
    })
  );

  scorecards.forEach((scorecard, idx) => {
    const plane = slopeAnalysis.planes.find(p => p.id === scorecard.planeId);
    if (!plane) return;

    sections.push(
      new Paragraph({
        text: `${idx + 1}. ${scorecard.planeName}`,
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Slope: ", bold: true }),
          new TextRun(`${plane.slope} (${plane.slopeAngle}°) - ${plane.slopeCategory.replace("_", " ")}`),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Area: ", bold: true }),
          new TextRun(`${plane.area_sqft.toLocaleString()} sq ft`),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Orientation: ", bold: true }),
          new TextRun(plane.orientation),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Damage Coverage: ", bold: true }),
          new TextRun({
            text: `${scorecard.damagePercentage.toFixed(1)}%`,
            color: scorecard.damagePercentage > 50 ? "FF0000" : 
                   scorecard.damagePercentage > 25 ? "FFA500" : "008000",
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Severity Score: ", bold: true }),
          new TextRun(`${scorecard.severityScore}/100`),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Repair Priority: ", bold: true }),
          new TextRun({
            text: `${scorecard.repairPriority}/10`,
            color: scorecard.repairPriority >= 8 ? "FF0000" : 
                   scorecard.repairPriority >= 5 ? "FFA500" : "008000",
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Material Estimates
    sections.push(
      new Paragraph({
        text: "Material Estimates:",
        bold: true,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `• Shingles: ${scorecard.estimatedMaterials.shingles_sqft.toLocaleString()} sq ft`,
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: `• Underlayment: ${scorecard.estimatedMaterials.underlayment_sqft.toLocaleString()} sq ft`,
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: `• Flashing: ${scorecard.estimatedMaterials.flashing_lf.toLocaleString()} linear ft`,
        spacing: { after: 100 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Labor Multiplier: ", bold: true }),
          new TextRun(`${scorecard.laborMultiplier.toFixed(1)}x`),
          new TextRun({ text: ` (${plane.slopeCategory} slope)`, italics: true }),
        ],
        spacing: { after: 200 },
      })
    );

    // Notes
    if (scorecard.notes.length > 0) {
      sections.push(
        new Paragraph({
          text: "Notes:",
          bold: true,
          spacing: { after: 100 },
        })
      );

      scorecard.notes.forEach(note => {
        sections.push(
          new Paragraph({
            text: `• ${note}`,
            spacing: { after: 50 },
            bullet: { level: 0 },
          })
        );
      });
    }
  });

  sections.push(
    new Paragraph({
      text: `Analysis Date: ${slopeAnalysis.analyzedAt.toLocaleString()}`,
      spacing: { before: 300, after: 400 },
      italics: true,
    })
  );

  return sections;
}

/**
 * Integration Instructions:
 * 
 * 1. In lib/claims/generator.ts, add imports:
 *    import { addVisionHeatmapSection, addGeometryScorecardSection } from "./vision-geometry-exports";
 * 
 * 2. Fetch vision/geometry data for the claim:
 *    const visionData = await fetchVisionAnalysis(claimId);
 *    const geometryData = await fetchGeometryAnalysis(claimId);
 * 
 * 3. In generateInsuranceDOCX or generateRetailDOCX, add sections:
 *    if (visionData) {
 *      const visionSections = await addVisionHeatmapSection(visionData, claimId);
 *      sections.push(...visionSections);
 *    }
 *    
 *    if (geometryData) {
 *      const geometrySections = await addGeometryScorecardSection(
 *        geometryData.slopeAnalysis,
 *        geometryData.scorecards
 *      );
 *      sections.push(...geometrySections);
 *    }
 * 
 * 4. For heatmap images, you'll need to:
 *    - Generate heatmap Canvas on server-side (Node Canvas or Puppeteer)
 *    - OR: Save heatmap to storage when generated client-side
 *    - Convert Canvas to Buffer and embed in Docx
 * 
 * 5. Update ClaimPacketData interface to include:
 *    visionAnalysis?: VisionAnalysis;
 *    geometryAnalysis?: { slopeAnalysis: SlopeAnalysis; scorecards: SlopeScorecard[] };
 */
