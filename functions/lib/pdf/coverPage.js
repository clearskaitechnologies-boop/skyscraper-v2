"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, branding.companyName || "Inspection Report");
  const font = await page.doc.embedFont("Helvetica");
  page.drawText(branding.companyName || "", { x: 40, y: 680, size: 24, font });
  page.drawText(branding.address || "", { x: 40, y: 650, size: 12, font });
  page.drawText(branding.phone || "", { x: 40, y: 635, size: 12, font });
  page.drawText(branding.email || "", { x: 40, y: 620, size: 12, font });
  await (0, index_1.drawFooter)(page, branding);
}
