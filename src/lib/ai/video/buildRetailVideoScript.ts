// lib/ai/video/buildRetailVideoScript.ts

import { ensureOpenAI } from "@/lib/ai/client";
import { ReportData } from "@/lib/reports/types";

const openai = ensureOpenAI();

export async function buildRetailVideoScript(data: ReportData) {
  const prompt = `
Generate a homeowner-friendly retail proposal video script using this data:

PROPERTY OWNER:
${data.claim.clientName}
${data.claim.propertyAddress}

COMPANY:
${data.org.name}
${data.org.slogan || ""}

FINDINGS:
${data.damage?.photos.length || 0} areas inspected
${data.damage?.photos.map(p => `- ${p.location}: ${p.recommendation}`).join('\n') || "No findings"}

MATERIALS PROPOSED:
${data.materials?.primarySystemName || "Premium roofing system"}
${data.materials?.primaryColorName || ""}

WARRANTY:
${data.warranty?.optionName || "Comprehensive warranty"}
${data.warranty?.durationYears || "10"} years

Create a friendly 60-90 second video script with:
1. Warm introduction
2. What we found at their property
3. Our solution (materials + quality)
4. Warranty & timeline
5. Next steps

Format as JSON:
{
  "scenes": [
    {
      "duration": 10,
      "narration": "friendly text",
      "visualPrompt": "description for AI video generation",
      "onScreenText": "key point"
    }
  ],
  "totalDuration": 90
}

Keep language simple, positive, and homeowner-focused.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const script = JSON.parse(res.choices[0].message.content || "{}");
  return script;
}
