"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Project Estimate");
  const fontR = await page.doc.embedFont("Helvetica");
  const fontB = await page.doc.embedFont("Helvetica-Bold");
  // Expect an array of line items with qty * price
  const items = data.estimate?.items || [
    {
      code: "RFG 300",
      desc: "Remove & Replace Shingles (SQ)",
      qty: 28.5,
      price: 345.0,
    },
    { code: "RFG 220", desc: "Starter Course (LF)", qty: 280, price: 2.6 },
    { code: "RFG 221", desc: "Ridge Cap (LF)", qty: 160, price: 4.25 },
  ];
  let y = 700;
  page.drawText("Code", { x: 40, y, size: 11, font: fontB });
  page.drawText("Description", { x: 120, y, size: 11, font: fontB });
  page.drawText("Qty", { x: 420, y, size: 11, font: fontB });
  page.drawText("Price", { x: 470, y, size: 11, font: fontB });
  page.drawText("Total", { x: 520, y, size: 11, font: fontB });
  y -= 16;
  let subtotal = 0;
  for (const it of items) {
    const total = Math.round(it.qty * it.price * 100) / 100;
    subtotal += total;
    page.drawText(it.code, { x: 40, y, size: 10, font: fontR });
    page.drawText(it.desc, { x: 120, y, size: 10, font: fontR });
    page.drawText(String(it.qty), { x: 420, y, size: 10, font: fontR });
    page.drawText(`$${it.price.toFixed(2)}`, {
      x: 470,
      y,
      size: 10,
      font: fontR,
    });
    page.drawText(`$${total.toFixed(2)}`, { x: 520, y, size: 10, font: fontR });
    y -= 14;
    if (y < 120) break;
  }
  const taxRate = data.estimate?.taxRate ?? 0.0;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const grand = Math.round((subtotal + tax) * 100) / 100;
  y -= 10;
  page.drawText(`Subtotal: $${subtotal.toFixed(2)}`, {
    x: 420,
    y,
    size: 11,
    font: fontB,
  });
  y -= 16;
  page.drawText(`Tax (${(taxRate * 100).toFixed(1)}%): $${tax.toFixed(2)}`, {
    x: 420,
    y,
    size: 11,
    font: fontB,
  });
  y -= 16;
  page.drawText(`Grand Total: $${grand.toFixed(2)}`, {
    x: 420,
    y,
    size: 12,
    font: fontB,
  });
  await (0, index_1.drawFooter)(page, branding);
}
