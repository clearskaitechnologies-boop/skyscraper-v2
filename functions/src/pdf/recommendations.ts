import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Contractor Recommendations");
  await drawBodyText(
    page,
    data.recommendations ||
      "AI conclusion: Roof replacement recommended due to extensive wind and hail damage. Contractor sign-off required."
  );
  await drawFooter(page, branding);
}
