import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Code Compliance");
  await drawBodyText(
    page,
    data.codes ||
      "IRC R905.1.2 – Ice & Water Protection\nLocal City Ordinance 12-45 Roof Deck Fastening..."
  );
  await drawFooter(page, branding);
}
