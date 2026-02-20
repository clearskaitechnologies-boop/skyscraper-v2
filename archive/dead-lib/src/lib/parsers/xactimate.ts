// ============================================================================
// #179: Xactimate ESX / CSV / XML Parser
// ============================================================================
// Parses Xactimate export data (ESX XML, CSV, or plain-text formats) and
// returns structured line items compatible with the claims model.
//
// Builds on the inline parseXactimateText() from api/reports/supplement
// and extends it with full CSV and XML support.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XactimateLineItem {
  /** Xactimate category code (e.g. "RFG", "PLM", "DRY") */
  categoryCode: string;
  /** Selector / activity code (e.g. "RFGSHN") */
  activityCode: string;
  /** Human-readable description */
  description: string;
  /** Quantity */
  qty: number;
  /** Unit of measure (SQ, LF, SF, EA, etc.) */
  unit: string;
  /** Unit price in dollars */
  unitPrice: number;
  /** Line total (qty × unitPrice, or as-stated) */
  total: number;
  /** Room / area label if available */
  room?: string;
  /** Overhead & Profit flag */
  oAndP?: boolean;
  /** Tax amount if broken out */
  tax?: number;
  /** Original raw line for debugging */
  rawLine?: string;
}

export interface XactimateParseResult {
  /** Successfully parsed line items */
  lineItems: XactimateLineItem[];
  /** Overall totals extracted from summary rows */
  subtotal: number;
  overheadAndProfit: number;
  tax: number;
  grandTotal: number;
  /** Metadata from header rows */
  metadata: {
    claimNumber?: string;
    insuredName?: string;
    dateOfLoss?: string;
    estimateDate?: string;
    policyNumber?: string;
    carrier?: string;
  };
  /** Rows that couldn't be parsed */
  unparsedRows: string[];
  /** Format detected */
  format: "csv" | "xml" | "text";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Auto-detect format and parse Xactimate export data.
 *
 * @param input - Raw file content (string)
 * @returns Structured parse result
 */
export function parseXactimate(input: string): XactimateParseResult {
  const trimmed = input.trim();

  if (
    trimmed.startsWith("<?xml") ||
    trimmed.startsWith("<ESX") ||
    trimmed.startsWith("<Estimate")
  ) {
    return parseXactimateXML(trimmed);
  }

  // CSV detection: look for comma-separated headers with known Xactimate fields
  if (
    /^(Category|Cat\.|Sel\.|Activity|Description|Qty|Unit|Price|Total)/im.test(trimmed) &&
    trimmed.includes(",")
  ) {
    return parseXactimateCSV(trimmed);
  }

  // Fallback: treat as pipe-delimited or plain text
  return parseXactimateText(trimmed);
}

// ---------------------------------------------------------------------------
// CSV Parser
// ---------------------------------------------------------------------------

function parseXactimateCSV(input: string): XactimateParseResult {
  const rows = input
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  const result = emptyResult("csv");

  if (rows.length === 0) return result;

  // Detect header row
  const headerRow = rows.findIndex((r) => /description/i.test(r) && /qty|quantity/i.test(r));

  const headers = headerRow >= 0 ? parseCSVRow(rows[headerRow]) : [];
  const colMap = buildColumnMap(headers);

  // Parse metadata from rows above header
  for (let i = 0; i < (headerRow >= 0 ? headerRow : 0); i++) {
    extractMetadata(rows[i], result.metadata);
  }

  // Parse data rows
  const dataStart = headerRow >= 0 ? headerRow + 1 : 0;
  for (let i = dataStart; i < rows.length; i++) {
    const cols = parseCSVRow(rows[i]);
    if (cols.length < 3) continue;

    const item = mapColumnsToLineItem(cols, colMap, rows[i]);
    if (item) {
      // Detect summary rows
      if (/subtotal|sub-total/i.test(item.description)) {
        result.subtotal = item.total;
        continue;
      }
      if (/overhead|o\s*&\s*p|profit/i.test(item.description)) {
        result.overheadAndProfit = item.total;
        continue;
      }
      if (/tax/i.test(item.description)) {
        result.tax = item.total;
        continue;
      }
      if (/grand\s*total|net\s*claim|total\s*estimate/i.test(item.description)) {
        result.grandTotal = item.total;
        continue;
      }
      result.lineItems.push(item);
    } else {
      result.unparsedRows.push(rows[i]);
    }
  }

  computeTotals(result);
  return result;
}

// ---------------------------------------------------------------------------
// XML Parser (ESX format)
// ---------------------------------------------------------------------------

function parseXactimateXML(input: string): XactimateParseResult {
  const result = emptyResult("xml");

  // Simple tag-based extraction (no DOM parser needed in Edge/Node)
  // Extract metadata
  result.metadata.claimNumber =
    extractTag(input, "ClaimNumber") || extractTag(input, "claimNumber");
  result.metadata.insuredName =
    extractTag(input, "InsuredName") || extractTag(input, "insuredName");
  result.metadata.dateOfLoss = extractTag(input, "DateOfLoss") || extractTag(input, "dateOfLoss");
  result.metadata.policyNumber =
    extractTag(input, "PolicyNumber") || extractTag(input, "policyNumber");
  result.metadata.carrier = extractTag(input, "CarrierName") || extractTag(input, "carrierName");
  result.metadata.estimateDate =
    extractTag(input, "EstimateDate") || extractTag(input, "estimateDate");

  // Extract line items from <Line> or <LineItem> or <Item> elements
  const linePattern = /<(?:Line(?:Item)?|Item)\b[^>]*>([\s\S]*?)<\/(?:Line(?:Item)?|Item)>/gi;
  let match;

  while ((match = linePattern.exec(input)) !== null) {
    const block = match[1];

    const description = extractTag(block, "Description") || extractTag(block, "desc") || "";
    const activityCode =
      extractTag(block, "ActivityCode") ||
      extractTag(block, "Selector") ||
      extractTag(block, "Code") ||
      "";
    const categoryCode =
      extractTag(block, "Category") || extractTag(block, "CatCode") || activityCode.substring(0, 3);
    const qty = parseNum(extractTag(block, "Qty") || extractTag(block, "Quantity"));
    const unit = extractTag(block, "Unit") || extractTag(block, "UOM") || "EA";
    const unitPrice = parseNum(extractTag(block, "UnitPrice") || extractTag(block, "Price"));
    const total = parseNum(extractTag(block, "Total") || extractTag(block, "Amount"));
    const room = extractTag(block, "Room") || extractTag(block, "Area");

    if (description || activityCode) {
      result.lineItems.push({
        categoryCode: categoryCode.toUpperCase(),
        activityCode: activityCode.toUpperCase(),
        description: description || activityCode,
        qty: qty || 1,
        unit: unit.toUpperCase(),
        unitPrice: unitPrice || total / (qty || 1),
        total: total || qty * unitPrice,
        room: room || undefined,
      });
    }
  }

  computeTotals(result);
  return result;
}

// ---------------------------------------------------------------------------
// Plain-text / pipe-delimited parser
// ---------------------------------------------------------------------------

function parseXactimateText(input: string): XactimateParseResult {
  const result = emptyResult("text");
  const rows = input.split("\n").filter((r) => r.trim());

  for (const row of rows) {
    extractMetadata(row, result.metadata);

    // Pattern: "CODE - Description | QTY UNIT @ $RATE = $TOTAL"
    const pipeMatch = row.match(
      /^([\w\s-]+?)\s*[-–]\s*(.+?)\s*\|\s*(\d+\.?\d*)\s+(\w+)\s*@\s*\$?([\d,.]+)\s*=\s*\$?([\d,.]+)\s*$/
    );

    if (pipeMatch) {
      const [, code, desc, qty, unit, rate, total] = pipeMatch;
      result.lineItems.push({
        categoryCode: code.trim().substring(0, 3).toUpperCase(),
        activityCode: code.trim().toUpperCase(),
        description: desc.trim(),
        qty: parseFloat(qty),
        unit: unit.toUpperCase(),
        unitPrice: parseNum(rate),
        total: parseNum(total),
        rawLine: row,
      });
      continue;
    }

    // Simpler pattern: "Description | QTY UNIT @ $RATE = $TOTAL"
    const simpleMatch = row.match(
      /^(.+?)\s*\|\s*(\d+\.?\d*)\s+(\w+)\s*@\s*\$?([\d,.]+)\s*=\s*\$?([\d,.]+)\s*$/
    );

    if (simpleMatch) {
      const [, desc, qty, unit, rate, total] = simpleMatch;
      result.lineItems.push({
        categoryCode: "",
        activityCode: "",
        description: desc.trim(),
        qty: parseFloat(qty),
        unit: unit.toUpperCase(),
        unitPrice: parseNum(rate),
        total: parseNum(total),
        rawLine: row,
      });
      continue;
    }

    // Tab-separated pattern
    const tabParts = row.split("\t").map((s) => s.trim());
    if (tabParts.length >= 5) {
      const desc = tabParts[0] || tabParts[1];
      const qty = parseNum(tabParts[tabParts.length - 4]);
      const unit = tabParts[tabParts.length - 3];
      const unitPrice = parseNum(tabParts[tabParts.length - 2]);
      const total = parseNum(tabParts[tabParts.length - 1]);
      if (qty > 0 && total > 0) {
        result.lineItems.push({
          categoryCode: "",
          activityCode: "",
          description: desc,
          qty,
          unit: unit.toUpperCase(),
          unitPrice,
          total,
          rawLine: row,
        });
        continue;
      }
    }

    // If no pattern matched and the row has substance, mark as unparsed
    if (row.trim().length > 5 && !/^[-=_]+$/.test(row.trim())) {
      result.unparsedRows.push(row);
    }
  }

  computeTotals(result);
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyResult(format: XactimateParseResult["format"]): XactimateParseResult {
  return {
    lineItems: [],
    subtotal: 0,
    overheadAndProfit: 0,
    tax: 0,
    grandTotal: 0,
    metadata: {},
    unparsedRows: [],
    format,
  };
}

function parseNum(val: string | null | undefined): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[,$]/g, "")) || 0;
}

function extractTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const ch of row) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function buildColumnMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().replace(/[^a-z]/g, "");
    if (/cat/.test(h)) map.category = i;
    if (/sel|activity|code/.test(h)) map.activity = i;
    if (/desc/.test(h)) map.description = i;
    if (/qty|quantity/.test(h)) map.qty = i;
    if (/unit(?!p)/.test(h)) map.unit = i;
    if (/price|rate|unitp/.test(h)) map.unitPrice = i;
    if (/total|amount|ext/.test(h)) map.total = i;
    if (/room|area/.test(h)) map.room = i;
  }
  return map;
}

function mapColumnsToLineItem(
  cols: string[],
  colMap: Record<string, number>,
  rawLine: string
): XactimateLineItem | null {
  const get = (key: string) =>
    colMap[key] !== undefined && colMap[key] < cols.length ? cols[colMap[key]] : "";

  const description = get("description");
  if (!description) return null;

  const qty = parseNum(get("qty"));
  const unitPrice = parseNum(get("unitPrice"));
  const total = parseNum(get("total")) || qty * unitPrice;

  return {
    categoryCode: (get("category") || "").toUpperCase(),
    activityCode: (get("activity") || "").toUpperCase(),
    description,
    qty: qty || 1,
    unit: (get("unit") || "EA").toUpperCase(),
    unitPrice,
    total,
    room: get("room") || undefined,
    rawLine,
  };
}

