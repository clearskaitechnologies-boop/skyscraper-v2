/**
 * PDF Configuration & Quality Standards
 *
 * Centralized configuration for consistent PDF rendering across all report types.
 * Addresses pagination, typography, and formatting issues.
 */

import { StyleSheet } from "@react-pdf/renderer";

// ============================================================
// TYPOGRAPHY SYSTEM
// ============================================================

/**
 * Type scale following 8pt grid system
 * Base size: 10pt for body text (readable at print)
 */
export const typography = {
  // Headers
  h1: { fontSize: 24, fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: 18, fontWeight: 700, lineHeight: 1.3 },
  h3: { fontSize: 14, fontWeight: 700, lineHeight: 1.4 },
  h4: { fontSize: 12, fontWeight: 600, lineHeight: 1.4 },

  // Body text
  body: { fontSize: 10, fontWeight: 400, lineHeight: 1.6 },
  bodyLarge: { fontSize: 11, fontWeight: 400, lineHeight: 1.6 },
  bodySmall: { fontSize: 9, fontWeight: 400, lineHeight: 1.5 },

  // Supporting text
  caption: { fontSize: 8, fontWeight: 400, lineHeight: 1.4 },
  label: { fontSize: 9, fontWeight: 600, lineHeight: 1.4 },

  // Code/technical
  mono: { fontFamily: "Courier", fontSize: 9, lineHeight: 1.5 },
};

// ============================================================
// SPACING SYSTEM (8pt grid)
// ============================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Section spacing to prevent orphaned headers
 */
export const sectionSpacing = {
  // Space before section (ensures minimum content after header)
  beforeSection: spacing.lg,
  // Space after section header
  afterSectionHeader: spacing.md,
  // Space between paragraphs
  betweenParagraphs: spacing.sm,
  // Space between subsections
  betweenSubsections: spacing.md,
};

// ============================================================
// COLOR PALETTE
// ============================================================

export const colors = {
  // Brand colors
  primary: "#147BFF",
  secondary: "#ea580c",

  // Grays
  black: "#000000",
  gray900: "#1f2937",
  gray800: "#374151",
  gray700: "#4b5563",
  gray600: "#6b7280",
  gray500: "#9ca3af",
  gray400: "#d1d5db",
  gray300: "#e5e7eb",
  gray200: "#f3f4f6",
  gray100: "#f9fafb",
  white: "#ffffff",

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Theme-specific colors
  supplement: {
    primary: "#ea580c",
    light: "#fff7ed",
    dark: "#9a3412",
  },
  rebuttal: {
    primary: "#dc2626",
    light: "#fef2f2",
    dark: "#7f1d1d",
  },
  proposal: {
    primary: "#147BFF",
    light: "#eff6ff",
    dark: "#1e3a8a",
  },
};

// ============================================================
// PAGE CONFIGURATION
// ============================================================

export const pageConfig = {
  // Standard US Letter size (8.5" x 11")
  size: "LETTER" as const,

  // Margins (in points)
  margin: {
    top: 40,
    bottom: 60, // Extra space for footer + page numbers
    left: 40,
    right: 40,
  },

  // Content area calculations
  contentHeight: 792 - 40 - 60, // Letter height - top margin - bottom margin = 692pt
  contentWidth: 612 - 40 - 40, // Letter width - left margin - right margin = 532pt

  // Footer positioning
  footerOffset: 40, // Distance from bottom of page
};

// ============================================================
// PAGE BREAK RULES
// ============================================================

/**
 * Minimum space requirements to prevent orphans/widows
 */
export const pageBreakRules = {
  // Minimum space at bottom of page before section header
  minSpaceBeforeHeader: 120, // Enough for header + 3 lines of content

  // Minimum space for photo + caption
  minSpaceForPhoto: 220, // Photo (200pt) + caption (20pt)

  // Minimum space for table row
  minSpaceForTableRow: 30,

  // Minimum lines to keep together after header
  minLinesAfterHeader: 2,

  // Photo grid rules
  photoGrid: {
    minSpaceForSinglePhoto: 220,
    minSpaceForDoubleRow: 460, // Two photos side-by-side + captions
  },
};

// ============================================================
// SHARED STYLES (Base classes)
// ============================================================

