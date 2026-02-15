"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Client Overview");
  const client = data.client || { name: "", address: "" };
  const font = await page.doc.embedFont("Helvetica-Bold");
  page.drawText(`Client: ${client.name}`, { x: 40, y: 700, size: 14, font });
  page.drawText(`Property: ${client.address}`, {
    x: 40,
    y: 680,
    size: 12,
    font,
  });
  await (0, index_1.drawBodyText)(
    page,
    data.overviewText || "Inspection summary placeholder...",
    650
  );
  await (0, index_1.drawFooter)(page, branding);
}
