import axios from "axios";
import { PDFPage, rgb, StandardFonts } from "pdf-lib";

export interface Branding {
  companyName?: string;
  accentColor?: string;
  logoUrl?: string;
  footerNote?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export async function drawHeader(page: PDFPage, branding: Branding, title: string) {
  const { width } = page.getSize();
  const accent = branding.accentColor || "#147BFF";
  const toRGB = (hex: string) => {
    const n = hex.replace("#", "");
    const r = parseInt(n.substring(0, 2), 16) / 255;
    const g = parseInt(n.substring(2, 4), 16) / 255;
    const b = parseInt(n.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  };
  page.drawRectangle({ x: 0, y: 742, width, height: 50, color: toRGB(accent) });
  const font = await page.doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText(title, { x: 40, y: 760, size: 18, font, color: rgb(1, 1, 1) });
  if (branding.logoUrl) {
    try {
      const res = await axios.get(branding.logoUrl, {
        responseType: "arraybuffer",
      });
      const imgBytes = new Uint8Array(res.data);
      const img = branding.logoUrl.endsWith(".png")
        ? await page.doc.embedPng(imgBytes)
        : await page.doc.embedJpg(imgBytes);
      const imgW = 100;
      const imgH = (img.height / img.width) * imgW;
      page.drawImage(img, {
        x: width - imgW - 40,
        y: 745,
        width: imgW,
        height: imgH,
      });
    } catch {}
  }
}

export async function drawFooter(page: PDFPage, branding: Branding) {
  const font = await page.doc.embedFont(StandardFonts.Helvetica);
  page.drawText(branding.footerNote || "", {
    x: 40,
    y: 30,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
}

export function wrap(text: string, max = 90) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line += " " + w;
  }
  if (line) lines.push(line.trim());
  return lines;
}

export async function drawBodyText(page: PDFPage, text: string, yStart = 700) {
  const font = await page.doc.embedFont(StandardFonts.Helvetica);
  let y = yStart;
  for (const line of wrap(text, 100)) {
    page.drawText(line, { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 14;
  }
}
