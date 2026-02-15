import { drawBodyText,drawFooter, drawHeader } from "./index";

export default async function (page: any, data: any, branding: any) {
  await drawHeader(page, branding, "Material Specifications");
  const specs = data.materialSpecs || {
    system: "Asphalt Shingle – Class 4 Impact Resistant",
    manufacturer: "GAF Timberline HDZ",
    color: "Charcoal",
    underlayment: "Synthetic + Ice & Water Shield in valleys/eaves",
    ventilation: "Ridge vent w/ matching caps",
    accessories: "Starter, drip edge, pipe jacks, valley metal",
  };
  const blocks = [
    `System: ${specs.system}`,
    `Manufacturer: ${specs.manufacturer}`,
    `Color: ${specs.color}`,
    `Underlayment: ${specs.underlayment}`,
    `Ventilation: ${specs.ventilation}`,
    `Accessories: ${specs.accessories}`,
  ].join("\n");
  await drawBodyText(page, blocks);
  await drawFooter(page, branding);
}
