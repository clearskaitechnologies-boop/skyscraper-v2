import axios from "axios";

import { drawFooter,drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Product Brochures");
  const brochures: string[] = data.brochureUrls || []; // from vendor APIs / Trades Network
  if (!brochures.length) {
    const f = await page.doc.embedFont("Helvetica");
    page.drawText("Vendor brochures will appear here when selected.", {
      x: 40,
      y: 680,
      size: 12,
      font: f,
    });
    await drawFooter(page, branding);
    return;
  }
  let y = 680;
  for (const url of brochures.slice(0, 4)) {
    try {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      const imgBytes = new Uint8Array(res.data);
      const img = url.endsWith(".png")
        ? await page.doc.embedPng(imgBytes)
        : await page.doc.embedJpg(imgBytes);
      const w = 250,
        h = 160;
      page.drawImage(img, { x: 40, y, width: w, height: h });
      y -= h + 20;
      if (y < 120) break;
    } catch {}
  }
  await drawFooter(page, branding);
}
