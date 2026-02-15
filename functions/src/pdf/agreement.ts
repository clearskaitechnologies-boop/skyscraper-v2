import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Service Agreement");
  const txt =
    data.agreementText ||
    "By signing below, the homeowner authorizes the contractor to perform the agreed-upon restoration services...";
  await drawBodyText(page, txt);
  await drawFooter(page, branding);
}
