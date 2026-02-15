"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Inspection Summary");
  await (0, index_1.drawBodyText)(
    page,
    data.summary || "AI-generated inspection details will appear here."
  );
  await (0, index_1.drawFooter)(page, branding);
}
