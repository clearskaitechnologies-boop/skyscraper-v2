import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Client Overview");
  const client = data.client || { name: "", address: "" };
  const font = await page.doc.embedFont("Helvetica-Bold");
  page.drawText(`Client: ${client.name}`, { x: 40, y: 700, size: 14, font });
  page.drawText(`Property: ${client.address}`, {
    x: 40,
    y: 680,
    size: 12,
    font,
  });
  await drawBodyText(page, data.overviewText || "Inspection summary placeholder...", 650);
  await drawFooter(page, branding);
}
