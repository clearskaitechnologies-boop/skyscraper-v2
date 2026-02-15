"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Project Timeline");
  const text =
    "• Claim Filed → Adjuster Inspection → Approval\n• Material Delivery → Build Start → Completion → Final Inspection";
  await (0, index_1.drawBodyText)(page, text);
  await (0, index_1.drawFooter)(page, branding);
}
