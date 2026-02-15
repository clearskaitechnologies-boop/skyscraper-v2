"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Code Compliance");
  await (0, index_1.drawBodyText)(
    page,
    data.codes ||
      "IRC R905.1.2 – Ice & Water Protection\nLocal City Ordinance 12-45 Roof Deck Fastening..."
  );
  await (0, index_1.drawFooter)(page, branding);
}
