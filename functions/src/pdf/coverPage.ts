import { drawFooter,drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, branding.companyName || "Inspection Report");
  const font = await page.doc.embedFont("Helvetica");
  page.drawText(branding.companyName || "", { x: 40, y: 680, size: 24, font });
  page.drawText(branding.address || "", { x: 40, y: 650, size: 12, font });
  page.drawText(branding.phone || "", { x: 40, y: 635, size: 12, font });
  page.drawText(branding.email || "", { x: 40, y: 620, size: 12, font });
  await drawFooter(page, branding);
}
