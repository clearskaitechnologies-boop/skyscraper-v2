"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./index");
const axios_1 = __importDefault(require("axios"));
async function default_1(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, "AI Property Mockup");
  if (data.mockupUrl) {
    const res = await axios_1.default.get(data.mockupUrl, {
      responseType: "arraybuffer",
    });
    const imgBytes = new Uint8Array(res.data);
    const img = data.mockupUrl.endsWith(".png")
      ? await page.doc.embedPng(imgBytes)
      : await page.doc.embedJpg(imgBytes);
    page.drawImage(img, { x: 40, y: 120, width: 520, height: 400 });
  } else {
    const font = await page.doc.embedFont("Helvetica");
    page.drawText("Mockup placeholder – image will appear here.", {
      x: 40,
      y: 400,
      size: 14,
      font,
    });
  }
  await (0, index_1.drawFooter)(page, branding);
}
