import axios from "axios";

import { drawFooter,drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "AI Property Mockup");
  if (data.mockupUrl) {
    const res = await axios.get(data.mockupUrl, {
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
  await drawFooter(page, branding);
}
