"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
const axios_1 = __importDefault(require("axios"));
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Product Brochures");
  const brochures = data.brochureUrls || []; // from vendor APIs / Trades Network
  if (!brochures.length) {
    const f = await page.doc.embedFont("Helvetica");
    page.drawText("Vendor brochures will appear here when selected.", {
      x: 40,
      y: 680,
      size: 12,
      font: f,
    });
    await (0, index_1.drawFooter)(page, branding);
    return;
  }
  let y = 680;
  for (const url of brochures.slice(0, 4)) {
    try {
      const res = await axios_1.default.get(url, { responseType: "arraybuffer" });
      const imgBytes = new Uint8Array(res.data);
      const img = url.endsWith(".png")
        ? await page.doc.embedPng(imgBytes)
        : await page.doc.embedJpg(imgBytes);
      const w = 250,
        h = 160;
      page.drawImage(img, { x: 40, y, width: w, height: h });
      y -= h + 20;
      if (y < 120) break;
    } catch {}
  }
  await (0, index_1.drawFooter)(page, branding);
}
