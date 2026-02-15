export function damageBuilderPrompt(input: {
  address: string;
  dateOfLoss: string;
  roofType: string;
  roofSqft: number;
  materials?: string | null;
  windSpeed?: string | null;
  hailSize?: string | null;
  notes?: string | null;
}) {
  const { address, dateOfLoss, roofType, roofSqft, materials, windSpeed, hailSize, notes } = input;

  return `
You are an expert roofing estimator. Produce a JSON object with keys:
- "summary": 3-6 bullet points describing observed damage and cause (wind/hail).
- "scope": array of line items {code, description, quantity, unit, notes}.
- "codes": array of building code citations {jurisdiction, reference, note} relevant to ${roofType}.
- "materials": list of materials and quantities.
- "safety": bullet list of safety considerations.
- "assumptions": bullet list of assumptions used.

Project Context:
- Address: ${address}
- Date of Loss: ${dateOfLoss}
- Roof Type: ${roofType}
- Roof Sqft: ${roofSqft}
- Materials/Pitch: ${materials || "n/a"}
- Max Wind: ${windSpeed || "n/a"} mph
- Hail Size: ${hailSize || "n/a"} in
- Notes: ${notes || "n/a"}

Output strictly valid JSON. No markdown. Keep quantities realistic for ${roofSqft} sqft.
Use generic line item codes (e.g., DEMO, DECK, SHING, FLASH, VENT) if no local code system is specified.
`;
}
