import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Damage Report");
  const txt =
    data.damageText ||
    "• Hail impacts circled in annotated photos.\n• Wind-lifted tabs and missing shingles detected.\n• Tile cracks and fractures noted.";
  await drawBodyText(page, txt);
  await drawFooter(page, branding);
}
