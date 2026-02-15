import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Weather Verification");
  const w = data.weather || { dol: "07/21/2024", hail: '2.0"', wind: "65 mph" };
  const text = `Date of Loss: ${w.dol}\nHail Size: ${w.hail}\nWind Gusts: ${
    w.wind
  }\n\nAI Summary:\n${data.weatherSummary || "N/A"}`;
  await drawBodyText(page, text);
  await drawFooter(page, branding);
}
