"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Damage Report");
  const txt =
    data.damageText ||
    "• Hail impacts circled in annotated photos.\n• Wind-lifted tabs and missing shingles detected.\n• Tile cracks and fractures noted.";
  await (0, index_1.drawBodyText)(page, txt);
  await (0, index_1.drawFooter)(page, branding);
}
