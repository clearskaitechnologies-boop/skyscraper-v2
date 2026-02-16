import { getOpenAI } from "@/lib/ai/client";

export async function classifyDocument({ text }: { url?: string; text?: string }) {
  const client = getOpenAI();
  const prompt = `You are an insurance claims AI. Classify this document into one category:
insurance_letter | estimate | supplement | denial_letter | approval_letter | invoice | damage_photos | weather_report | inspection | adjuster_summary | other

Text:\n${text || "No text available."}`;
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content?.trim() || "other";
}