export const baseStyles = StyleSheet.create({
  // Page wrapper with consistent margins
  page: {
    fontFamily: "Inter",
    paddingTop: pageConfig.margin.top,
    paddingBottom: pageConfig.margin.bottom,
    paddingLeft: pageConfig.margin.left,
    paddingRight: pageConfig.margin.right,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },

  // Section with proper page break hints
  section: {
    marginBottom: sectionSpacing.betweenSubsections,
    // Prevent orphaned headers (keep at least 2 lines with header)
    minPresenceAhead: pageBreakRules.minLinesAfterHeader,
  },

  // Section header with spacing
  sectionHeader: {
    ...typography.h2,
    color: colors.primary,
    marginTop: sectionSpacing.beforeSection,
    marginBottom: sectionSpacing.afterSectionHeader,
    textTransform: "uppercase",
    // Prevent orphaned headers
    breakAfter: false, // Don't break immediately after header
  },

  // Subsection header
  subsectionHeader: {
    ...typography.h3,
    color: colors.gray900,
    marginTop: sectionSpacing.betweenSubsections,
    marginBottom: sectionSpacing.afterSectionHeader,
    breakAfter: false,
  },

  // Paragraph with proper spacing
  paragraph: {
    ...typography.body,
    color: colors.gray800,
    marginBottom: sectionSpacing.betweenParagraphs,
  },

  // Label (bold key-value pairs)
  label: {
    ...typography.label,
    color: colors.gray900,
  },

  // Caption (under photos)
  caption: {
    ...typography.caption,
    color: colors.gray700,
    marginTop: spacing.xs,
  },

  // Divider
  divider: {
    marginVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
  },

  // Footer fixed to bottom
  footer: {
    position: "absolute",
    bottom: pageConfig.footerOffset,
    left: pageConfig.margin.left,
    right: pageConfig.margin.right,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: typography.caption.fontSize,
    color: colors.gray600,
  },

  // Page number fixed to bottom right
  pageNumber: {
    position: "absolute",
    bottom: pageConfig.footerOffset,
    right: pageConfig.margin.right,
    fontSize: typography.caption.fontSize,
    color: colors.gray600,
  },
});

// ============================================================
// TABLE STYLES
// ============================================================

export const tableStyles = StyleSheet.create({
  table: {
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 4,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.gray200,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray400,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },

  tableHeaderCell: {
    ...typography.label,
    color: colors.gray900,
    flex: 1,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    // Prevent row splits across pages
    minPresenceAhead: 1,
  },

  tableCell: {
    ...typography.bodySmall,
    color: colors.gray800,
    flex: 1,
  },

  // Alternate row background for readability
  tableRowAlt: {
    backgroundColor: colors.gray100,
  },
});

// ============================================================
// PHOTO GRID STYLES
// ============================================================

export const photoGridStyles = StyleSheet.create({
  // Container for photo row (2 columns)
  photoRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.md,
    // Keep photo + caption together
    minPresenceAhead: 1,
  },

  // Single photo column (50% width minus gap)
  photoColumn: {
    width: "48%",
  },

  // Photo image with consistent dimensions
  photoImage: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 4,
  },

  // Photo caption
  photoCaption: {
    ...typography.bodySmall,
    color: colors.gray800,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },

  // Code citation (italicized blue text)
  photoCode: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: "italic",
    fontWeight: 600,
  },
});

// ============================================================
// COVER PAGE STYLES
// ============================================================

export const coverStyles = StyleSheet.create({
  coverPage: {
    fontFamily: "Inter",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  companyLogo: {
    width: 200,
    height: 80,
    marginBottom: spacing.xl,
  },

  companyName: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },

  companyInfo: {
    ...typography.body,
    color: colors.gray600,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  reportTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.gray900,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    textAlign: "center",
    letterSpacing: 1,
  },

  clientInfo: {
    ...typography.bodyLarge,
    color: colors.gray800,
    marginBottom: spacing.xs,
    textAlign: "center",
  },

  qrCodeContainer: {
    marginTop: spacing.xl,
    alignItems: "center",
  },

  qrCode: {
    width: 80,
    height: 80,
  },

  qrCodeLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
});

// ============================================================
// THEME VARIANTS
// ============================================================

/**
 * Get themed colors based on report type
 */
export function getTheme(reportType: "supplement" | "rebuttal" | "proposal" | "standard") {
  const themeMap = {
    supplement: colors.supplement,
    rebuttal: colors.rebuttal,
    proposal: colors.proposal,
    standard: { primary: colors.primary, light: colors.gray100, dark: colors.gray900 },
  };

  return themeMap[reportType] || themeMap.standard;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate remaining space on page
 * Used for intelligent page breaks
 */
export function calculateRemainingSpace(currentY: number): number {
  return pageConfig.contentHeight - currentY;
}

/**
 * Check if content should break to new page
 */
export function shouldBreakPage(currentY: number, requiredSpace: number): boolean {
  return calculateRemainingSpace(currentY) < requiredSpace;
}

/**
 * Format page number (e.g., "Page 1 of 10")
 */
export function formatPageNumber(current: number, total?: number): string {
  return total ? `Page ${current} of ${total}` : `Page ${current}`;
}

/**
 * Safely truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date consistently
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
