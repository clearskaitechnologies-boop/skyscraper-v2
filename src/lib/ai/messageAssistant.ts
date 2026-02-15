import OpenAI from "openai";
const client = process.env.OPENAI_KEY ? new OpenAI({ apiKey: process.env.OPENAI_KEY }) : null;

export async function aiDraftReply(claimData: any) {
  if (!client) return "AI unavailable";
  const prompt = `You are a claims coordinator. Draft a short, friendly update for the homeowner based on this claim JSON:\n${JSON.stringify(claimData, null, 2)}`;
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content?.trim() || "Update pending.";
}