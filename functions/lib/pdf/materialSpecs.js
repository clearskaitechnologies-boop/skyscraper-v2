"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Material Specifications");
  const specs = data.materialSpecs || {
    system: "Asphalt Shingle – Class 4 Impact Resistant",
    manufacturer: "GAF Timberline HDZ",
    color: "Charcoal",
    underlayment: "Synthetic + Ice & Water Shield in valleys/eaves",
    ventilation: "Ridge vent w/ matching caps",
    accessories: "Starter, drip edge, pipe jacks, valley metal",
  };
  const blocks = [
    `System: ${specs.system}`,
    `Manufacturer: ${specs.manufacturer}`,
    `Color: ${specs.color}`,
    `Underlayment: ${specs.underlayment}`,
    `Ventilation: ${specs.ventilation}`,
    `Accessories: ${specs.accessories}`,
  ].join("\n");
  await (0, index_1.drawBodyText)(page, blocks);
  await (0, index_1.drawFooter)(page, branding);
}
