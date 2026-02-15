import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Inspection Summary");
  await drawBodyText(page, data.summary || "AI-generated inspection details will appear here.");
  await drawFooter(page, branding);
}
