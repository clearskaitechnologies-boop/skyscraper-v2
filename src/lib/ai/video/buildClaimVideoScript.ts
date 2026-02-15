// lib/ai/video/buildClaimVideoScript.ts

import { ensureOpenAI } from "@/lib/ai/client";
import { ReportData } from "@/lib/reports/types";

const openai = ensureOpenAI();

export async function buildClaimVideoScript(data: ReportData) {
  const prompt = `
Generate a professional insurance claim video script using this data:

CLAIM INFORMATION:
- Client: ${data.claim.clientName}
- Property: ${data.claim.propertyAddress}
- Claim #: ${data.claim.claimNumber || "N/A"}
- Date of Loss: ${data.claim.dateOfLoss ? new Date(data.claim.dateOfLoss).toLocaleDateString() : "N/A"}
- Cause: ${data.claim.causeOfLoss || "N/A"}

WEATHER DATA:
${data.weather?.quickDol ? `
- Event Date: ${data.weather.quickDol.eventDate}
- Peril: ${data.weather.quickDol.peril}
- Hail Size: ${data.weather.quickDol.hailSizeInches}" 
- Wind Speed: ${data.weather.quickDol.windSpeedMph} mph
` : "No weather data available"}

DAMAGE ASSESSMENT:
${data.damage?.photos.length || 0} photos analyzed with AI
${data.damage?.photos.map(p => `- ${p.location}: ${p.severity} ${p.component} damage (${p.causeTag})`).join('\n') || "No damage photos"}

MATERIALS:
${data.materials?.primarySystemName || "Not specified"}
${data.materials?.primaryColorName || ""}

Create a 60-90 second video script with:
1. Opening (company intro + claim overview)
2. Weather verification summary
3. Damage findings
4. Recommended materials
5. Timeline expectations
6. Call to action

Format as JSON:
{
  "scenes": [
    {
      "duration": 10,
      "narration": "text",
      "visualPrompt": "description for AI video generation",
      "onScreenText": "key point"
    }
  ],
  "totalDuration": 90
}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const script = JSON.parse(res.choices[0].message.content || "{}");
  return script;
}
