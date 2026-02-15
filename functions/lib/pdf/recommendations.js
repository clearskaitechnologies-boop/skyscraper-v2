"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Contractor Recommendations");
  await (0, index_1.drawBodyText)(
    page,
    data.recommendations ||
      "AI conclusion: Roof replacement recommended due to extensive wind and hail damage. Contractor sign-off required."
  );
  await (0, index_1.drawFooter)(page, branding);
}