function extractMetadata(row: string, meta: XactimateParseResult["metadata"]): void {
  const claimMatch = row.match(/claim\s*(?:#|number|no\.?)\s*[:\s]*(\S+)/i);
  if (claimMatch) meta.claimNumber = claimMatch[1];

  const insuredMatch = row.match(/insured\s*(?:name)?\s*[:\s]*(.+)/i);
  if (insuredMatch) meta.insuredName = insuredMatch[1].trim();

  const dolMatch = row.match(/date\s*of\s*loss\s*[:\s]*(.+)/i);
  if (dolMatch) meta.dateOfLoss = dolMatch[1].trim();

  const policyMatch = row.match(/policy\s*(?:#|number|no\.?)\s*[:\s]*(\S+)/i);
  if (policyMatch) meta.policyNumber = policyMatch[1];

  const carrierMatch = row.match(/carrier\s*[:\s]*(.+)/i);
  if (carrierMatch) meta.carrier = carrierMatch[1].trim();
}

function computeTotals(result: XactimateParseResult): void {
  if (result.subtotal === 0) {
    result.subtotal = result.lineItems.reduce((s, i) => s + i.total, 0);
  }
  if (result.grandTotal === 0) {
    result.grandTotal = result.subtotal + result.overheadAndProfit + result.tax;
  }
}
