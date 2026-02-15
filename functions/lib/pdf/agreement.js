"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Service Agreement");
  const txt =
    data.agreementText ||
    "By signing below, the homeowner authorizes the contractor to perform the agreed-upon restoration services...";
  await (0, index_1.drawBodyText)(page, txt);
  await (0, index_1.drawFooter)(page, branding);
}
