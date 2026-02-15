"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Cash / Finance Agreement");
  const finance = data.finance || {
    paymentType: "Financed",
    provider: "Synchrony / Wisetack (example)",
    terms: "12–60 months available; no prepayment penalty",
    downPayment: "Varies",
  };
  const text = `Payment Type: ${finance.paymentType}
Provider: ${finance.provider}
Terms: ${finance.terms}
Down Payment: ${finance.downPayment}

By signing below, the Customer agrees to the project scope, agreed pricing, scheduling, and payment terms.`;
  await (0, index_1.drawBodyText)(page, text);
  const f = await page.doc.embedFont("Helvetica");
  page.drawText("Customer Signature: ________________________  Date: ___________", {
    x: 40,
    y: 100,
    size: 11,
    font: f,
  });
  await (0, index_1.drawFooter)(page, branding);
}
