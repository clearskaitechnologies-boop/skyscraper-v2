"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawHeader = drawHeader;
exports.drawFooter = drawFooter;
exports.wrap = wrap;
exports.drawBodyText = drawBodyText;
const pdf_lib_1 = require("pdf-lib");
const axios_1 = __importDefault(require("axios"));
async function drawHeader(page, branding, title) {
  const { width } = page.getSize();
  const accent = branding.accentColor || "#147BFF";
  const toRGB = (hex) => {
    const n = hex.replace("#", "");
    const r = parseInt(n.substring(0, 2), 16) / 255;
    const g = parseInt(n.substring(2, 4), 16) / 255;
    const b = parseInt(n.substring(4, 6), 16) / 255;
    return (0, pdf_lib_1.rgb)(r, g, b);
  };
  page.drawRectangle({ x: 0, y: 742, width, height: 50, color: toRGB(accent) });
  const font = await page.doc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
  page.drawText(title, { x: 40, y: 760, size: 18, font, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
  if (branding.logoUrl) {
    try {
      const res = await axios_1.default.get(branding.logoUrl, {
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
async function drawFooter(page, branding) {
  const font = await page.doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
  page.drawText(branding.footerNote || "", {
    x: 40,
    y: 30,
    size: 10,
    font,
    color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
  });
}
function wrap(text, max = 90) {
  const words = text.split(/\s+/);
  const lines = [];
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
async function drawBodyText(page, text, yStart = 700) {
  const font = await page.doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
  let y = yStart;
  for (const line of wrap(text, 100)) {
    page.drawText(line, { x: 40, y, size: 11, font, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
    y -= 14;
  }
}
