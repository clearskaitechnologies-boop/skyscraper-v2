"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "Weather Verification");
  const w = data.weather || { dol: "07/21/2024", hail: '2.0"', wind: "65 mph" };
  const text = `Date of Loss: ${w.dol}\nHail Size: ${w.hail}\nWind Gusts: ${w.wind}\n\nAI Summary:\n${data.weatherSummary || "N/A"}`;
  await (0, index_1.drawBodyText)(page, text);
  await (0, index_1.drawFooter)(page, branding);
}
