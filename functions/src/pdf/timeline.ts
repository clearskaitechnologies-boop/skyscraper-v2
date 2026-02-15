import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Project Timeline");
  const text =
    "• Claim Filed → Adjuster Inspection → Approval\n• Material Delivery → Build Start → Completion → Final Inspection";
  await drawBodyText(page, text);
  await drawFooter(page, branding);
}
