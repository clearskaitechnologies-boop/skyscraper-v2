/**
 * PDF Signature Placement System
 *
 * Anchored-percent rect coordinates for placing signatures on PDFs
 * Works across any PDF size (letter, legal, A4, etc.)
 */

export type PdfAnchor = "BOTTOM_LEFT" | "BOTTOM_RIGHT" | "TOP_LEFT" | "TOP_RIGHT";

export interface SignatureFieldRect {
  pageIndex: number;
  anchor: PdfAnchor;
  xPct: number; // 0..1 relative to page width
  yPct: number; // 0..1 relative to page height
  wPct: number; // 0..1 relative to page width
  hPct: number; // 0..1 relative to page height
  rotation?: number; // degrees
}

export interface SignatureFieldPlacement extends SignatureFieldRect {
  label: string;
  role: string; // "HOMEOWNER", "CONTRACTOR", "SPOUSE", "WITNESS"
  type: "SIGNATURE" | "INITIALS" | "TEXT" | "DATE";
  required: boolean;
}

/**
 * Convert anchored-percent rect to absolute PDF points
 */
export function rectToPoints(
  rect: SignatureFieldRect,
  pageWidth: number,
  pageHeight: number
): { x: number; y: number; w: number; h: number } {
  const w = rect.wPct * pageWidth;
  const h = rect.hPct * pageHeight;

  let x = rect.xPct * pageWidth;
  let y = rect.yPct * pageHeight;

  // Adjust based on anchor corner
  switch (rect.anchor) {
    case "BOTTOM_LEFT":
      // x, y already correct (default)
      break;
    case "BOTTOM_RIGHT":
      x = pageWidth - x - w;
      break;
    case "TOP_LEFT":
      y = pageHeight - y - h;
      break;
    case "TOP_RIGHT":
      x = pageWidth - x - w;
      y = pageHeight - y - h;
      break;
  }

  return { x, y, w, h };
}

/**
 * Default signature placements for standard service agreements
 * Works for most PDFs - adjust per template if needed
 */
export function getDefaultSignaturePlacements(): SignatureFieldPlacement[] {
  return [
    // Homeowner signature - bottom left
    {
      pageIndex: 0,
      anchor: "BOTTOM_LEFT",
      xPct: 0.1,
      yPct: 0.15,
      wPct: 0.38,
      hPct: 0.08,
      rotation: 0,
      label: "Homeowner Signature",
      role: "HOMEOWNER",
      type: "SIGNATURE",
      required: true,
    },
    // Homeowner printed name
    {
      pageIndex: 0,
      anchor: "BOTTOM_LEFT",
      xPct: 0.1,
      yPct: 0.08,
      wPct: 0.38,
      hPct: 0.05,
      rotation: 0,
      label: "Homeowner Printed Name",
      role: "HOMEOWNER",
      type: "TEXT",
      required: true,
    },
    // Homeowner date
    {
      pageIndex: 0,
      anchor: "BOTTOM_LEFT",
      xPct: 0.1,
      yPct: 0.02,
      wPct: 0.15,
      hPct: 0.05,
      rotation: 0,
      label: "Date",
      role: "HOMEOWNER",
      type: "DATE",
      required: true,
    },
    // Contractor signature - bottom right
    {
      pageIndex: 0,
      anchor: "BOTTOM_RIGHT",
      xPct: 0.1,
      yPct: 0.15,
      wPct: 0.38,
      hPct: 0.08,
      rotation: 0,
      label: "Contractor Signature",
      role: "CONTRACTOR",
      type: "SIGNATURE",
      required: true,
    },
    // Contractor printed name
    {
      pageIndex: 0,
      anchor: "BOTTOM_RIGHT",
      xPct: 0.1,
      yPct: 0.08,
      wPct: 0.38,
      hPct: 0.05,
      rotation: 0,
      label: "Contractor Printed Name",
      role: "CONTRACTOR",
      type: "TEXT",
      required: true,
    },
    // Contractor date
    {
      pageIndex: 0,
      anchor: "BOTTOM_RIGHT",
      xPct: 0.1,
      yPct: 0.02,
      wPct: 0.15,
      hPct: 0.05,
      rotation: 0,
      label: "Date",
      role: "CONTRACTOR",
      type: "DATE",
      required: true,
    },
  ];
}

/**
 * Get placements for a specific role
 */
export function getPlacementsForRole(
  placements: SignatureFieldPlacement[],
  role: string
): SignatureFieldPlacement[] {
  return placements.filter((p) => p.role === role);
}

/**
 * Validate that all required placements have been filled
 */
export function validateRequiredPlacements(
  placements: SignatureFieldPlacement[],
  filledFieldIds: string[]
): { valid: boolean; missing: string[] } {
  const required = placements.filter((p) => p.required);
  const missing = required.filter((p) => !filledFieldIds.includes(p.label)).map((p) => p.label);

  return {
    valid: missing.length === 0,
    missing,
  };
}
