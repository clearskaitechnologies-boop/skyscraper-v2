/**
 * Convert HTML superscripts to Markdown footnotes
 */
import type { Citation } from "@/lib/citations";

const SUP_TO_NUM: Record<string, string> = {
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "¹⁰": "10",
};

function stripHtmlKeepSup(html: string): string {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/?(div|p|section|figure|figcaption|span|strong|em|pre|code)[^>]*>/gi, "")
    .replace(/<\/?h[1-6][^>]*>/gi, "\n")
    .replace(/<img [^>]*>/gi, "");
}

export function htmlSuperscriptsToMarkdown(
  summaryHtml: string,
  citations: Citation[],
  heading = "Summary"
): string {
  // 1) Normalize to text but keep sup content
  let s = stripHtmlKeepSup(summaryHtml || "");

  // 2) Convert <sup>…</sup> to [^n]
  s = s.replace(/<\s*sup[^>]*>(.*?)<\s*\/\s*sup>/gi, (_m, inner) => {
    const val = String(inner).trim();
    const num = SUP_TO_NUM[val] || val.replace(/[^0-9]/g, "") || "1";
    return `[^${num}]`;
  });

  // 3) Tidy whitespace
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  // 4) Build footnotes list from citations order
  const foot = (citations || [])
    .map((c, i) => {
      const n = i + 1;
      const parts = [`[^${n}]: ${c.label}`];
      if (c.source) parts.push(`— ${c.source}`);
      if (c.url) parts.push(`\n    ${c.url}`);
      if (c.retrievedAt) {
        parts.push(` (retrieved ${new Date(c.retrievedAt).toLocaleDateString()})`);
      }
      return parts.join("");
    })
    .join("\n");

  const md = `## ${heading}\n\n${s}\n\n${foot ? "---\n\n### References\n" + foot : ""}`;
  return md;
}
